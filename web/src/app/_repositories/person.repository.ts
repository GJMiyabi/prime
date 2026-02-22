// インターフェースアダプター層：Person APIとの通信を担当

import {
  CreateSinglePersonData,
  CreateSinglePersonVars,
  GetPersonData,
  GetPersonVars,
  SinglePerson,
  Person,
} from "../_types/person";
import {
  ValidatedPersonName,
  ValidatedPersonValue,
} from "../_validations/person.validation";
import { QueryOptions } from "../_types/repository";
import { CREATE_SINGLE_PERSON } from "./graphql/mutations/person.mutations";
import { GET_PERSON } from "./graphql/queries/person.queries";
import { ERROR_MESSAGES } from "../_constants/error-messages";
import { BaseGraphQLRepository } from "./shared/base-graphql.repository";

/**
 * Person作成用の入力データ
 * Branded Typesを使用することで、バリデーション済みデータのみ受け付ける
 */
export interface CreatePersonInput {
  name: ValidatedPersonName;
  value: ValidatedPersonValue;
}

/**
 * Person取得用のIncludeオプション
 */
export interface PersonIncludeOptions {
  contacts?: boolean;
  principal?: { account?: boolean };
  facilities?: boolean;
  organization?: boolean;
}

/**
 * Personリポジトリのインターフェース
 */
export interface IPersonRepository {
  create(input: CreatePersonInput): Promise<SinglePerson | null>;
  findById(
    id: string,
    include?: PersonIncludeOptions,
    options?: QueryOptions
  ): Promise<Person | null>;
}

/**
 * GraphQLを使用したPersonリポジトリの実装
 * BaseGraphQLRepositoryを継承してApolloClientとエラー型ガードを共有
 */
export class GraphQLPersonRepository extends BaseGraphQLRepository implements IPersonRepository {
  constructor(graphqlEndpoint: string) {
    super(graphqlEndpoint);
  }

  /**
   * 新しいPersonを作成
   */
  async create(input: CreatePersonInput): Promise<SinglePerson | null> {
    try {
      const { data } = await this.client.mutate<
        CreateSinglePersonData,
        CreateSinglePersonVars
      >({
        mutation: CREATE_SINGLE_PERSON,
        variables: { input },
      });

      return data?.createSinglePerson || null;
    } catch (error) {
      // GraphQLエラーの詳細を処理
      if (this.hasGraphQLErrors(error)) {
        const message = error.graphQLErrors[0].message;
        throw new Error(`${ERROR_MESSAGES.PERSON.CREATE_FAILED}: ${message}`);
      }
      // ネットワークエラー
      if (this.hasNetworkError(error)) {
        throw new Error(ERROR_MESSAGES.COMMON.NETWORK_ERROR);
      }
      throw new Error(ERROR_MESSAGES.PERSON.CREATE_FAILED);
    }
  }

  /**
   * IDでPersonを取得
   */
  async findById(
    id: string,
    include?: PersonIncludeOptions,
    options?: QueryOptions
  ): Promise<Person | null> {
    try {
      const { data } = await this.client.query<GetPersonData, GetPersonVars>({
        query: GET_PERSON,
        variables: { id, include },
        // デフォルトはcache-first、必要に応じてnetwork-onlyなどを指定可能
        fetchPolicy: options?.fetchPolicy || "cache-first",
      });

      return (data?.person as Person) || null;
    } catch (error) {
      // GraphQLエラーの詳細を処理
      if (this.hasGraphQLErrors(error)) {
        const message = error.graphQLErrors[0].message;
        throw new Error(`${ERROR_MESSAGES.PERSON.FETCH_FAILED}: ${message}`);
      }
      // ネットワークエラー
      if (this.hasNetworkError(error)) {
        throw new Error(ERROR_MESSAGES.COMMON.NETWORK_ERROR);
      }
      throw new Error(ERROR_MESSAGES.PERSON.FETCH_FAILED);
    }
  }
}
