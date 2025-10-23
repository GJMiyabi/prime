import { ContactType } from 'src/domains/type/contact';
import { PrincipalKind } from 'src/domains/type/principal-kind';

// Include options type for better reusability
export interface PersonIncludeOptions {
  contacts?: boolean;
  principal?: { include?: { account?: boolean } };
  facilities?: boolean;
  organization?: boolean;
}

export abstract class IPersonInputPort {
  abstract createAdmin(input: AdminPersonCreateDto): Promise<PersonOutputDto>;

  abstract delete(id: string): Promise<void>;

  abstract find(
    id: string,
    include?: PersonIncludeOptions,
  ): Promise<PersonOutputDto | undefined>;

  abstract createPerson(input: PersonCreateDto): Promise<PersonOutputDto>;
}

// Input DTOs
export interface PersonCreateDto {
  name: string;
  contactValue: string;
  contactType?: ContactType;
}

export interface AdminPersonCreateDto extends PersonCreateDto {
  id?: string;
  contactType: ContactType; // Required for admin
}

// Legacy types (deprecated - use PersonCreateDto instead)
export type SinglePersonAndContact = {
  name: string;
  value: string;
};

export type SinglePersonAndContactOutput = {
  id: string;
  name: string;
  value: string;
};

// Output DTOs
export interface ContactAddressDto {
  id: string;
  type: ContactType;
  value: string;
}

export interface AccountDto {
  id: string;
  username: string;
  email?: string | null;
  isActive: boolean;
}

export interface PrincipalDto {
  id: string;
  kind: PrincipalKind;
  account?: AccountDto | null;
}

export interface FacilityDto {
  id: string;
  name: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
}

export interface PersonOutputDto {
  id: string;
  name: string;
  contacts?: ContactAddressDto[];
  principal?: PrincipalDto | null;
  facilities?: FacilityDto[] | null;
  organization?: OrganizationDto | null;
}
