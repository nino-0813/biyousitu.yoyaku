import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // シンプル認証: 常にオーナーユーザーを返す
  // 必要に応じて、ここでシンプルなパスワードチェックなども実装可能
  const user = await db.getOwnerUser();

  return {
    req: opts.req,
    res: opts.res,
    user: user as User,
  };
}
