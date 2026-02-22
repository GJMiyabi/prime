/**
 * Sentry初期化設定（クライアントサイド）
 * ブラウザで発生したエラーをSentryに送信
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

    // セッションリプレイのサンプリングレート
    // エラー発生時は100%、通常時は10%をリプレイ
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // エラーのフィルタリング
    beforeSend(event, hint) {
      // 開発環境ではSentryに送信しない（ローカルで確認）
      if (CONFIG.IS_DEVELOPMENT) {
        console.warn("[Sentry] 開発環境のためイベントは送信されません:", event);
        return null;
      }

      // 特定のエラーを除外（例: ネットワークエラー）
      const error = hint.originalException;
      if (error instanceof Error) {
        // ブラウザ拡張機能起因のエラーを除外
        if (error.stack?.includes("chrome-extension://")) {
          return null;
        }
      }

      return event;
    },

    // Sentryの統合機能
    integrations: [
      // セッションリプレイ（ユーザーの操作を記録）
      Sentry.replayIntegration({
        maskAllText: true, // テキストをマスク（個人情報保護）
        blockAllMedia: true, // 画像・動画をブロック
      }),
    ],
  });
}
