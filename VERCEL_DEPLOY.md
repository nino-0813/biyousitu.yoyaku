# Vercelデプロイガイド

## ⚠️ 重要な注意事項

**Vercelはサーバーレス環境のため、SQLiteファイルベースのデータベースは使用できません。**

以下の選択肢があります：

### オプション1: Turso（推奨）
TursoはSQLite互換のサーバーレスデータベースです。

1. [Turso](https://turso.tech)でアカウント作成
2. データベースを作成
3. Vercel環境変数に`DATABASE_URL`を設定（Tursoの接続文字列）

### オプション2: Vercel Postgres
PostgreSQLを使用する場合：

1. VercelダッシュボードでPostgresデータベースを作成
2. スキーマをPostgreSQL用に変更
3. マイグレーションを実行

### オプション3: 別のホスティングサービス
SQLiteを使い続ける場合：
- Railway
- Render
- Fly.io
など、ファイルシステムにアクセスできるホスティングサービスを使用

## 現在の設定

現在のプロジェクトはSQLiteを使用していますが、Vercelでデプロイするにはデータベースを変更する必要があります。

## デプロイ手順（Tursoを使用する場合）

1. Tursoでデータベースを作成
2. 接続文字列を取得
3. Vercelの環境変数に設定：
   - `DATABASE_URL`: Tursoの接続文字列（`libsql://...`形式）
4. デプロイ

## ビルド設定

Vercelでは以下のビルドコマンドが実行されます：
- `npm run build`: クライアントとサーバーの両方をビルド

## 環境変数

Vercelダッシュボードで以下の環境変数を設定：
- `DATABASE_URL`: データベース接続文字列（必須）
- `NODE_ENV`: `production`（自動設定）

