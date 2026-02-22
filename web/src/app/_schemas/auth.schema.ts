import * as yup from "yup";
import {
  AuthValidationRules,
  validateUsername,
  validatePassword,
} from "../_validations/auth.validation";
import { ERROR_MESSAGES } from "../_constants/error-messages";

/**
 * ログインフォームのYupスキーマ
 * ドメインバリデーションルールをYupスキーマとしてラップ
 */
export const loginSchema = yup.object({
  username: yup
    .string()
    .required(ERROR_MESSAGES.AUTH.LOGIN_FAILED)
    .min(
      AuthValidationRules.username.minLength,
      `ユーザー名は${AuthValidationRules.username.minLength}文字以上で入力してください`
    )
    .max(
      AuthValidationRules.username.maxLength,
      `ユーザー名は${AuthValidationRules.username.maxLength}文字以内で入力してください`
    )
    .matches(
      AuthValidationRules.username.pattern,
      "ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます"
    )
    .test("domain-validation", "", function (value) {
      if (!value) return true; // requiredで既にチェック済み
      const result = validateUsername(value);
      if (!result.isValid) {
        return this.createError({ message: result.error });
      }
      return true;
    }),
  password: yup
    .string()
    .required(ERROR_MESSAGES.AUTH.LOGIN_FAILED)
    .min(
      AuthValidationRules.password.minLength,
      `パスワードは${AuthValidationRules.password.minLength}文字以上で入力してください`
    )
    .test("domain-validation", "", function (value) {
      if (!value) return true; // requiredで既にチェック済み
      const result = validatePassword(value);
      if (!result.isValid) {
        return this.createError({ message: result.error });
      }
      return true;
    }),
});

/**
 * スキーマから型を推論
 */
export type LoginFormData = yup.InferType<typeof loginSchema>;
