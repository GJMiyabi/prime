// GraphQLミューテーション定義：Person API（作成・更新・削除）

import { gql } from "@apollo/client";

/**
 * Person作成ミューテーション
 */
export const CREATE_SINGLE_PERSON = gql`
  mutation CreateSinglePerson($input: SinglePersonAndContactInput!) {
    createSinglePerson(input: $input) {
      id
      name
      value
    }
  }
`;

/**
 * Person更新ミューテーション
 */
export const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID!, $input: PersonUpdateInput!) {
    updatePerson(id: $id, input: $input) {
      id
      name
    }
  }
`;

/**
 * Person削除ミューテーション
 */
export const DELETE_PERSON = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id) {
      success
      message
    }
  }
`;
