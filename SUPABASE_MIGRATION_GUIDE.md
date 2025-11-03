# Supabase移行ガイド

## 📋 概要

このプロジェクトをSupabaseで公開する場合、**以下の大幅な変更が必要**です：

1. **データベース**: MySQL → PostgreSQL
2. **認証**: Manus OAuth → Supabase Auth
3. **スキーマ定義**: MySQL用 → PostgreSQL用
4. **依存パッケージ**: mysql2 → postgres

## 🔄 必要な変更点

### 1. パッケージの変更

`package.json`を更新：

```json
{
  "dependencies": {
    // 削除
    // "mysql2": "^3.15.0",
    
    // 追加
    "@supabase/supabase-js": "^2.39.0",
    "postgres": "^3.4.3",
    // または
    // "pg": "^8.11.3"
  }
}
```

### 2. データベーススキーマの変更

`drizzle/schema.ts`をMySQL用からPostgreSQL用に変更：

**変更前（MySQL）:**
```typescript
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // ...
});
```

**変更後（PostgreSQL）:**
```typescript
import { pgTable, serial, text, timestamp, varchar, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { mode: "date" }).defaultNow().notNull(),
});
```

**主な変更点:**
- `mysqlTable` → `pgTable`
- `int().autoincrement()` → `serial()`
- `mysqlEnum` → `pgEnum`
- `int()` → `integer()`
- `timestamp()` → `timestamp(..., { mode: "date" })`
- `.onUpdateNow()` → PostgreSQLでは関数で実装が必要

### 3. データベース接続の変更

`server/db.ts`を変更：

**変更前:**
```typescript
import { drizzle } from "drizzle-orm/mysql2";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}
```

**変更後:**
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _db: ReturnType<typeof drizzle> | null = null;
let _connection: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    const connectionString = process.env.DATABASE_URL;
    _connection = postgres(connectionString);
    _db = drizzle(_connection);
  }
  return _db;
}
```

### 4. Drizzle設定の変更

`drizzle.config.ts`を変更：

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // "mysql" → "postgresql"に変更
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 5. 認証システムの完全書き換え

#### 5.1 Supabaseクライアントの設定

`server/_core/supabase.ts`を新規作成：

```typescript
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export const supabase = createClient(
  ENV.supabaseUrl,
  ENV.supabaseAnonKey
);
```

#### 5.2 環境変数の変更

`server/_core/env.ts`を変更：

```typescript
export const ENV = {
  // Manus関連を削除
  // appId: process.env.VITE_APP_ID ?? "",
  // oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  // ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Supabase関連を追加
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  
  // その他
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
```

#### 5.3 OAuthルートの書き換え

`server/_core/oauth.ts`をSupabase Auth用に書き換え：

```typescript
import type { Express, Request, Response } from "express";
import { supabase } from "./supabase";
import * as db from "../db";

export function registerOAuthRoutes(app: Express) {
  // Supabase Authを使用する場合、フロントエンド側で直接Supabaseクライアントを使う
  // バックエンドはセッション検証のみ
  
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    // Supabase Authのコールバック処理
    // ...
  });
}
```

#### 5.4 認証コンテキストの変更

`server/_core/context.ts`を変更：

```typescript
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "./supabase";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Supabaseセッションからユーザーを取得
    const token = opts.req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser(token);
      if (supabaseUser) {
        user = await db.getUserById(supabaseUser.id);
        // 存在しない場合は作成
        if (!user) {
          await db.upsertUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || null,
          });
          user = await db.getUserById(supabaseUser.id);
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

#### 5.5 フロントエンド認証の変更

`client/src/_core/hooks/useAuth.ts`をSupabase Auth用に書き換え：

```typescript
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: async () => {
      await supabase.auth.signOut();
    },
  };
}
```

#### 5.6 ログインURLの変更

`client/src/const.ts`を変更：

```typescript
export const getLoginUrl = () => {
  // Supabase Authを使用する場合、フロントエンドで直接サインイン処理を行う
  return "/login";
};
```

### 6. 環境変数の設定

`.env`ファイルを作成：

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# データベース（Supabaseの接続文字列）
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# 認証
JWT_SECRET=your-secret-key

# その他
NODE_ENV=production
PORT=3000
```

### 7. データベースのマイグレーション

```bash
# PostgreSQLに変更後、マイグレーションを再生成
pnpm db:push

# または
drizzle-kit generate
drizzle-kit migrate
```

### 8. ユーザーテーブルの変更

Supabase Authを使用する場合、`users`テーブルの設計を変更：

```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // SupabaseのユーザーIDを使用
  email: varchar("email", { length: 320 }),
  name: text("name"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { mode: "date" }).defaultNow().notNull(),
});
```

`openId`フィールドは不要になります（SupabaseのユーザーIDを使用）。

## ⚠️ 注意点

1. **データ移行**: 既存のMySQLデータがある場合、PostgreSQLへの移行が必要
2. **認証フローの完全書き換え**: Manus OAuthからSupabase Authへの移行は大規模な変更
3. **セッション管理**: Supabase Authは独自のセッション管理を使用
4. **型定義**: TypeScript型も大幅に変更が必要
5. **テスト**: すべての機能を再テストする必要がある

## 📝 作業手順（推奨）

1. Supabaseプロジェクトを作成
2. データベーススキーマをPostgreSQL用に変更
3. 認証システムをSupabase Authに置き換え
4. フロントエンドの認証フローを変更
5. 環境変数を設定
6. マイグレーションを実行
7. テストとデバッグ

## 💡 代替案

**簡単な方法:**
- Supabase Authを使わず、既存のMySQLデータベースを使用
- 認証のみSupabase Authを使用し、データベースは別途用意
- ただし、Supabaseの最大のメリット（統合されたAuth + DB）は失われる

