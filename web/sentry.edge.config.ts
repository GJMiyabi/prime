/**
 * Sentry Edge Runtime設定
 * Edge Runtimeで発生したエラーをSentryに送信
 */

import * as Sentry from "@sentry/nextjs";
import { CONFIG } from "./src/app/_constants/config";

// Sentryが有効な場合のみ初期化
if (CONFIG.SENTRY.ENABLED && CONFIG.SENTRY.DSN) {
  Sentry.init({
    dsn: CONFIG.SENTRY.DSN,
    environment: CONFIG.SENTRY.ENVIRONMENT,
    release: CONFIG.APP.VERSION,

    // トレースのサンプリングレート
    tracesSampleRate: CONFIG.IS_PRODUCTION ? 0.1 : 1.0,
  });
}
