import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(
    "/",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
}

