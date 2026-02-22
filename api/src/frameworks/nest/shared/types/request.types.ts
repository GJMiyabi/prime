/**
 * Express Request拡張型定義
 * Passport.jsによる認証情報を含むリクエスト型
 */

import { Request } from 'express';

/**
 * 認証されたユーザー情報
 * JwtStrategy.validate() または LocalStrategy.validate() の返り値
 */
export interface AuthenticatedUser {
  userId: string;
  role?: string;
  sub?: string;
}

/**
 * ユーザー認証情報を含むExpressリクエスト
 */
export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
