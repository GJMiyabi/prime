/**
 * Prisma Health Indicator
 * Prismaデータベース接続の健全性をチェック
 */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  private readonly prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = PrismaClientSingleton.instance;
  }

  /**
   * データベース接続の健全性をチェック
   */
  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      // シンプルなクエリでデータベース接続をテスト
      await this.prisma.$queryRaw`SELECT 1`;

      return this.getStatus(key, true, {
        message: 'Database connection is healthy',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HealthCheckError(
        'Database connection failed',
        this.getStatus(key, false, {
          message: errorMessage,
        }),
      );
    }
  }

  /**
   * データベースの詳細情報を取得（オプション）
   */
  async getDetails(key: string): Promise<HealthIndicatorResult> {
    try {
      // データベース接続プール情報の取得
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        message: 'Database is healthy',
        responseTime: `${responseTime}ms`,
        // Prismaのメトリクスを追加（オプション）
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          message: errorMessage,
        }),
      );
    }
  }
}
