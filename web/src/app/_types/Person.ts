// src/types/graphql.ts などにまとめておくと便利

export type SinglePerson = {
  id: string;
  name: string;
  value: string;
  __typename: "SinglePerson";
};

export type CreateSinglePersonData = {
  createSinglePerson: SinglePerson;
};

export type CreateSinglePersonVars = {
  input: {
    name: string;
    value: string;
  };
};
