import { Id } from '../value-object/id';
export type UserProps = {
    id: Id;
    email: string;
    name: string;
    password: string;
};
export declare class User {
    readonly id: Id;
    readonly email: string;
    readonly name: string;
    readonly password: string;
    constructor(props: UserProps);
    getEmail(): string;
    getName(): string;
    getPasswordHash(): string;
}
