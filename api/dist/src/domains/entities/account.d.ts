import { Id } from '../value-object/id';
export type AccountProps = {
    id?: Id;
    principalId: Id;
    username: string;
    password: string;
    isActive?: boolean;
    provider?: string;
    providerSub?: string | null;
    email?: string | null;
    lastLoginAt?: Date | null;
};
export declare class Account {
    readonly id: Id;
    readonly principalId: Id;
    readonly username: string;
    readonly password: string;
    readonly isActive: boolean;
    readonly provider: string;
    readonly providerSub?: string | null;
    readonly email?: string | null;
    readonly lastLoginAt?: Date | null;
    constructor(props: AccountProps);
    getId(): string;
    getPrincipalId(): string;
    getUsername(): string;
    getPassword(): string;
    isEnabled(): boolean;
    getProvider(): string;
    getProviderSub(): string | null | undefined;
    getEmail(): string | null | undefined;
    getLastLoginAt(): Date | null | undefined;
}
