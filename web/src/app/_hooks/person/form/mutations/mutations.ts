import { gql } from "@apollo/client";

export const CREATE_SINGLE_PERSON = gql`
  mutation CreateSinglePerson($input: SinglePersonAndContactInput!) {
    createSinglePerson(input: $input) {
      id
      name
      value
    }
  }
`;
