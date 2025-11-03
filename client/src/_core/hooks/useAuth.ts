// シンプル認証: 常に認証済みとして扱う
export function useAuth() {
  return {
    user: { id: 1, name: "オーナー", role: "owner", email: null },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}
