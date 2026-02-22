/**
 * 構造化ログシステム
 * 開発環境と本番環境で適切なログ出力先を切り替える
 * 本番環境ではSentryにエラーを送信
 */

import * as Sentry from "@sentry/nextjs";
import { CONFIG } from "../_constants/config";

type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * ログコンテキスト
 * ログに付与する構造化された情報
 */
export interface LogContext {
  component: string; // どのコンポーネント/クラスで発生したか
  action?: string; // どのアクション中か
  userId?: string; // 誰が操作していたか
  error?: Error | unknown; // エラーオブジェクト
  meta?: Record<string, unknown>; // 追加のメタデータ
}

/**
 * ログエントリの構造
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  component: string;
  action?: string;
  userId?: string;
  error?: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

/**
 * 構造化ロガー
 */
class Logger {
  private formatError(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      message: String(error),
    };
  }

  private log(level: LogLevel, message: string, context: LogContext): void {
    const errorInfo = context.error ? this.formatError(context.error) : undefined;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: context.component,
      action: context.action,
      userId: context.userId,
      error: errorInfo?.message,
      stack: errorInfo?.stack,
      meta: context.meta,
    };

    // 開発環境: コンソールに詳細を出力
    if (process.env.NODE_ENV === "development") {
      const levelMethod = level === "debug" ? "log" : level;
      console[levelMethod](
        `[${level.toUpperCase()}] ${context.component}${context.action ? `:${context.action}` : ""}`,
        message,
        {
          ...(context.meta && { meta: context.meta }),
          ...(errorInfo && { error: errorInfo }),
        }
      );
    }

    // 本番環境: エラーのみ外部サービスに送信
    if (process.env.NODE_ENV === "production") {
      if (level === "error") {
        // Sentryにエラーを送信
        if (CONFIG.SENTRY.ENABLED && context.error) {
          Sentry.captureException(context.error, {
            level: "error",
            tags: {
              component: context.component,
              action: context.action || "unknown",
            },
            user: context.userId ? { id: context.userId } : undefined,
            extra: {
              message,
              timestamp: logEntry.timestamp,
              ...context.meta,
            },
          });
        }
        
        // 最小限のコンソール出力（本番環境のログ確認用）
        console.error(
          `[ERROR] ${context.component}:`,
          message,
          { timestamp: logEntry.timestamp }
        );
      } else if (level === "warn") {
        // 警告もSentryに送信（info levelで）
        if (CONFIG.SENTRY.ENABLED) {
          Sentry.captureMessage(message, {
            level: "warning",
            tags: {
              component: context.component,
              action: context.action || "unknown",
            },
            extra: context.meta,
          });
        }
        
        // 警告は簡潔に出力
        console.warn(`[WARN] ${context.component}: ${message}`);
      }
      // info, debugは本番環境では出力しない
    }
  }

  /**
   * エラーログ
   * 本番環境では外部サービスに送信される
   */
  error(message: string, context: LogContext): void {
    this.log("error", message, context);
  }

  /**
   * 警告ログ
   */
  warn(message: string, context: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * 情報ログ
   * 本番環境では出力されない
   */
  info(message: string, context: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * デバッグログ
   * 開発環境のみ出力
   */
  debug(message: string, context: LogContext): void {
    this.log("debug", message, context);
  }
}

/**
 * シングルトンロガーインスタンス
 * アプリケーション全体で使用
 * 
 * @example
 * import { logger } from '@/app/_lib/logger';
 * 
 * logger.error("データ取得に失敗", {
 *   component: "PersonRepository",
 *   action: "findById",
 *   error,
 *   meta: { personId: "123" },
 * });
 */
export const logger = new Logger();
