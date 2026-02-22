// インターフェースアダプター層：認証APIとの通信を担当

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { LoginInput, LoginResponse } from "../_types/auth";
import { LOGIN_MUTATION } from "./graphql/mutations/auth.mutations";

/**
 * 認証リポジトリのインターフェース
 */
export interface IAuthRepository {
  login(input: LoginInput): Promise<string | null>;
}

/**
 * GraphQLを使用した認証リポジトリの実装
 */
export class GraphQLAuthRepository implements IAuthRepository {
  private client: ApolloClient;

  constructor(graphqlEndpoint: string) {
    this.client = new ApolloClient({
      link: new HttpLink({ uri: graphqlEndpoint }),
      cache: new InMemoryCache(),
    });
  }

  /**
   * ログイン処理を実行し、アクセストークンを返す
   */
  async login(input: LoginInput): Promise<string | null> {
    try {
      const { data } = await this.client.mutate<
        LoginResponse,
        { input: LoginInput }
      >({
        mutation: LOGIN_MUTATION,
        variables: { input },
      });

      return data?.login?.accessToken || null;
    } catch (error) {
      console.error("GraphQL login error:", error);
      throw new Error("ログインに失敗しました。");
    }
  }
}
