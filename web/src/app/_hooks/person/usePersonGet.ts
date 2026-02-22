// フレームワーク層：Person取得カスタムフック（ユースケースとUIの橋渡し）

import { useState, useEffect, useMemo } from "react";
import { GraphQLPersonRepository } from "../../_repositories/person.repository";
import { GetPersonUseCase } from "../../_usecases/person/get-person.usecase";
import { PersonIncludeOptions } from "../../_repositories/person.repository";
import { GetPersonData } from "../../_types/person";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

/**
 * Person取得処理を扱うカスタムフック
 */
export function usePersonGet(id: string, include?: PersonIncludeOptions) {
  const [data, setData] = useState<GetPersonData["person"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // リポジトリとユースケースをメモ化して再生成を防ぐ
  const getPersonUseCase = useMemo(() => {
    const personRepository = new GraphQLPersonRepository(GRAPHQL_ENDPOINT);
    return new GetPersonUseCase(personRepository);
  }, []);

  useEffect(() => {
    // IDが無い場合はスキップ
    if (!id) {
      return;
    }

    const fetchPerson = async () => {
      setIsLoading(true);
      setError("");

      try {
        // ユースケースを実行
        const result = await getPersonUseCase.execute(id, include);

        if (result.success && result.person) {
          setData(result.person);
        } else {
          setError(result.error || "Personの取得に失敗しました。");
          setData(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "予期しないエラーが発生しました。";
        setError(errorMessage);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [id, include, getPersonUseCase]);

  const refetch = async () => {
    if (!id) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await getPersonUseCase.execute(id, include);

      if (result.success && result.person) {
        setData(result.person);
      } else {
        setError(result.error || "Personの取得に失敗しました。");
        setData(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "予期しないエラーが発生しました。";
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
