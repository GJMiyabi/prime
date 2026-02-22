// インターフェースアダプター層：認証APIとの通信を担当

import { LoginInput, LoginResponse } from "../_types/auth";
import { LOGIN_MUTATION } from "./graphql/mutations/auth.mutations";
import { ERROR_MESSAGES } from "../_constants/error-messages";
import { BaseGraphQLRepository } from "./shared/base-graphql.repository";

/**
 * 認証リポジトリのインターフェース
 */
export interface IAuthRepository {
  login(input: LoginInput): Promise<string | null>;
}

/**
 * GraphQLを使用した認証リポジトリの実装
 * BaseGraphQLRepositoryを継承してApolloClientとエラー型ガードを共有
 */
export class GraphQLAuthRepository extends BaseGraphQLRepository implements IAuthRepository {
  constructor(graphqlEndpoint: string) {
    super(graphqlEndpoint);
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
      // GraphQLエラー（認証失敗など）
      if (this.hasGraphQLErrors(error)) {
        const message = error.graphQLErrors[0].message;
        // 認証エラーの場合は元のメッセージを使用
        throw new Error(message || ERROR_MESSAGES.AUTH.LOGIN_FAILED);
      }
      // ネットワークエラー
      if (this.hasNetworkError(error)) {
        throw new Error(ERROR_MESSAGES.COMMON.NETWORK_ERROR);
      }
      throw new Error(ERROR_MESSAGES.AUTH.LOGIN_FAILED);
    }
  }
}
