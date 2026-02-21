// src/hooks/useCreateSinglePerson.ts
import { CREATE_SINGLE_PERSON } from "./mutations/mutations";
import { useMutation } from "@apollo/client/react";
import {
  CreateSinglePersonData,
  CreateSinglePersonVars,
} from "@/app/_types/person";

export function useCreateSinglePerson() {
  const [createPersonMutation, { data, loading, error }] = useMutation<
    CreateSinglePersonData,
    CreateSinglePersonVars
  >(CREATE_SINGLE_PERSON);

  const createPerson = async (name: string, value: string) => {
    return createPersonMutation({
      variables: { input: { name, value } },
    });
  };

  return { createPerson, data, loading, error };
}
