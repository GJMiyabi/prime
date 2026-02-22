// フレームワーク層：Person作成カスタムフック（React Hook Formとビジネスロジック統合）

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { personCreateSchema, PersonCreateFormData } from "../../_schemas/person.schema";
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
      // バリデーション済みのデータをUseCaseに渡す
      const result = await createPersonUseCase.execute({
        name: data.name.trim(),
        value: data.value.trim(),
      });

      if (result.success && result.person) {
        // 成功時：詳細ページへリダイレクト
        router.push(`/person/${result.person.id}`);
      } else {
        // エラーハンドリング
        alert(result.error || "Person作成に失敗しました");
      }
    } catch (error) {
      console.error("Person作成エラー:", error);
      alert("予期しないエラーが発生しました");
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
