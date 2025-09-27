import { ContactType } from 'src/domains/type/contact';
import { PrincipalKind } from 'src/domains/type/principal-kind';

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

  abstract createPerson(
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

export type ContactAddressDTO = {
  id: string;
  type: ContactType;
  value: string;
};

export type AccountDTO = {
  id: string;
  username: string;
  email?: string | null;
  isActive: boolean;
};
export type PrincipalDTO = {
  id: string;
  kind: PrincipalKind;
  account?: AccountDTO | null;
};
export type FacilityDTO = { id: string; name: string };
export type OrganizationDTO = { id: string; name: string };

export type PersonOutputDto = {
  id: string;
  name: string;
  contacts?: ContactAddressDTO[];
  principal?: PrincipalDTO | null;
  facilities?: FacilityDTO[] | null;
  organization?: OrganizationDTO | null;
};
