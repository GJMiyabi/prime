/**
 * Health Module
 * ヘルスチェック機能を提供
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { PerformanceHealthIndicator } from './performance.health';
import { PerformanceInterceptor } from '../shared/interceptors/performance.interceptor';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    PerformanceHealthIndicator,
    PerformanceInterceptor, // 既存のInterceptorを再利用
  ],
})
export class HealthModule {}
