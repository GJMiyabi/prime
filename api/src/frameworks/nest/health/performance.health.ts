/**
 * Performance Health Indicator
 * パフォーマンスメトリクスの健全性をチェック
 */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PerformanceInterceptor } from '../shared/interceptors/performance.interceptor';

@Injectable()
export class PerformanceHealthIndicator extends HealthIndicator {
  constructor(private readonly performanceInterceptor: PerformanceInterceptor) {
    super();
  }

  /**
   * パフォーマンスメトリクスをチェック
   */
  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      const stats = await Promise.resolve(
        this.performanceInterceptor.getStatistics(),
      );

      // しきい値チェック
      const isHealthy =
        stats.average < 1000 && // 平均レスポンスタイム1秒以下
        stats.p95 < 3000 && // P95が3秒以下
        stats.slowRequests < stats.total * 0.1; // スロークエリが10%未満

      if (!isHealthy) {
        throw new HealthCheckError(
          'Performance degradation detected',
          this.getStatus(key, false, {
            ...stats,
            message: 'Performance is below acceptable thresholds',
          }),
        );
      }

      return this.getStatus(key, true, {
        ...stats,
        message: 'Performance is healthy',
      });
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HealthCheckError(
        'Performance check failed',
        this.getStatus(key, false, {
          message: errorMessage,
        }),
      );
    }
  }
}
