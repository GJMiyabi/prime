
import { useQuery } from "@apollo/client/react";
import { GetPersonData, GetPersonVars } from "@/app/_types/person";
import { GET_PERSON } from "../form/queries/quires";


export function useGetPerson(id: string, include?: GetPersonVars["include"]) {
  return useQuery<GetPersonData, GetPersonVars>(GET_PERSON, {
    variables: { id, include },
    skip: !id,
  });
}
