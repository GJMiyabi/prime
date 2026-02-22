/**
 * アプリケーション設定
 */

export const CONFIG = {
  /**
   * GraphQL APIエンドポイント
   * 環境変数 NEXT_PUBLIC_GRAPHQL_ENDPOINT から取得
   * 未設定の場合はローカル開発環境のデフォルトを使用
   */
  GRAPHQL_ENDPOINT:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",
} as const;

// 開発環境でのみ警告を表示
if (
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
) {
  console.warn(
    "⚠️  NEXT_PUBLIC_GRAPHQL_ENDPOINT is not set. Using default: http://localhost:4000/graphql"
  );
}
