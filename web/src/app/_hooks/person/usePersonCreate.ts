// フレームワーク層：Person作成カスタムフック（ユースケースとUIの橋渡し）

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GraphQLPersonRepository } from "../../_repositories/person.repository";
import { CreatePersonUseCase } from "../../_usecases/person/create-person.usecase";
import { CreatePersonInput } from "../../_repositories/person.repository";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

/**
 * Person作成処理を扱うカスタムフック
 */
export function usePersonCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // リポジトリとユースケースをメモ化して再生成を防ぐ
  const createPersonUseCase = useMemo(() => {
    const personRepository = new GraphQLPersonRepository(GRAPHQL_ENDPOINT);
    return new CreatePersonUseCase(personRepository);
  }, []);

  /**
   * Person作成処理を実行
   */
  const executeCreate = async (
    input: CreatePersonInput
  ): Promise<boolean> => {
    setIsLoading(true);
    setError("");

    try {
      // ユースケースを実行
      const result = await createPersonUseCase.execute(input);

      if (result.success && result.person) {
        // 作成成功時は詳細ページへリダイレクト
        router.push(`/person/${result.person.id}`);
        return true;
      } else {
        setError(result.error || "Personの作成に失敗しました。");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "予期しないエラーが発生しました。";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    executeCreate,
    isLoading,
    error,
    clearError,
  };
}
