/**
 * 認証に関するドメインバリデーションルール
 * フレームワーク非依存の純粋関数として定義
 * バックエンドのドメインルールと整合性を保つ
 */

import type { ValidationResult } from "./person.validation";

/**
 * 認証バリデーションルールの定数
 */
export const AuthValidationRules = {
  username: {
    minLength: 3,
    maxLength: 50,
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/, // 英数字、アンダースコア、ハイフンのみ
  },
  password: {
    minLength: 8,
    required: true,
  },
} as const;

/**
 * ユーザー名のバリデーション
 * @param username - 検証するユーザー名
 * @returns バリデーション結果
 */
export const validateUsername = (username: string): ValidationResult => {
  const trimmed = username.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "ユーザー名は必須です",
    };
  }

  if (trimmed.length < AuthValidationRules.username.minLength) {
    return {
      isValid: false,
      error: `ユーザー名は${AuthValidationRules.username.minLength}文字以上で入力してください`,
    };
  }

  if (trimmed.length > AuthValidationRules.username.maxLength) {
    return {
      isValid: false,
      error: `ユーザー名は${AuthValidationRules.username.maxLength}文字以内で入力してください`,
    };
  }

  if (!AuthValidationRules.username.pattern.test(trimmed)) {
    return {
      isValid: false,
      error: "ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます",
    };
  }

  return { isValid: true };
};

/**
 * パスワードのバリデーション
 * @param password - 検証するパスワード
 * @returns バリデーション結果
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: "パスワードは必須です",
    };
  }

  if (password.length < AuthValidationRules.password.minLength) {
    return {
      isValid: false,
      error: `パスワードは${AuthValidationRules.password.minLength}文字以上で入力してください`,
    };
  }

  return { isValid: true };
};
