import { ContactAddress } from 'src/domains/entities/contact-address';
import { Principal } from 'src/domains/entities/principal';
import { Account } from 'src/domains/entities/account';
import { ContactType } from 'src/domains/type/contact';
export declare abstract class IPersonInputPort {
    abstract createAdmin(input: AdminPersonCreateDto): Promise<AdminPersonCreateDto>;
    abstract delete(id: string): Promise<void>;
    abstract find(id: string): Promise<PersonOutputDto | undefined>;
}
export type AdminPersonCreateDto = {
    id?: string;
    name: string;
    value: string;
    type: ContactType;
};
export type PersonOutputDto = {
    id: string;
    name: string;
    principal?: Principal;
    contactAddress?: ContactAddress[];
    account?: Account;
};
