/**
 * アプリケーション設定
 * 環境変数から型安全に設定を取得
 */

import { env, isDevelopment, isProduction } from "../_lib/env";
import { logger } from "../_lib/logger";

export const CONFIG = {
  /**
   * GraphQL APIエンドポイント
   * 環境変数 NEXT_PUBLIC_GRAPHQL_ENDPOINT から取得
   */
  GRAPHQL_ENDPOINT: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,

  /**
   * Sentry設定
   */
  SENTRY: {
    DSN: env.NEXT_PUBLIC_SENTRY_DSN,
    ENVIRONMENT: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    ENABLED: isProduction && !!env.NEXT_PUBLIC_SENTRY_DSN,
  },

  /**
   * アプリケーション情報
   */
  APP: {
    VERSION: env.NEXT_PUBLIC_APP_VERSION || "dev",
  },

  /**
   * 環境フラグ
   */
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
} as const;

// 開発環境でのみ警告を表示
if (isDevelopment && env.NEXT_PUBLIC_GRAPHQL_ENDPOINT === "http://localhost:4000/graphql") {
  logger.warn("NEXT_PUBLIC_GRAPHQL_ENDPOINTが未設定のためデフォルト値を使用", {
    component: "config",
    meta: { defaultEndpoint: "http://localhost:4000/graphql" },
  });
}
