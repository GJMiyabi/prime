// フレームワーク層：Person作成カスタムフック（React Hook Formとビジネスロジック統合）

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "../../_lib/toast-helpers";
import { logger } from "../../_lib/logger";
import { personCreateSchema, PersonCreateFormData } from "../../_schemas/person.schema";
import {
  createValidatedPersonName,
  createValidatedPersonValue,
} from "../../_validations/person.validation";
import { usePersonUseCases } from "../factories/usePersonUseCases";

/**
 * Person作成フォーム用Hook
 * React Hook Formとビジネスロジックを統合
 */
export function usePersonCreate() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Formのセットアップ
  const form = useForm<PersonCreateFormData>({
    resolver: yupResolver(personCreateSchema),
    mode: "onBlur", // フォーカスが外れた時にバリデーション
    defaultValues: {
      name: "",
      value: "",
    },
  });

  // UseCaseファクトリーでRepositoryとUseCaseを初期化
  const { create: createPersonUseCase } = usePersonUseCases();

  /**
   * フォーム送信ハンドラ
   * バリデーション済みのデータのみが渡される
   */
  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      // React Hook Formでバリデーション済みのデータをBranded Typeに変換
      const validatedName = createValidatedPersonName(data.name.trim());
      const validatedValue = createValidatedPersonValue(data.value.trim());

      // Branded Type変換時の追加チェック（通常はReact Hook Formで既に通過済）
      if (!validatedName || !validatedValue) {
        errorToast("入力データが正しくありません");
        return;
      }

      // バリデーション済みBranded TypeをUseCaseに渡す
      const result = await createPersonUseCase.execute({
        name: validatedName,
        value: validatedValue,
      });

      if (result.success && result.person) {
        // 成功時：トースト通知を表示してから詳細ページへリダイレクト
        successToast("Personを作成しました");
        router.push(`/person/${result.person.id}`);
      } else {
        // エラーハンドリング
        errorToast(result.error || "Person作成に失敗しました");
      }
    } catch (error) {
      logger.error("Person作成処理で予期しないエラーが発生", {
        component: "usePersonCreate",
        action: "onSubmit",
        error,
        meta: { name: data.name, value: data.value },
      });
      errorToast("予期しないエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,         // React Hook Formのメソッド全体
    onSubmit,     // 送信ハンドラ
    isSubmitting, // 送信中フラグ
  };
}
