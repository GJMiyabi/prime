// インターフェースアダプター層：Person APIとの通信を担当

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import {
  CreateSinglePersonData,
  CreateSinglePersonVars,
  GetPersonData,
  GetPersonVars,
  SinglePerson,
} from "../_types/person";
import { CREATE_SINGLE_PERSON } from "./graphql/mutations/person.mutations";
import { GET_PERSON } from "./graphql/queries/person.queries";

/**
 * Person作成用の入力データ
 */
export interface CreatePersonInput {
  name: string;
  value: string;
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
    include?: PersonIncludeOptions
  ): Promise<GetPersonData["person"] | null>;
}

/**
 * GraphQLを使用したPersonリポジトリの実装
 */
export class GraphQLPersonRepository implements IPersonRepository {
  private client: ApolloClient;

  constructor(graphqlEndpoint: string) {
    this.client = new ApolloClient({
      link: new HttpLink({ uri: graphqlEndpoint }),
      cache: new InMemoryCache(),
    });
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
      console.error("GraphQL create person error:", error);
      throw new Error("Personの作成に失敗しました。");
    }
  }

  /**
   * IDでPersonを取得
   */
  async findById(
    id: string,
    include?: PersonIncludeOptions
  ): Promise<GetPersonData["person"] | null> {
    try {
      const { data } = await this.client.query<GetPersonData, GetPersonVars>({
        query: GET_PERSON,
        variables: { id, include },
        fetchPolicy: "network-only", // 常に最新データを取得
      });

      return data?.person || null;
    } catch (error) {
      console.error("GraphQL get person error:", error);
      throw new Error("Personの取得に失敗しました。");
    }
  }
}
