import { defineConfig } from "drizzle-kit";

const dbPath = process.env.DATABASE_URL || "./data/salon-inventory.db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
