import { desc, eq, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { 
  InsertUser, 
  users, 
  categories, 
  products, 
  orderHistory, 
  usageHistory,
  InsertCategory,
  InsertProduct,
  InsertOrderHistory,
  InsertUsageHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let _db: ReturnType<typeof drizzle> | null = null;
let _database: Database.Database | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const fs = await import("fs");
      let dbPath = process.env.DATABASE_URL;
      
      if (!dbPath) {
        // Vercel環境ではデータベースURLを環境変数で指定する必要がある
        if (process.env.VERCEL) {
          throw new Error(
            "DATABASE_URL environment variable is required in Vercel environment. " +
            "Please set DATABASE_URL in Vercel dashboard. " +
            "For SQLite-compatible serverless database, consider using Turso (https://turso.tech)"
          );
        }
        // ローカル環境ではデフォルトパスを使用
        const projectRoot = process.cwd();
        dbPath = path.resolve(projectRoot, "data/salon-inventory.db");
        console.log("[Database] Current working directory:", projectRoot);
        console.log("[Database] Resolved DB path:", dbPath);
      }
      
      // ディレクトリが存在しない場合は作成
      const dbDir = path.dirname(dbPath);
      if (dbDir !== "." && dbDir !== "..") {
        fs.default.mkdirSync(dbDir, { recursive: true });
      }
      
      // データベースファイルの存在確認
      if (!fs.default.existsSync(dbPath)) {
        console.warn("[Database] Database file does not exist at:", dbPath);
        console.warn("[Database] This is OK if running migrations for the first time");
      }
      
      _database = new Database(dbPath);
      _database.pragma("journal_mode = WAL");
      _db = drizzle(_database);
      console.log("[Database] Connected to SQLite:", dbPath);
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// シンプル認証のため、ユーザー関連関数は削除
// オーナーは固定ID (1) として扱う
export async function getOwnerUser() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] getOwnerUser: Database not available, returning default user");
    return { id: 1, name: "オーナー", role: "owner", email: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  }

  try {
    // デフォルトオーナーユーザーを取得または作成
    let owner = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    
    if (owner.length === 0) {
      // オーナーユーザーを作成
      await db.insert(users).values({
        name: "オーナー",
        role: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });
      // 作成後、再取得
      owner = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    }

    return owner[0] || { id: 1, name: "オーナー", role: "owner", email: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  } catch (error) {
    console.error("[Database] getOwnerUser error:", error);
    return { id: 1, name: "オーナー", role: "owner", email: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  }
}

// ========== カテゴリ関連 ==========

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

// ========== 商品関連 ==========

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      currentStock: products.currentStock,
      minStock: products.minStock,
      unit: products.unit,
      pricePerUnit: products.pricePerUnit,
      supplier: products.supplier,
      notes: products.notes,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.name);
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      currentStock: products.currentStock,
      minStock: products.minStock,
      unit: products.unit,
      pricePerUnit: products.pricePerUnit,
      supplier: products.supplier,
      notes: products.notes,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(sql`${products.currentStock} <= ${products.minStock}`)
    .orderBy(products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ========== 発注履歴関連 ==========

export async function getOrderHistory(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select({
      id: orderHistory.id,
      productId: orderHistory.productId,
      productName: products.name,
      orderDate: orderHistory.orderDate,
      quantity: orderHistory.quantity,
      totalPrice: orderHistory.totalPrice,
      supplier: orderHistory.supplier,
      notes: orderHistory.notes,
      userId: orderHistory.userId,
      userName: users.name,
      createdAt: orderHistory.createdAt,
    })
    .from(orderHistory)
    .leftJoin(products, eq(orderHistory.productId, products.id))
    .leftJoin(users, eq(orderHistory.userId, users.id));
  
  if (productId) {
    query = query.where(eq(orderHistory.productId, productId)) as any;
  }
  
  return await query.orderBy(desc(orderHistory.orderDate));
}

export async function createOrderHistory(order: InsertOrderHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // better-sqlite3ではトランザクションを同期的に処理する必要があるため、
  // 順番に実行する方法に変更
  try {
    // 発注履歴を追加
    await db.insert(orderHistory).values(order);
    
    // 在庫を増やす
    const product = await db.select().from(products).where(eq(products.id, order.productId)).limit(1);
    if (product.length > 0) {
      await db.update(products)
        .set({ currentStock: product[0].currentStock + order.quantity })
        .where(eq(products.id, order.productId));
    }
  } catch (error) {
    console.error("[Database] Failed to create order history:", error);
    throw error;
  }
}

// ========== 使用履歴関連 ==========

export async function getUsageHistory(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select({
      id: usageHistory.id,
      productId: usageHistory.productId,
      productName: products.name,
      usageDate: usageHistory.usageDate,
      quantity: usageHistory.quantity,
      notes: usageHistory.notes,
      userId: usageHistory.userId,
      userName: users.name,
      createdAt: usageHistory.createdAt,
    })
    .from(usageHistory)
    .leftJoin(products, eq(usageHistory.productId, products.id))
    .leftJoin(users, eq(usageHistory.userId, users.id));
  
  if (productId) {
    query = query.where(eq(usageHistory.productId, productId)) as any;
  }
  
  return await query.orderBy(desc(usageHistory.usageDate));
}

export async function createUsageHistory(usage: InsertUsageHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // better-sqlite3ではトランザクションを同期的に処理する必要があるため、
  // 順番に実行する方法に変更
  try {
    // 使用履歴を追加
    await db.insert(usageHistory).values(usage);
    
    // 在庫を減らす
    const product = await db.select().from(products).where(eq(products.id, usage.productId)).limit(1);
    if (product.length > 0) {
      const newStock = Math.max(0, product[0].currentStock - usage.quantity);
      await db.update(products)
        .set({ currentStock: newStock })
        .where(eq(products.id, usage.productId));
    }
  } catch (error) {
    console.error("[Database] Failed to create usage history:", error);
    throw error;
  }
}
