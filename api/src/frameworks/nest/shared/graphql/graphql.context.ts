export class GraphContext {
  constructor(readonly request: Request) {}

  /**
   * 認証されたユーザー情報を取得
   * JwtStrategy.validate() の返り値が req.user に格納される
   */
  get user() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return (this.request as any).user;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return this.user?.sub;
  }
}
