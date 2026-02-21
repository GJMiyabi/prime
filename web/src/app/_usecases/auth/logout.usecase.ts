// ユースケース層：ログアウトビジネスロジック

/**
 * ログアウトユースケース
 */
export class LogoutUseCase {
  /**
   * ログアウト処理を実行
   * @returns ログアウト後のリダイレクト先
   */
  execute(): string {
    // ログアウト後は常にログインページへリダイレクト
    return "/login";
  }
}
