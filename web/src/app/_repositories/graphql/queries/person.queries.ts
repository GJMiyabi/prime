// GraphQLクエリ定義：Person API（取得）

import { gql } from "@apollo/client";

/**
 * Person取得クエリ
 */
export const GET_PERSON = gql`
  query GetPerson($id: ID!, $include: PersonIncludeInput) {
    person(id: $id, include: $include) {
      id
      name
      contacts {
        id
        type
        value
      }
      principal {
        id
        kind
        account {
          id
          username
          email
          isActive
        }
      }
      facilities {
        id
        name
      }
      organization {
        id
        name
      }
    }
  }
`;

/**
 * Person一覧取得クエリ
 */
export const GET_PEOPLE = gql`
  query GetPeople($filter: PersonFilterInput, $pagination: PaginationInput) {
    people(filter: $filter, pagination: $pagination) {
      items {
        id
        name
      }
      total
    }
  }
`;
