import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { categories } from "./drizzle/schema.ts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, "data/salon-inventory.db");

// ディレクトリが存在しない場合は作成
const dbDir = path.dirname(dbPath);
if (dbDir !== "." && dbDir !== "..") {
  fs.mkdirSync(dbDir, { recursive: true });
}

const database = new Database(dbPath);
database.pragma("journal_mode = WAL");

const db = drizzle(database);

const defaultCategories = [
  { name: "シャンプー・トリートメント", description: "シャンプー、トリートメント、ヘアマスクなど" },
  { name: "ヘアカラー剤", description: "ヘアカラー、ブリーチ剤、トーン剤など" },
  { name: "パーマ剤", description: "パーマ液、ストレートパーマ剤、デジタルパーマ剤など" },
  { name: "スタイリング剤", description: "ワックス、ジェル、スプレー、ムースなど" },
  { name: "ヘアケア用品", description: "ヘアオイル、セラム、リンスなど" },
  { name: "タオル・ケープ", description: "タオル、ケープ、ネッカーペーパーなど" },
  { name: "施術道具", description: "櫛、ブラシ、手袋、保護用具など" },
  { name: "機器・器具", description: "ドライヤー、アイロン、バリカン、ワンドなど" },
  { name: "その他", description: "その他の消耗品・備品" },
];

async function seed() {
  console.log("カテゴリデータを追加中...");
  
  try {
    // 既存のカテゴリがある場合は削除（再実行時用）
    const existing = await db.select().from(categories);
    if (existing.length > 0) {
      console.log("既存のカテゴリを削除中...");
      await db.delete(categories);
    }
    
    // 新しいカテゴリを追加
    for (const category of defaultCategories) {
      await db.insert(categories).values(category);
      console.log(`✓ ${category.name}`);
    }
    
    console.log(`\n完了しました! ${defaultCategories.length}個のカテゴリを追加しました。`);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    throw error;
  } finally {
    database.close();
    process.exit(0);
  }
}

seed().catch((error) => {
  console.error("エラー:", error);
  database.close();
  process.exit(1);
});
