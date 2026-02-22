// ユースケース層：JWT関連のユーティリティ

import { jwtDecode } from "jwt-decode";
import { logger } from "../../_lib/logger";
import { JWTPayload, User } from "../../_types/auth";

/**
 * JWTトークンをデコードしてユーザー情報に変換
 */
export function decodeTokenToUser(accessToken: string): User {
  try {
    const decodedToken = jwtDecode<JWTPayload>(accessToken);

    return {
      id: decodedToken.accountId,
      username: decodedToken.username,
      email: decodedToken.email || `${decodedToken.username}@example.com`,
      role: decodedToken.role,
      principalId: decodedToken.sub,
    };
  } catch (error) {
    logger.error("JWTトークンのデコードに失敗", {
      component: "jwt.utils",
      action: "decodeTokenToUser",
      error,
    });
    throw new Error("認証情報の処理に問題が発生しました。");
  }
}
