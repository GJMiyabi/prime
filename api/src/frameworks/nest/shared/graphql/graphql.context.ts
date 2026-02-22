import { RequestWithUser, AuthenticatedUser } from '../types/request.types';

export class GraphContext {
  constructor(readonly request: RequestWithUser) {}

  /**
   * 認証されたユーザー情報を取得
   * JwtStrategy.validate() の返り値が req.user に格納される
   */
  get user(): AuthenticatedUser | undefined {
    return this.request.user;
  }

  /**
   * 認証済みかどうかをチェック
   */
  get isAuthenticated(): boolean {
    return !!this.user;
  }

  /**
   * 認証されたプリンシパルIDを取得
   */
  get principalId(): string | undefined {
    return this.user?.sub;
  }
}
