// GraphQLクエリ定義：認証 API（取得）

import { gql } from "@apollo/client";

/**
 * 現在のユーザー情報取得クエリ
 */
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

/**
 * トークン検証クエリ
 */
export const VERIFY_TOKEN = gql`
  query VerifyToken($token: String!) {
    verifyToken(token: $token) {
      valid
      expiresAt
    }
  }
`;
