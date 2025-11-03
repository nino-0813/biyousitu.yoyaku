import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  // カテゴリ関連
  categories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCategory(input);
      }),
  }),

  // 商品関連
  products: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    lowStock: protectedProcedure.query(async () => {
      return await db.getLowStockProducts();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        categoryId: z.number(),
        currentStock: z.number().default(0),
        minStock: z.number().default(0),
        unit: z.string().default("個"),
        pricePerUnit: z.number().default(0),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProduct(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        categoryId: z.number().optional(),
        currentStock: z.number().optional(),
        minStock: z.number().optional(),
        unit: z.string().optional(),
        pricePerUnit: z.number().optional(),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // 発注履歴関連
  orders: router({
    list: protectedProcedure
      .input(z.object({ productId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getOrderHistory(input.productId);
      }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        orderDate: z.date(),
        quantity: z.number().min(1),
        totalPrice: z.number().min(0),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not found");
        }
        await db.createOrderHistory({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // 使用履歴関連
  usage: router({
    list: protectedProcedure
      .input(z.object({ productId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getUsageHistory(input.productId);
      }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        usageDate: z.date(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not found");
        }
        await db.createUsageHistory({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
