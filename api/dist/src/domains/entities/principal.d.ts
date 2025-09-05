import { Id } from '../value-object/id';
import { PrincipalKind } from '../type/principal-kind';
export type PrincipalProps = {
    id?: Id;
    personId: Id;
    kind: PrincipalKind;
    accountId?: Id;
};
export declare class Principal {
    readonly id: Id;
    readonly personId: Id;
    readonly kind: PrincipalKind;
    readonly accountId?: Id;
    constructor(props: PrincipalProps);
    getId(): string;
    getPersonId(): string;
    getKind(): PrincipalKind;
    getAccountId(): string | undefined;
}
