/**
 * Alert Service
 * システムアラートをSlack等に送信
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AlertMessage {
  level: AlertLevel;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface SlackMessage {
  text: string;
  attachments?: Array<{
    color: string;
    title: string;
    text: string;
    fields?: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    ts: number;
  }>;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly slackWebhookUrl: string | undefined;
  private readonly enabled: boolean;

  // アラート送信の頻度制限（同じアラートを5分以内に再送しない）
  private readonly alertCache = new Map<string, number>();
  private readonly ALERT_COOLDOWN = 5 * 60 * 1000; // 5分

  constructor(private readonly httpService: HttpService) {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.enabled =
      process.env.NODE_ENV === 'production' && !!this.slackWebhookUrl;

    if (!this.enabled) {
      this.logger.warn(
        'Alert Service is disabled (development mode or missing SLACK_WEBHOOK_URL)',
      );
    }
  }

  /**
   * アラートを送信
   */
  async sendAlert(alert: AlertMessage): Promise<void> {
    // 頻度制限チェック
    const cacheKey = `${alert.level}:${alert.title}`;
    const lastSent = this.alertCache.get(cacheKey);
    const now = Date.now();

    if (lastSent && now - lastSent < this.ALERT_COOLDOWN) {
      this.logger.debug(
        `Alert throttled: ${cacheKey} (last sent ${Math.round((now - lastSent) / 1000)}s ago)`,
      );
      return;
    }

    // ローカルログに記録
    this.logAlert(alert);

    // Slackに送信
    if (this.enabled && this.slackWebhookUrl) {
      try {
        await this.sendToSlack(alert);
        this.alertCache.set(cacheKey, now);
      } catch (error) {
        this.logger.error('Failed to send alert to Slack', error);
      }
    }
  }

  /**
   * エラーレートアラート
   */
  async sendErrorRateAlert(
    errorRate: number,
    threshold: number,
  ): Promise<void> {
    await this.sendAlert({
      level: AlertLevel.ERROR,
      title: '🚨 High Error Rate Detected',
      message: `Error rate is ${errorRate.toFixed(2)}% (threshold: ${threshold}%)`,
      metadata: {
        errorRate,
        threshold,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * スローレスポンスアラート
   */
  async sendSlowResponseAlert(
    duration: number,
    threshold: number,
    details: { type: string; name: string },
  ): Promise<void> {
    await this.sendAlert({
      level: AlertLevel.WARNING,
      title: '⏱️ Slow Response Detected',
      message: `${details.type} ${details.name} took ${duration}ms (threshold: ${threshold}ms)`,
      metadata: {
        duration,
        threshold,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * データベース接続エラーアラート
   */
  async sendDatabaseErrorAlert(error: Error): Promise<void> {
    await this.sendAlert({
      level: AlertLevel.CRITICAL,
      title: '💥 Database Connection Error',
      message: `Database error: ${error.message}`,
      metadata: {
        error: error.stack,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * メモリ使用率アラート
   */
  async sendMemoryAlert(
    usagePercent: number,
    threshold: number,
  ): Promise<void> {
    await this.sendAlert({
      level: AlertLevel.WARNING,
      title: '💾 High Memory Usage',
      message: `Memory usage is ${usagePercent.toFixed(1)}% (threshold: ${threshold}%)`,
      metadata: {
        usagePercent,
        threshold,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * アラートをログに記録
   */
  private logAlert(alert: AlertMessage): void {
    const logMessage = `[${alert.level.toUpperCase()}] ${alert.title}: ${alert.message}`;

    switch (alert.level) {
      case AlertLevel.CRITICAL:
      case AlertLevel.ERROR:
        this.logger.error(logMessage, alert.metadata);
        break;
      case AlertLevel.WARNING:
        this.logger.warn(logMessage, alert.metadata);
        break;
      default:
        this.logger.log(logMessage, alert.metadata);
    }
  }

  /**
   * Slackにメッセージを送信
   */
  private async sendToSlack(alert: AlertMessage): Promise<void> {
    if (!this.slackWebhookUrl) return;

    const color = this.getAlertColor(alert.level);
    const emoji = this.getAlertEmoji(alert.level);

    const slackMessage: SlackMessage = {
      text: `${emoji} *${alert.title}*`,
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: alert.metadata
            ? Object.entries(alert.metadata).map(([key, value]) => ({
                title: key,
                value: String(value),
                short: true,
              }))
            : undefined,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await firstValueFrom(
      this.httpService.post(this.slackWebhookUrl, slackMessage),
    );

    this.logger.debug(`Alert sent to Slack: ${alert.title}`);
  }

  /**
   * アラートレベルに応じた色を取得
   */
  private getAlertColor(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.CRITICAL:
        return '#FF0000'; // 赤
      case AlertLevel.ERROR:
        return '#FF6B6B'; // 薄い赤
      case AlertLevel.WARNING:
        return '#FFA500'; // オレンジ
      default:
        return '#36A64F'; // 緑
    }
  }

  /**
   * アラートレベルに応じた絵文字を取得
   */
  private getAlertEmoji(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.CRITICAL:
        return '🔴';
      case AlertLevel.ERROR:
        return '🚨';
      case AlertLevel.WARNING:
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  /**
   * アラートキャッシュをクリア（テスト用）
   */
  clearCache(): void {
    this.alertCache.clear();
  }
}
