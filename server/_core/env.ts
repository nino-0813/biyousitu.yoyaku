export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // シンプル認証用のパスワード（オプション）
  accessPassword: process.env.ACCESS_PASSWORD ?? "",
  // Manus機能用（オプション、使用しない場合は空文字列）
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
};
