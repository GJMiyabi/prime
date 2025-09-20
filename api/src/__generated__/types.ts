export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  DateTime: { input: any; output: any };
};

export type Account = {
  __typename?: 'Account';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  principalId: Scalars['ID']['output'];
  provider: Scalars['String']['output'];
  providerSub?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type AdminPerson = {
  __typename?: 'AdminPerson';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: ContactType;
  value: Scalars['String']['output'];
};

export type AdminPersonCreateInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  type: ContactType;
  value: Scalars['String']['input'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
};

export type ContactAddress = {
  __typename?: 'ContactAddress';
  id: Scalars['ID']['output'];
  type: ContactType;
  value: Scalars['String']['output'];
};

export enum ContactType {
  Address = 'ADDRESS',
  Email = 'EMAIL',
  Phone = 'PHONE',
}

export type Facility = {
  __typename?: 'Facility';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LoginInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createSinglePerson: SinglePerson;
  deletePerson: Scalars['Boolean']['output'];
  login?: Maybe<AuthPayload>;
  saveAdminPeron: AdminPerson;
};

export type MutationCreateSinglePersonArgs = {
  input: SinglePersonAndContactInput;
};

export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationSaveAdminPeronArgs = {
  input: AdminPersonCreateInput;
};

export type Organization = {
  __typename?: 'Organization';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Person = {
  __typename?: 'Person';
  contacts?: Maybe<Array<ContactAddress>>;
  facilities?: Maybe<Array<Facility>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  principal?: Maybe<Principal>;
};

export type PersonIncludeInput = {
  contacts?: InputMaybe<Scalars['Boolean']['input']>;
  facility?: InputMaybe<Scalars['Boolean']['input']>;
  organization?: InputMaybe<Scalars['Boolean']['input']>;
  principal?: InputMaybe<PrincipalIncludeInput>;
};

export type Principal = {
  __typename?: 'Principal';
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  kind: PrincipalKind;
  personId: Scalars['ID']['output'];
};

export type PrincipalIncludeInput = {
  account?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum PrincipalKind {
  Admin = 'ADMIN',
  Stakeholder = 'STAKEHOLDER',
  Student = 'STUDENT',
  Teacher = 'TEACHER',
}

export type Query = {
  __typename?: 'Query';
  person?: Maybe<Person>;
};

export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
  include?: InputMaybe<PersonIncludeInput>;
};

export type SinglePerson = {
  __typename?: 'SinglePerson';
  id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type SinglePersonAndContactInput = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
};
