/**
 * Sentry初期化設定（サーバーサイド）
 * サーバーで発生したエラーをSentryに送信
 */

import * as Sentry from "@sentry/nextjs";
import { CONFIG } from "./src/app/_constants/config";

// Sentryが有効な場合のみ初期化
if (CONFIG.SENTRY.ENABLED && CONFIG.SENTRY.DSN) {
  Sentry.init({
    dsn: CONFIG.SENTRY.DSN,
    environment: CONFIG.SENTRY.ENVIRONMENT,
    release: CONFIG.APP.VERSION,

    // トレースのサンプリングレート（0.0 - 1.0）
    // 本番環境では10%のリクエストをトレース
    tracesSampleRate: CONFIG.IS_PRODUCTION ? 0.1 : 1.0,

    // エラーのフィルタリング
    beforeSend(event, _hint) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // 開発環境ではSentryに送信しない（ローカルで確認）
      if (CONFIG.IS_DEVELOPMENT) {
        console.warn("[Sentry] 開発環境のためイベントは送信されません:", event);
        return null;
      }

      return event;
    },
  });
}
