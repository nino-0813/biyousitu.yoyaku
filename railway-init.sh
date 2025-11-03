#!/bin/bash
# Railwayでのデータベース初期化スクリプト

echo "データベースマイグレーションを実行中..."
npm run db:push

echo "カテゴリーの初期データを投入中..."
node seed-categories.mjs

echo "✅ 初期化完了！"

