// Repository層で使用される共通の型定義

/**
 * GraphQLクエリオプション
 * Apollo Clientのcache戦略を指定可能
 */
export interface QueryOptions {
  /**
   * キャッシュポリシー
   * - cache-first: キャッシュを優先、なければネットワークから取得（デフォルト）
   * - network-only: 常にネットワークから取得、キャッシュに保存
   * - cache-only: キャッシュのみから取得、なければエラー
   * - no-cache: ネットワークから取得、キャッシュに保存しない
   */
  fetchPolicy?: "cache-first" | "network-only" | "cache-only" | "no-cache";
}

/**
 * GraphQLエラーレスポンス
 */
export interface GraphQLErrorResponse {
  graphQLErrors: ReadonlyArray<{
    message: string;
    locations?: ReadonlyArray<{ line: number; column: number }>;
    path?: ReadonlyArray<string | number>;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * ネットワークエラーレスポンス
 */
export interface NetworkErrorResponse {
  networkError: Error;
}
