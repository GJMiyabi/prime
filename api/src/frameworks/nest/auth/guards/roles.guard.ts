/**
 * RBAC（Role-Based Access Control）Guard
 * GraphQL Resolver に役割ベースのアクセス制御を適用
 *
 * 動作フロー：
 * 1. @Roles() デコレーターで指定された必要な役割を取得
 * 2. JWTトークンからユーザーの役割を取得
 * 3. ユーザーの役割が必要な役割に含まれているか確認
 * 4. 含まれていない場合は ForbiddenException
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
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrincipalKind } from 'src/domains/type/principal-kind';

interface GraphQLContext {
  req: {
    user?: {
      sub: string; // principalId
      username: string;
      email?: string;
      role: string; // PrincipalKind
      accountId: string;
    };
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles() デコレーターで指定された必要な役割を取得
    const requiredRoles = this.reflector.getAllAndOverride<PrincipalKind[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 役割が指定されていない場合はアクセス許可
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // GraphQL コンテキストからユーザー情報を取得
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphQLContext>();
    const user = ctx.req.user;

    // 認証されていない場合は拒否
    if (!user) {
      this.logger.warn(
        'Unauthenticated user tried to access protected resource',
      );
      throw new ForbiddenException({
        message: 'Authentication required',
        code: 'UNAUTHENTICATED',
      });
    }

    // ユーザーの役割を取得
    const userRole = user.role as PrincipalKind;

    // ユーザーの役割が必要な役割に含まれているか確認
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      this.logger.warn('Authorization failed', {
        userId: user.accountId,
        userRole,
        requiredRoles,
      });

      throw new ForbiddenException({
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        details: `Required roles: ${requiredRoles.join(', ')}`,
      });
    }

    // アクセス許可
    return true;
  }
}
