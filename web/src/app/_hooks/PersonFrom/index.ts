// src/hooks/useCreateSinglePerson.ts
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import {
  CreateSinglePersonData,
  CreateSinglePersonVars,
} from "@/app/_types/Person";

const CREATE_SINGLE_PERSON = gql`
  mutation CreateSinglePerson($input: SinglePersonAndContactInput!) {
    createSinglePerson(input: $input) {
      id
      name
      value
    }
  }
`;

export function useCreateSinglePerson() {
  const [createPersonMutation, { data, loading, error }] = useMutation<
    CreateSinglePersonData,
    CreateSinglePersonVars
  >(CREATE_SINGLE_PERSON);

  // ラッパー関数を作って呼び出しやすくする
  const createPerson = async (name: string, value: string) => {
    return createPersonMutation({
      variables: { input: { name, value } },
    });
  };

  return { createPerson, data, loading, error };
}
