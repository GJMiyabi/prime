// フレームワーク層：Person作成カスタムフック（ユースケースとUIの橋渡し）

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePersonInput } from "../../_repositories/person.repository";
import { usePersonUseCases } from "../factories/usePersonUseCases";

/**
 * Person作成処理を扱うカスタムフック
 */
export function usePersonCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // UseCaseファクトリーでRepositoryとUseCaseを初期化
  const { create: createPersonUseCase } = usePersonUseCases();

  /**
   * Person作成処理を実行
   */
  const executeCreate = async (
    input: CreatePersonInput
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // ユースケースを実行（エラーログはUseCase層で記録済み）
    const result = await createPersonUseCase.execute(input);

    if (result.success && result.person) {
      // 作成成功時は詳細ページへリダイレクト
      router.push(`/person/${result.person.id}`);
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || null);
      setIsLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    executeCreate,
    isLoading,
    error,
    clearError,
  };
}
