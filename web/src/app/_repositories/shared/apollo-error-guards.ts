// Repository層で使用する共通のApollo Clientエラー型ガード

import type { GraphQLError } from "graphql";

/**
 * GraphQLエラーの型ガード
 * Apollo ClientのエラーオブジェクトがGraphQLエラーを含むかチェック
 */
export function hasGraphQLErrors(
  error: unknown
): error is { graphQLErrors: ReadonlyArray<GraphQLError> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "graphQLErrors" in error &&
    Array.isArray((error as { graphQLErrors: unknown }).graphQLErrors) &&
    (error as { graphQLErrors: unknown[] }).graphQLErrors.length > 0
  );
}

/**
 * ネットワークエラーの型ガード
 * Apollo Clientのエラーオブジェクトがネットワークエラーを含むかチェック
 */
export function hasNetworkError(
  error: unknown
): error is { networkError: Error } {
  return (
    typeof error === "object" &&
    error !== null &&
    "networkError" in error &&
    (error as { networkError: unknown }).networkError != null
  );
}
