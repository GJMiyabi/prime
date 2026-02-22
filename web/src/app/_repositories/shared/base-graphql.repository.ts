// Repository層で使用する共通のApollo Client基底クラス

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import type { GraphQLError } from "graphql";
import { hasGraphQLErrors, hasNetworkError } from "./apollo-error-guards";

/**
 * GraphQL Repository基底クラス
 * ApolloClientの初期化とエラー型ガードを提供
 */
export abstract class BaseGraphQLRepository {
  protected client: ApolloClient;

  constructor(graphqlEndpoint: string) {
    this.client = new ApolloClient({
      link: new HttpLink({ uri: graphqlEndpoint }),
      cache: new InMemoryCache(),
    });
  }

  /**
   * GraphQLエラーの型ガード
   */
  protected hasGraphQLErrors(
    error: unknown
  ): error is { graphQLErrors: ReadonlyArray<GraphQLError> } {
    return hasGraphQLErrors(error);
  }

  /**
   * ネットワークエラーの型ガード
   */
  protected hasNetworkError(
    error: unknown
  ): error is { networkError: Error } {
    return hasNetworkError(error);
  }
}
