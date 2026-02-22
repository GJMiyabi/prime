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

/**
 * Branded Types - 型レベルでバリデーション済みであることを保証
 * 
 * Branded Typesとは：
 * - 通常のstring型と区別される特別なstring型
 * - コンパイル時に「このstringはバリデーション済み」という情報を保持
 * - 未検証のstringを誤って使用することを防ぐ
 * 
 * 例：
 * const raw: string = "John"; // 未検証の文字列
 * const validated: ValidatedPersonName = raw; // ❌ コンパイルエラー
 * 
 * const validated = createValidatedPersonName(raw); // ✅ バリデーション通過してからのみ作成可能
 */
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { [__brand]: TBrand };

/**
 * バリデーション済みPerson名
 * バリデーション関数を通過した名前のみがこの型を持つ
 */
export type ValidatedPersonName = Brand<string, "ValidatedPersonName">;

/**
 * バリデーション済みPerson値
 * バリデーション関数を通過した値のみがこの型を持つ
 */
export type ValidatedPersonValue = Brand<string, "ValidatedPersonValue">;

/**
 * バリデーション済みPerson名を作成
 * バリデーション失敗時はnullを返す
 * 
 * @param name - 検証する名前
 * @returns バリデーション済み名前、または失敗時null
 * 
 * @example
 * const name = createValidatedPersonName("John Doe");
 * if (name) {
 *   // ここでnameはValidatedPersonName型として安全に使用できる
 *   useCase.execute({ name, ... });
 * }
 */
export const createValidatedPersonName = (
  name: string
): ValidatedPersonName | null => {
  const result = validatePersonName(name);
  if (!result.isValid) {
    return null;
  }
  // バリデーション済みなのでBranded Typeにキャスト
  return name.trim() as ValidatedPersonName;
};

/**
 * バリデーション済みPerson値を作成
 * バリデーション失敗時はnullを返す
 * 
 * @param value - 検証する値
 * @returns バリデーション済み値、または失敗時null
 * 
 * @example
 * const value = createValidatedPersonValue("some-value");
 * if (value) {
 *   // ここでvalueはValidatedPersonValue型として安全に使用できる
 *   useCase.execute({ value, ... });
 * }
 */
export const createValidatedPersonValue = (
  value: string
): ValidatedPersonValue | null => {
  const result = validatePersonValue(value);
  if (!result.isValid) {
    return null;
  }
  // バリデーション済みなのでBranded Typeにキャスト
  return value.trim() as ValidatedPersonValue;
};
