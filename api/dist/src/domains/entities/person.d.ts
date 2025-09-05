import { Id } from '../value-object/id';
import { ContactAddress } from './contact-address';
type PersonProps = {
    id: Id;
    name: string;
    contacts?: ContactAddress[];
    principalId?: string;
};
export declare class Person {
    readonly id: Id;
    readonly name: string;
    readonly contacts: ContactAddress[];
    readonly principalId?: string;
    constructor(props: PersonProps);
    getName(): string;
}
export {};
