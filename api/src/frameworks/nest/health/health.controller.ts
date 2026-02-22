/**
 * Health Check Controller
 * アプリケーションとその依存サービスの健全性をチェック
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';
import { PerformanceHealthIndicator } from './performance.health';
import { SkipCsrf } from '../auth/decorators/skip-csrf.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrincipalKind } from 'src/domains/type/principal-kind';

@Controller('health')
@SkipCsrf() // ヘルスチェックはCSRF不要
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly performance: PerformanceHealthIndicator,
  ) {}

  /**
   * Liveness Probe
   * アプリケーションが起動しているかをチェック
   * Kubernetesなどで使用
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // 基本的な生存確認のみ
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024), // 500MB
    ]);
  }

  /**
   * Readiness Probe
   * アプリケーションがトラフィックを受け入れる準備ができているかをチェック
   */
  @Get('readiness')
  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      // データベース接続
      () => this.prisma.check('database'),
      // メモリ使用量（ヒープ: 400MB以下）
      () => this.memory.checkHeap('memory_heap', 400 * 1024 * 1024),

      // メモリ使用量（RSS: 800MB以下）
      () => this.memory.checkRSS('memory_rss', 800 * 1024 * 1024),

      // ディスク使用量（90%以下）
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  /**
   * 詳細診断
   * 管理者のみアクセス可能
   * パフォーマンスメトリクス、外部サービス接続状態などを含む
   */
  @Get('details')
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(PrincipalKind.ADMIN)
  @HealthCheck()
  async checkDetails(): Promise<HealthCheckResult> {
    return this.health.check([
      // データベース接続
      () => this.prisma.check('database'),
      // パフォーマンスメトリクス
      () => this.performance.check('performance'),

      // メモリ使用量（ヒープ）
      () => this.memory.checkHeap('memory_heap', 400 * 1024 * 1024),

      // メモリ使用量（RSS）
      () => this.memory.checkRSS('memory_rss', 800 * 1024 * 1024),

      // ディスク使用量
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // 外部APIチェック（オプション）
      // () =>
      //   this.http.pingCheck('external_api', 'https://api.example.com/health'),
    ]);
  }
}
