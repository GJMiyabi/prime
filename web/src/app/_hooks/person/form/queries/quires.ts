import { gql } from "@apollo/client";

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