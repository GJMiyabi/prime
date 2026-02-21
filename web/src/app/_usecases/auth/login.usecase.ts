// ユースケース層：ログインビジネスロジック

import { IAuthRepository } from "../../_repositories/auth.repository";
import { LoginInput, User } from "../../_types/auth";
import { decodeTokenToUser } from "./jwt.utils";

/**
 * ログインユースケースの結果
 */
export interface LoginResult {
  success: boolean;
  accessToken?: string;
  user?: User;
  error?: string;
}

/**
 * ログインユースケース
 */
export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * ログイン処理を実行
   */
  async execute(input: LoginInput): Promise<LoginResult> {
    try {
      // 1. リポジトリを通じてログインAPIを呼び出す
      const accessToken = await this.authRepository.login(input);

      if (!accessToken) {
        return {
          success: false,
          error:
            "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。",
        };
      }

      // 2. トークンをデコードしてユーザー情報を取得
      const user = decodeTokenToUser(accessToken);

      return {
        success: true,
        accessToken,
        user,
      };
    } catch (error) {
      console.error("Login use case error:", error);
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error:
          "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。",
      };
    }
  }
}
