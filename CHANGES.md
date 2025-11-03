# 変更内容: SQLite移行 & 認証削除

## 概要

ログイン機能を削除し、MySQLからSQLiteに変更しました。これにより、オーナー専用のシンプルな在庫管理アプリケーションになりました。

## 主な変更点

### 1. データベース: MySQL → SQLite

- **スキーマ変更** (`drizzle/schema.ts`)
  - `mysqlTable` → `sqliteTable`
  - `int().autoincrement()` → `integer().primaryKey({ autoIncrement: true })`
  - `mysqlEnum` → `text`（SQLiteではENUMがサポートされていないため）
  - `timestamp()` → `integer(..., { mode: "timestamp" })`
  - `.onUpdateNow()` → 削除（SQLiteでは関数で実装が必要）

- **DB接続変更** (`server/db.ts`)
  - `drizzle-orm/mysql2` → `drizzle-orm/better-sqlite3`
  - `mysql2` → `better-sqlite3`

- **設定変更** (`drizzle.config.ts`)
  - `dialect: "mysql"` → `dialect: "sqlite"`
  - デフォルトDBパス: `./data/salon-inventory.db`

### 2. 認証システムの削除

- **削除したファイル**
  - `server/_core/oauth.ts` - OAuth認証ルート
  - `server/_core/sdk.ts` - Manus SDK（必要に応じて削除可能）

- **簡素化したファイル**
  - `server/_core/context.ts` - 常にオーナーユーザーを返す
  - `server/_core/trpc.ts` - `protectedProcedure`を`publicProcedure`のエイリアスに
  - `server/routers.ts` - `auth`ルーターを削除
  - `client/src/_core/hooks/useAuth.ts` - 常に認証済みとして扱う

- **フロントエンド変更**
  - ログイン画面を削除
  - `useAuth()`の`enabled`オプションを削除
  - ログアウト機能を削除

### 3. 環境変数の簡素化

- **削除**
  - `VITE_APP_ID`
  - `JWT_SECRET`
  - `OAUTH_SERVER_URL`
  - `VITE_OAUTH_PORTAL_URL`
  - `OWNER_OPEN_ID`
  - `BUILT_IN_FORGE_API_URL`
  - `BUILT_IN_FORGE_API_KEY`

- **残存（オプション）**
  - `DATABASE_URL` - データベースパス（デフォルト: `./data/salon-inventory.db`）
  - `NODE_ENV` - 実行環境
  - `PORT` - サーバーポート（デフォルト: 3000）

### 4. パッケージの変更

**追加:**
- `better-sqlite3@^11.0.0`
- `@types/better-sqlite3@^7.6.11`

**削除:**
- `mysql2@^3.15.0`
- Manus関連の依存パッケージ（一部は残存）

## 使用方法

### インストール

```bash
pnpm install
```

### データベース初期化

```bash
pnpm db:push
```

### 開発サーバー起動

```bash
pnpm dev
```

### 本番ビルド

```bash
pnpm build
pnpm start
```

## 注意事項

1. **認証なし**: アプリケーションは認証機能を持たないため、内部ネットワークやVPN経由でのアクセスのみを推奨
2. **データバックアップ**: SQLiteファイル（`data/salon-inventory.db`）の定期的なバックアップを推奨
3. **既存データ**: MySQLから移行する場合、データの移行が必要です

## データベース構造

- `users` - ユーザーテーブル（オーナーのみ、ID=1）
- `categories` - カテゴリテーブル
- `products` - 商品テーブル
- `orderHistory` - 発注履歴テーブル
- `usageHistory` - 使用履歴テーブル

