# デプロイメントガイド

## ⚠️ 現在の状態

このプロジェクトは**Manusプラットフォーム専用**に構築されています。そのまま個人で公開しても**動作しません**。

## 🚫 動作しない理由

### 1. **Manus OAuth認証に依存**
- ログイン機能はManus OAuthサービスに完全に依存しています
- `OAUTH_SERVER_URL`、`VITE_OAUTH_PORTAL_URL`、`VITE_APP_ID`など、Manus固有の環境変数が必要です
- Manusプラットフォーム外では認証が機能しません

### 2. **必要な環境変数**
以下の環境変数が設定されていないと動作しません：

```bash
# 必須環境変数
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
VITE_APP_ID=manus-app-id
OAUTH_SERVER_URL=https://manus-oauth-server-url
VITE_OAUTH_PORTAL_URL=https://manus-oauth-portal-url
OWNER_OPEN_ID=your-open-id

# オプション
VITE_APP_TITLE=美容室在庫管理システム
VITE_APP_LOGO=https://your-logo-url
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

### 3. **データベースセットアップ**
- MySQL/TiDBデータベースが必要
- マイグレーションファイルの実行が必要
- データベース接続の設定が必要

## ✅ 自分で公開するための選択肢

### 選択肢1: Manusプラットフォーム上で公開（推奨）
- Manusの提供するインフラを使用
- 環境変数が自動設定される
- OAuth認証が自動で動作する
- 最も簡単な方法

### 選択肢2: 認証システムを変更して独自公開
以下の変更が必要です：

1. **認証システムの置き換え**
   - Manus OAuthを削除
   - 別の認証システム（例：NextAuth.js、Auth0、Firebase Auth）を実装
   - セッション管理の再実装

2. **環境変数の設定**
   - `.env`ファイルを作成
   - 必要な環境変数を設定

3. **データベースのセットアップ**
   - MySQLデータベースを用意
   - `pnpm db:push`でスキーマを適用

4. **デプロイ環境の準備**
   - サーバー（VPS、クラウドなど）
   - ドメインの設定
   - SSL証明書の設定

## 📝 必要な手順（選択肢2の場合）

### 1. 環境変数ファイルの作成

`.env`ファイルをルートディレクトリに作成：

```bash
# データベース
DATABASE_URL=mysql://user:password@localhost:3306/salon_inventory

# 認証
JWT_SECRET=your-very-long-random-secret-key-here-minimum-32-characters

# Manus関連（削除または置き換えが必要）
# VITE_APP_ID=
# OAUTH_SERVER_URL=
# VITE_OAUTH_PORTAL_URL=
# OWNER_OPEN_ID=
```

### 2. データベースのセットアップ

```bash
# データベースを作成
mysql -u root -p
CREATE DATABASE salon_inventory;

# マイグレーションの実行
pnpm db:push
```

### 3. 認証システムの実装

Manus OAuthを削除し、別の認証システムを実装する必要があります。これは大幅なコード変更が必要です。

## 🔧 現在のManus依存箇所

以下のファイルがManusに依存しています：

- `server/_core/oauth.ts` - OAuthルーティング
- `server/_core/sdk.ts` - Manus SDK
- `server/_core/env.ts` - 環境変数の定義
- `client/src/const.ts` - ログインURL生成
- `client/src/_core/hooks/useAuth.ts` - 認証フック

これらを置き換える必要があります。

## 💡 推奨事項

**Manusプラットフォームを使用する場合**：
- そのまま使用可能
- 環境変数はManusが自動設定

**独自に公開する場合**：
- 認証システムの大幅な変更が必要
- 開発期間とコストを考慮する必要がある
- セキュリティ対策も自分で実装する必要がある

