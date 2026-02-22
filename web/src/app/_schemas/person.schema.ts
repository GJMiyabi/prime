import * as yup from "yup";
import {
  PersonValidationRules,
  validatePersonName,
  validatePersonValue,
} from "../_validations/person.validation";
import { ERROR_MESSAGES } from "../_constants/error-messages";

/**
 * Person作成フォームのYupスキーマ
 * ドメインバリデーションルールをYupスキーマとしてラップ
 */
export const personCreateSchema = yup.object({
  name: yup
    .string()
    .required(ERROR_MESSAGES.PERSON.NAME_REQUIRED)
    .min(
      PersonValidationRules.name.minLength,
      `名前は${PersonValidationRules.name.minLength}文字以上で入力してください`
    )
    .max(
      PersonValidationRules.name.maxLength,
      `名前は${PersonValidationRules.name.maxLength}文字以内で入力してください`
    )
    .test("domain-validation", "", function (value) {
      if (!value) return true; // requiredで既にチェック済み
      const result = validatePersonName(value);
      if (!result.isValid) {
        return this.createError({ message: result.error });
      }
      return true;
    }),
  value: yup
    .string()
    .required(ERROR_MESSAGES.PERSON.VALUE_REQUIRED)
    .test("domain-validation", "", function (value) {
      if (!value) return true; // requiredで既にチェック済み
      const result = validatePersonValue(value);
      if (!result.isValid) {
        return this.createError({ message: result.error });
      }
      return true;
    }),
});

/**
 * スキーマから型を推論
 */
export type PersonCreateFormData = yup.InferType<typeof personCreateSchema>;
