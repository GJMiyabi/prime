/**
 * 環境変数の型安全管理
 * zodを使用して環境変数をバリデーションし、型安全にアクセス
 */

import { z } from "zod";

/**
 * 環境変数のスキーマ定義
 * 必須の環境変数とオプションの環境変数を定義
 */
const envSchema = z.object({
  /**
   * Node環境
   * development, production, test
   */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  /**
   * GraphQL APIエンドポイント
   * フロントエンドから直接アクセスするため NEXT_PUBLIC_ プレフィックスが必要
   */
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: z
    .string()
    .url("NEXT_PUBLIC_GRAPHQL_ENDPOINT must be a valid URL")
    .default("http://localhost:4000/graphql"),

  /**
   * Sentry DSN（エラートラッキング）
   * 本番環境でのみ必須
   */
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  /**
   * Sentry環境名
   */
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z
    .string()
    .default("development"),

  /**
   * アプリケーションバージョン
   * package.jsonから取得するか、CI/CDで設定
   */
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
});

/**
 * 環境変数の型
 * zodスキーマから自動生成
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 環境変数のパース結果
 */
let parsedEnv: Env | null = null;

/**
 * 環境変数をバリデーションしてパース
 * アプリ起動時に1度だけ実行される
 */
function parseEnv(): Env {
  // 既にパース済みの場合はキャッシュを返す
  if (parsedEnv) {
    return parsedEnv;
  }

  try {
    parsedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    });

    return parsedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
        .join("\n");

      throw new Error(
        `❌ 環境変数のバリデーションエラー:\n${missingVars}\n\n.env.localファイルを確認してください。`
      );
    }
    throw error;
  }
}

/**
 * 型安全な環境変数へのアクセス
 * 
 * @example
 * import { env } from '@/app/_lib/env';
 * 
 * const endpoint = env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
 * // 型補完が効く！未定義エラーが起きない！
 */
export const env = parseEnv();

/**
 * 開発環境かどうかを判定
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * 本番環境かどうかを判定
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * テスト環境かどうかを判定
 */
export const isTest = env.NODE_ENV === "test";
