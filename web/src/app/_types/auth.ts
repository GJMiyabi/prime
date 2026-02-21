// ドメイン層：認証に関する型定義

/**
 * JWTペイロードの型定義
 */
export interface JWTPayload {
  sub: string; // principalId
  username: string;
  email?: string;
  role: string;
  accountId: string;
  iat?: number;
  exp?: number;
}

/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  principalId: string;
}

/**
 * ログイン入力の型定義
 */
export interface LoginInput {
  username: string;
  password: string;
}

/**
 * ログインレスポンスの型定義
 */
export interface LoginResponse {
  login: {
    accessToken: string;
  } | null;
}

/**
 * ユーザーロールの列挙型
 */
export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}
