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

// ContactAddress型
export type ContactAddress = {
  id: string;
  type: string;
  value: string;
};

// Account型
export type Account = {
  id: string;
  username: string;
  email?: string | null;
  isActive: boolean;
};

// Principal型
export type Principal = {
  id: string;
  kind: string;
  account?: Account | null;
};

// Facility型
export type Facility = {
  id: string;
  name: string;
};

// Organization型
export type Organization = {
  id: string;
  name: string;
};

/**
 * Person型 - 詳細なPerson情報
 */
export type Person = {
  id: string;
  name: string;
  contacts?: ContactAddress[] | null;
  principal?: Principal | null;
  facilities?: Facility[] | null;
  organization?: Organization | null;
};

export type GetPersonData = {
  person: Person | null;
};
