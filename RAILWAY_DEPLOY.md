# Railwayでデプロイする方法

## Railwayの特徴

- **ファイルシステムへの書き込み対応**: SQLiteファイルベースのデータベースをそのまま使用可能
- **コード変更不要**: 現在のコードをそのままデプロイできる
- **無料プランあり**: 開発用途であれば無料で使える

## デプロイ手順

### 1. Railwayアカウント作成

1. [Railway](https://railway.app)にアクセス
2. GitHubアカウントでログイン

### 2. プロジェクトの作成

1. "New Project"をクリック
2. "Deploy from GitHub repo"を選択
3. `nino-0813/biyousitu.yoyaku`を選択

### 3. 環境変数の設定（オプション）

- `DATABASE_URL`: 未設定の場合は `./data/salon-inventory.db` がデフォルト
- `NODE_ENV`: `production`
- `PORT`: Railwayが自動設定

### 4. ビルド設定

Railwayは自動検出しますが、必要に応じて：

- **Start Command**: `npm start`
- **Build Command**: `npm run build`

### 5. データベースの初期化

デプロイ後、Railwayのコンソールから以下を実行：

```bash
npm run db:push
node seed-categories.mjs
```

### 6. デプロイ完了

Railwayが自動的にURLを生成します（例: `https://your-app.railway.app`）

## 注意事項

- ファイルシステムは永続的ですが、コンテナ再起動時にはデータが保持されます
- 定期的なバックアップを推奨します

