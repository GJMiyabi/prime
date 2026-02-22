// フレームワーク層：Person取得カスタムフック（ユースケースとUIの橋渡し）

import { useState, useEffect, useMemo } from "react";
import { PersonIncludeOptions } from "../../_repositories/person.repository";
import { QueryOptions } from "../../_types/repository";
import { Person } from "../../_types/person";
import { usePersonUseCases } from "../factories/usePersonUseCases";

/**
 * Person取得処理を扱うカスタムフック
 * @param id Person ID
 * @param include 関連データの取得オプション
 * @param options クエリオプション（fetchPolicyなど）
 */
export function usePersonGet(
  id: string,
  include?: PersonIncludeOptions,
  options?: QueryOptions
) {
  const [data, setData] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UseCaseファクトリーでRepositoryとUseCaseを初期化
  const { get: getPersonUseCase } = usePersonUseCases();

  // includeオブジェクトの参照変更による無限ループを防ぐため、JSON文字列化してメモ化
  const includeKey = useMemo(
    () => (include ? JSON.stringify(include) : null),
    [include]
  );

  useEffect(() => {
    // IDが無い場合はスキップ
    if (!id) {
      return;
    }

    const fetchPerson = async () => {
      setIsLoading(true);
      setError(null);

      // ユースケースを実行（エラーログはUseCase層で記録済み）
      const result = await getPersonUseCase.execute(id, include, options);

      if (result.success && result.person) {
        setData(result.person);
      } else {
        setError(result.error || null);
        setData(null);
      }

      setIsLoading(false);
    };

    fetchPerson();
    // includeとoptionsは安定したオブジェクト参照として扱う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, includeKey, getPersonUseCase]);

  const refetch = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    // refetch時は最新データを取得するためnetwork-onlyを使用
    const result = await getPersonUseCase.execute(id, include, {
      fetchPolicy: "network-only",
    });

    if (result.success && result.person) {
      setData(result.person);
    } else {
      setError(result.error || null);
      setData(null);
    }

    setIsLoading(false);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
