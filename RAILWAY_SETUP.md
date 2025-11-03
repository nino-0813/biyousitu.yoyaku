# Railway デプロイ後のセットアップ手順

## 1. データベースの初期化

RailwayのコンソールまたはCLIから以下を実行：

```bash
# データベースマイグレーションの実行
npm run db:push

# カテゴリーの初期データ投入
node seed-categories.mjs
```

## 2. Railwayコンソールでの実行方法

### 方法A: Railway Webコンソールを使用

1. Railwayダッシュボードでプロジェクトを開く
2. 「Deployments」タブを選択
3. 最新のデプロイメントをクリック
4. 「Settings」→「Connect」からRailway CLIをインストール（または）
5. 「Terminal」タブを開く
6. 上記のコマンドを実行

### 方法B: Railway CLIを使用

```bash
# Railway CLIをインストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクトに接続
railway link

# コマンドを実行
railway run npm run db:push
railway run node seed-categories.mjs
```

## 3. 確認事項

- ✅ デプロイが成功している
- ✅ データベースファイルが作成されている
- ✅ カテゴリーが登録されている

## 4. アプリケーションの動作確認

公開されたURLにアクセスして：
- 商品管理ページが表示される
- カテゴリー一覧が表示される
- 商品の追加・編集ができる

## トラブルシューティング

### データベースエラーが出る場合

1. Railwayの環境変数を確認：
   - `DATABASE_URL` が設定されているか（未設定でもOK）
   - `NODE_ENV=production`

2. ログを確認：
   - Railwayダッシュボードの「Logs」タブでエラーを確認

3. データベース初期化を再実行：
   ```bash
   railway run npm run db:push
   railway run node seed-categories.mjs
   ```

## データベースの永続化

Railwayではファイルシステムが永続化されているため、データベースファイル（`data/salon-inventory.db`）は保存されます。

ただし、コンテナの再デプロイ時にはデータが保持されることを確認してください。

