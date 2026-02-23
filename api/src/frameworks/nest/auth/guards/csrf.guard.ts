/**
 * CSRF保護用Guard（NestJS GraphQL用）
 * GraphQL Mutationに対してCSRFトークン検証を実施
 *
 * 動作フロー：
 * 1. リクエストヘッダーから x-csrf-token を取得
 * 2. Cookieから csrf_token を取得
 * 3. 両者を比較（Double Submit Cookie パターン）
 * 4. 不一致 or 欠落の場合は ForbiddenException
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

interface GraphQLContext {
  req: Request;
}

interface GraphQLOperationInfo {
  operation?: {
    operation?: string;
  };
}

interface RequestBody {
  operationName?: string;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // テスト環境ではCSRFチェックをスキップ
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    // @SkipCsrf() デコレーターがある場合はスキップ
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    // GraphQL コンテキストを取得
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphQLContext>();
    const request: Request = ctx.req;

    // GraphQL の操作タイプを取得（Query or Mutation）
    const info =
      gqlContext.getInfo<GraphQLResolveInfo>() as GraphQLOperationInfo;
    const operationType = info?.operation?.operation;

    // Query（読み取り操作）はCSRF保護不要
    if (operationType === 'query') {
      return true;
    }

    // Mutation（書き込み操作）はCSRF保護必須
    if (operationType === 'mutation') {
      return this.validateCsrfToken(request);
    }

    // 不明な操作タイプは拒否
    this.logger.warn(`Unknown operation type: ${operationType}`);
    return false;
  }

  /**
   * CSRFトークンを検証
   * Double Submit Cookie パターン
   */
  private validateCsrfToken(request: Request): boolean {
    try {
      // Cookieからトークン取得
      const cookieToken = request.cookies?.['csrf_token'] as string | undefined;

      // HTTPヘッダーからトークン取得
      const headerToken = request.headers['x-csrf-token'];

      // どちらかが欠落している場合
      if (!cookieToken || !headerToken) {
        const body = request.body as RequestBody | undefined;
        this.logger.warn('CSRF token missing', {
          hasCookie: !!cookieToken,
          hasHeader: !!headerToken,
          operation: body?.operationName,
        });

        throw new ForbiddenException({
          message: 'CSRF token is required',
          code: 'CSRF_TOKEN_MISSING',
          hint: 'Include x-csrf-token header in your request',
        });
      }

      // トークンが一致するか確認（タイミング攻撃対策）
      const isValid = this.timingSafeEqual(cookieToken, headerToken as string);

      if (!isValid) {
        const body = request.body as RequestBody | undefined;
        this.logger.warn('CSRF token mismatch', {
          operation: body?.operationName,
        });

        throw new ForbiddenException({
          message: 'CSRF token validation failed',
          code: 'CSRF_TOKEN_INVALID',
        });
      }

      // 検証成功
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('CSRF validation error', error);
      throw new ForbiddenException('CSRF validation failed');
    }
  }

  /**
   * タイミング攻撃を防ぐための定数時間文字列比較
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
