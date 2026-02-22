/**
 * Sentry設定
 * バックエンドAPIのエラートラッキング設定
 */

import * as Sentry from '@sentry/nestjs';

interface SentryConfig {
  dsn: string;
  environment: string;
  enabled: boolean;
}

/**
 * 環境変数からSentry設定を取得
 */
function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production' && !!process.env.SENTRY_DSN,
  };
}

/**
 * Sentryを初期化
 */
export function initializeSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('[Sentry] Disabled (development or missing DSN)');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,

    // トレースのサンプリングレート（0.0 - 1.0）
    // 本番環境では10%のリクエストをトレース
    tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,

    // エラーのフィルタリング
    beforeSend(event, hint) {
      // 開発環境ではSentryに送信しない
      if (config.environment === 'development') {
        console.warn('[Sentry] Development mode - event not sent:', event);
        return null;
      }

      // 特定のエラーを除外
      const error = hint.originalException;
      if (error instanceof Error) {
        // ヘルスチェックエラーを除外
        if (error.message?.includes('HEALTH_CHECK')) {
          return null;
        }

        // Prismaの接続エラーは別途アラート設定するため除外
        if (error.message?.includes('PrismaClientKnownRequestError')) {
          return null;
        }
      }

      return event;
    },

    // Sentryの統合機能
    integrations: [
      // HTTP統合（リクエスト情報を自動収集）
      Sentry.httpIntegration(),

      // GraphQL統合
      Sentry.graphqlIntegration(),
    ],

    // パフォーマンス監視の対象
    tracePropagationTargets: ['localhost', /^https:\/\/api\.example\.com/],
  });

  console.log(`[Sentry] Initialized (environment: ${config.environment})`);
}

/**
 * ユーザーコンテキストを設定
 * @param userId - ユーザーID
 * @param role - ユーザーロール
 */
export function setSentryUser(userId: string, role?: string): void {
  Sentry.setUser({
    id: userId,
    role,
  });
}

/**
 * Sentryユーザーコンテキストをクリア
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * エラーを手動でSentryに送信
 * @param error - エラーオブジェクト
 * @param context - 追加のコンテキスト情報
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * メッセージを手動でSentryに送信
 * @param message - メッセージ
 * @param level - ログレベル
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  Sentry.captureMessage(message, level);
}
