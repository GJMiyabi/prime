import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { GetPersonData, GetPersonVars } from "@/app/_types/person";

export const GET_PERSON = gql`
  query GetPerson($id: ID!) {
    person(id: $id) {
      id
      name
    }
  }
`;

export function useGetPerson(id: string | null | undefined) {
  const skip = !id;
  const variables: GetPersonVars = skip
    ? ({ id: "" } as GetPersonVars)
    : { id };

  const { data, loading, error, refetch } = useQuery<
    GetPersonData,
    GetPersonVars
  >(GET_PERSON, {
    variables,
    skip,
    fetchPolicy: "cache-first",
  });

  return {
    person: data?.person ?? null,
    loading,
    error,
    refetch,
  };
}
