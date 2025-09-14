import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './frameworks/nest/app.module';
import * as cookieParser from 'cookie-parser';
import { environment } from './frameworks/config/config';
import { Logger } from '@nestjs/common';

const port = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  process.env.TZ = 'UTC';

  const message = `Start Server with port = ${port}, environment = ${environment}`;
  Logger.log(message, 'main');
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
