/**
 * Performance Interceptor
 * GraphQL/HTTPリクエストのレスポンスタイムを計測
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GraphQLResolveInfo } from 'graphql';

interface PerformanceMetric {
  type: 'graphql' | 'http';
  duration: number;
  timestamp: Date;
  operationName?: string;
  fieldName?: string;
  method?: string;
  path?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // メモリ保持する最大メトリクス数

  // パフォーマンス閾値（ミリ秒）
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1秒以上は警告
  private readonly VERY_SLOW_REQUEST_THRESHOLD = 3000; // 3秒以上は重大

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const contextType = context.getType<'http' | 'graphql'>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (contextType === 'graphql') {
          this.recordGraphQLMetric(context, duration);
        } else {
          this.recordHttpMetric(context, duration);
        }

        // スロークエリの警告
        this.checkSlowRequest(duration, contextType);
      }),
    );
  }

  /**
   * GraphQLメトリクスを記録
   */
  private recordGraphQLMetric(
    context: ExecutionContext,
    duration: number,
  ): void {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<GraphQLResolveInfo>();

    const metric: PerformanceMetric = {
      type: 'graphql',
      duration,
      timestamp: new Date(),
      operationName: info?.operation?.name?.value || 'unknown',
      fieldName: info?.fieldName || 'unknown',
    };

    this.addMetric(metric);

    // ログ出力
    this.logger.debug(
      `GraphQL ${metric.operationName}.${metric.fieldName}: ${duration}ms`,
    );
  }

  /**
   * HTTPメトリクスを記録
   */
  private recordHttpMetric(context: ExecutionContext, duration: number): void {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
    }>();

    const metric: PerformanceMetric = {
      type: 'http',
      duration,
      timestamp: new Date(),
      method: request.method,
      path: request.url,
    };

    this.addMetric(metric);

    // ログ出力
    this.logger.debug(`HTTP ${metric.method} ${metric.path}: ${duration}ms`);
  }

  /**
   * メトリクスを配列に追加（メモリ制限あり）
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // 最大数を超えたら古いものから削除
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * スロークエリをチェック
   */
  private checkSlowRequest(duration: number, type: string): void {
    if (duration >= this.VERY_SLOW_REQUEST_THRESHOLD) {
      this.logger.error(
        `Very slow ${type} request detected: ${duration}ms (threshold: ${this.VERY_SLOW_REQUEST_THRESHOLD}ms)`,
      );
    } else if (duration >= this.SLOW_REQUEST_THRESHOLD) {
      this.logger.warn(
        `Slow ${type} request detected: ${duration}ms (threshold: ${this.SLOW_REQUEST_THRESHOLD}ms)`,
      );
    }
  }

  /**
   * 統計情報を取得（ヘルスチェック等で使用）
   */
  getStatistics(): {
    total: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
    slowRequests: number;
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        slowRequests: 0,
      };
    }

    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = this.metrics.length;
    const sum = durations.reduce((acc, d) => acc + d, 0);

    return {
      total,
      average: Math.round(sum / total),
      p50: this.getPercentile(durations, 0.5),
      p95: this.getPercentile(durations, 0.95),
      p99: this.getPercentile(durations, 0.99),
      slowRequests: durations.filter((d) => d >= this.SLOW_REQUEST_THRESHOLD)
        .length,
    };
  }

  /**
   * パーセンタイル値を計算
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[index] || 0;
  }

  /**
   * メトリクスをクリア（テスト用）
   */
  clearMetrics(): void {
    this.metrics.length = 0;
  }
}
