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

export type GetPersonVars = {
  id: string;
  include?: {
    contacts?: boolean;
    principal?: { account?: boolean };
    facilities?: boolean;
    organization?: boolean;
  };
};

export type GetPersonData = {
  person: {
    id: string;
    name: string;
    contacts?: { id: string; type: string; value: string }[] | null;
    principal?: {
      id: string;
      kind: string;
      account?: {
        id: string;
        username: string;
        email?: string | null;
        isActive: boolean;
      } | null;
    } | null;
    facilities?: { id: string; name: string }[] | null;
    organization?: { id: string; name: string } | null;
  } | null;
};
