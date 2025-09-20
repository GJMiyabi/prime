import { ContactAddress } from 'src/domains/entities/contact-address';
import { Principal } from 'src/domains/entities/principal';
import { Account } from 'src/domains/entities/account';
import { ContactType } from 'src/domains/type/contact';

export abstract class IPersonInputPort {
  abstract createAdmin(
    input: AdminPersonCreateDto,
  ): Promise<AdminPersonCreateDto>;
  abstract delete(id: string): Promise<void>;

  abstract find(
    id: string,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facilities?: boolean;
      organization?: boolean;
    },
  ): Promise<PersonOutputDto | undefined>;

  abstract createPrson(
    input: SinglePersonAndContact,
  ): Promise<SinglePersonAndContactOutput>;
}

export type SinglePersonAndContact = {
  name: string;
  value: string;
};

export type SinglePersonAndContactOutput = {
  id: string;
  name: string;
  value: string;
};

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
