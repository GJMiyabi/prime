// Person関連のUseCaseファクトリー

import { useMemo } from "react";
import { GraphQLPersonRepository } from "../../_repositories/person.repository";
import { GetPersonUseCase } from "../../_usecases/person/get-person.usecase";
import { CreatePersonUseCase } from "../../_usecases/person/create-person.usecase";
import { CONFIG } from "../../_constants/config";

/**
 * Person関連のUseCaseを初期化して提供するカスタムフック
 * Repositoryインスタンスを共有し、UseCaseの再生成を防ぐ
 */
export function usePersonUseCases() {
  return useMemo(() => {
    const repository = new GraphQLPersonRepository(CONFIG.GRAPHQL_ENDPOINT);
    return {
      get: new GetPersonUseCase(repository),
      create: new CreatePersonUseCase(repository),
    };
  }, []);
}
