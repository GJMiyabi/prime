// ユースケース層：ログインビジネスロジック

import { logger } from "../../_lib/logger";
import { IAuthRepository } from "../../_repositories/auth.repository";
import { LoginInput, User } from "../../_types/auth";
import { decodeTokenToUser } from "./jwt.utils";
import { ERROR_MESSAGES } from "../../_constants/error-messages";

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
          error: ERROR_MESSAGES.AUTH.LOGIN_FAILED,
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
      // エラーログはここで一元的に記録
      logger.error("ログインユースケースでエラーが発生", {
        component: "LoginUseCase",
        action: "execute",
        error,
        meta: { username: input.username },
      });
      
      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      };
    }
  }
}
