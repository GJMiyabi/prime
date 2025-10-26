import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  login: {
    accessToken: string;
  } | null;
}
