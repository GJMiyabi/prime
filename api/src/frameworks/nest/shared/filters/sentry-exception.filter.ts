/**
 * Sentry Exception Filter
 * すべての例外をキャプチャしてSentryに送信
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { RequestWithUser } from '../types/request.types';

interface GraphQLContext {
  req: RequestWithUser;
  res: Response;
}

/**
 * すべての例外をキャッチしてSentryに送信するフィルター
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const contextType = host.getType<'http' | 'graphql'>();

    // GraphQLコンテキストの場合
    if (contextType === 'graphql') {
      this.handleGraphQLException(exception, host);
    } else {
      // HTTPコンテキストの場合
      this.handleHttpException(exception, host);
    }
  }

  /**
   * GraphQL例外の処理
   */
  private handleGraphQLException(exception: Error, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext<GraphQLContext>();
    const info = gqlHost.getInfo<GraphQLResolveInfo>();

    // ユーザーコンテキストを設定
    if (ctx.req.user) {
      Sentry.setUser({
        id: ctx.req.user.userId,
        role: ctx.req.user.role,
      });
    }

    // GraphQL Operation情報を追加
    Sentry.setContext('graphql', {
      operationName: info?.operation?.name?.value || 'unknown',
      operationType: info?.operation?.operation || 'unknown',
      fieldName: info?.fieldName || 'unknown',
      parentType: info?.parentType?.name || 'unknown',
    });

    // エラーをSentryに送信
    this.sendToSentry(exception, 'graphql');

    // ログ出力
    this.logger.error(`GraphQL Error: ${exception.message}`, exception.stack, {
      operationName: info?.operation?.name?.value,
      fieldName: info?.fieldName,
    });

    // GraphQLエラーとして再スロー（Apollo Serverが処理）
    throw exception;
  }

  /**
   * HTTP例外の処理
   */
  private handleHttpException(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    // HTTPステータスコードを取得
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // リクエスト情報を追加
    Sentry.setContext('http', {
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.headers['user-agent'],
    });

    // ユーザーコンテキストを設定
    if (request.user) {
      Sentry.setUser({
        id: request.user.userId,
        role: request.user.role,
      });
    }

    // エラーをSentryに送信
    this.sendToSentry(exception, 'http');

    // ログ出力
    this.logger.error(
      `HTTP ${status} Error: ${exception.message}`,
      exception.stack,
      {
        method: request.method,
        url: request.url,
      },
    );

    // レスポンスを返す
    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * エラーをSentryに送信
   */
  private sendToSentry(exception: Error, type: 'http' | 'graphql'): void {
    // GraphQLErrorの場合
    if (exception instanceof GraphQLError) {
      Sentry.captureException(exception.originalError || exception, {
        tags: {
          type,
          graphql_error: true,
        },
        level: this.getErrorLevel(exception),
      });
      return;
    }

    // HttpExceptionの場合
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      // 4xxエラーは警告レベル、5xxエラーはエラーレベル
      Sentry.captureException(exception, {
        tags: {
          type,
          http_status: status,
        },
        level: status >= 500 ? 'error' : 'warning',
      });
      return;
    }

    // その他のエラー
    Sentry.captureException(exception, {
      tags: {
        type,
      },
      level: 'error',
    });
  }

  /**
   * エラーレベルを取得
   */
  private getErrorLevel(exception: Error): 'error' | 'warning' | 'info' {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) return 'error';
      if (status >= 400) return 'warning';
      return 'info';
    }
    return 'error';
  }
}
