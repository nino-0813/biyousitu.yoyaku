import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // 本番環境では process.cwd() を使う（Railwayなどのデプロイ環境に対応）
  let distPath: string;
  
  if (process.env.NODE_ENV === "development") {
    // 開発環境: プロジェクトルートから
    distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  } else {
    // 本番環境: プロジェクトルートからの相対パスを使用
    // Railwayなどでは作業ディレクトリがプロジェクトルートになる
    distPath = path.resolve(process.cwd(), "dist", "public");
    
    // もし見つからない場合、dist/index.js からの相対パスも試す
    if (!fs.existsSync(distPath)) {
      const alternativePath = path.resolve(import.meta.dirname, "public");
      if (fs.existsSync(alternativePath)) {
        distPath = alternativePath;
      }
    }
  }
  
  console.log("[Static] Serving from:", distPath);
  console.log("[Static] Current working directory:", process.cwd());
  console.log("[Static] __dirname:", import.meta.dirname);
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    // エラーでも続行（APIのみ動作）
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Not found");
    }
  });
}
