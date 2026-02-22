/**
 * Personに関するドメインバリデーションルール
 * フレームワーク非依存の純粋関数として定義
 * バックエンドのドメインルールと整合性を保つ
 */

/**
 * Personバリデーションルールの定数
 */
export const PersonValidationRules = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  value: {
    required: true,
  },
} as const;

/**
 * バリデーション結果の型
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Person名のバリデーション
 * @param name - 検証する名前
 * @returns バリデーション結果
 */
export const validatePersonName = (name: string): ValidationResult => {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "名前は必須です",
    };
  }

  if (trimmed.length < PersonValidationRules.name.minLength) {
    return {
      isValid: false,
      error: `名前は${PersonValidationRules.name.minLength}文字以上で入力してください`,
    };
  }

  if (trimmed.length > PersonValidationRules.name.maxLength) {
    return {
      isValid: false,
      error: `名前は${PersonValidationRules.name.maxLength}文字以内で入力してください`,
    };
  }

  return { isValid: true };
};

/**
 * Person値のバリデーション
 * @param value - 検証する値
 * @returns バリデーション結果
 */
export const validatePersonValue = (value: string): ValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "値は必須です",
    };
  }

  return { isValid: true };
};
