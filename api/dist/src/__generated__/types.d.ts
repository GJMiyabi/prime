export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
export type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
    Date: {
        input: any;
        output: any;
    };
};
export type Mutation = {
    __typename?: 'Mutation';
    saveUser: User;
};
export type MutationSaveUserArgs = {
    input: UserSaveInputDto;
};
export type Query = {
    __typename?: 'Query';
    user: User;
};
export type QueryUserArgs = {
    input: Scalars['ID']['input'];
};
export type User = {
    __typename?: 'User';
    email: Scalars['String']['output'];
    id: Scalars['ID']['output'];
    name?: Maybe<Scalars['String']['output']>;
};
export type UserSaveInputDto = {
    email: Scalars['String']['input'];
    id?: InputMaybe<Scalars['ID']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    password: Scalars['String']['input'];
};
