import { ContactType } from '../type/contact';
import { Id } from '../value-object/id';
export type ContactAddressProps = {
    id?: Id;
    personId: Id;
    value: string;
    type: ContactType;
};
export declare class ContactAddress {
    readonly id: Id;
    readonly personId: Id;
    readonly value: string;
    readonly type: ContactType;
    constructor(props: ContactAddressProps);
    getId(): string;
    getPersonId(): string;
    getValue(): string;
    getType(): ContactType;
}
