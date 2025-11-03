# データベースビューアでの表示方法

## データベースファイルの場所

```
/Volumes/BackupSSD/app/app-01/salon-inventory-manager/data/salon-inventory.db
```

## データの確認方法

### 方法1: データベースビューアで開く

1. データベースビューア（DB Browser for SQLite、TablePlus、DBeaverなど）を開く
2. 「Open Database」または「データベースを開く」をクリック
3. 以下のパスを指定：
   ```
   /Volumes/BackupSSD/app/app-01/salon-inventory-manager/data/salon-inventory.db
   ```

### 方法2: WALモードの対応

SQLiteがWALモードで動作しているため、一部のビューアでは最新データが表示されない場合があります。

**解決方法：**
- 最新のデータベースビューアを使用する（WALモードをサポート）
- または、サーバーを停止してからWALファイルをマージする

### 方法3: コマンドラインで確認

```bash
cd /Volumes/BackupSSD/app/app-01/salon-inventory-manager
sqlite3 data/salon-inventory.db

# テーブル一覧を表示
.tables

# カテゴリを表示
SELECT * FROM categories;

# 商品を表示
SELECT * FROM products;

# 発注履歴を表示
SELECT * FROM orderHistory;
```

## 現在のデータ状況

- カテゴリ: 9件
- 商品: 1件
- 発注履歴: 1件
- 使用履歴: 0件
- ユーザー: 1件

## 注意事項

- WALモードのため、`salon-inventory.db-wal`と`salon-inventory.db-shm`ファイルも一緒に存在します（これは正常です）
- データベースビューアがWALモードをサポートしていない場合、最新データが表示されない可能性があります
- サーバーを停止してからビューアで開くと、WALファイルがマージされて最新データが表示されます

