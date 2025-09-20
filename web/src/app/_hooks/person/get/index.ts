import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { GetPersonData, GetPersonVars } from "@/app/_types/person";

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

export function useGetPerson(id: string, include?: GetPersonVars["include"]) {
  return useQuery<GetPersonData, GetPersonVars>(GET_PERSON, {
    variables: { id, include },
    skip: !id,
  });
}
