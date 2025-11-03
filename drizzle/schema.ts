import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** シンプル認証用のユーザー名（オーナー用） */
  name: text("name"),
  email: text("email"),
  /** シンプル認証用のロール（不要だが互換性のため残す） */
  role: text("role").default("owner").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 商品カテゴリテーブル
 */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * 商品テーブル
 */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  categoryId: integer("categoryId").notNull(),
  currentStock: integer("currentStock").notNull().default(0),
  minStock: integer("minStock").notNull().default(0),
  unit: text("unit").notNull().default("個"),
  pricePerUnit: integer("pricePerUnit").notNull().default(0), // 円単位で保存
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 発注履歴テーブル
 */
export const orderHistory = sqliteTable("orderHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull(),
  orderDate: integer("orderDate", { mode: "timestamp" }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: integer("totalPrice").notNull(), // 円単位で保存
  supplier: text("supplier"),
  notes: text("notes"),
  userId: integer("userId").notNull().default(1), // オーナー固定
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type OrderHistory = typeof orderHistory.$inferSelect;
export type InsertOrderHistory = typeof orderHistory.$inferInsert;

/**
 * 使用履歴テーブル
 */
export const usageHistory = sqliteTable("usageHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull(),
  usageDate: integer("usageDate", { mode: "timestamp" }).notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  userId: integer("userId").notNull().default(1), // オーナー固定
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type UsageHistory = typeof usageHistory.$inferSelect;
export type InsertUsageHistory = typeof usageHistory.$inferInsert;
