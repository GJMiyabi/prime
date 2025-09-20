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

export type GetPersonData = {
  person: { id: string; name: string } | null;
};

export type GetPersonVars = {
  id: string;
};
