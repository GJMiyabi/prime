import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './frameworks/nest/app.module';
import * as cookieParser from 'cookie-parser';
import { environment } from './frameworks/config/config';
import { Logger } from '@nestjs/common';
import { initializeSentry } from './frameworks/nest/shared/config/sentry.config';

const port = 4000;

async function bootstrap() {
  // Sentryを初期化（アプリ起動前）
  initializeSentry();

  const app = await NestFactory.create(AppModule);

  process.env.TZ = 'UTC';

  // CORS設定を厳格化（CSRF対策の一部）
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js開発サーバー
      'http://localhost:3001', // 代替ポート
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true, // Cookie送信を許可
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token', // CSRF トークンヘッダー
    ],
  });

  const message = `Start Server with port = ${port}, environment = ${environment}`;
  Logger.log(message, 'main');
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
