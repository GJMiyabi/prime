import { ContactType } from 'src/domains/type/contact';

export abstract class IFacilityInputPort {
  abstract create(input: FacilityCreateDto): Promise<FacilityOutputDto>;
  abstract update(input: FacilityUpdateDto): Promise<FacilityUpdateResponse>;
}

export interface FacilityCreateDto {
  name: string;
  idNumber: string;
  contactValue: string;
  contactType?: ContactType;
  personId?: string;
}

export interface ContactAddressDto {
  id?: string;
  value: string;
  type: ContactType;
}

export interface FacilityOutputDto {
  id: string;
  name: string;
  idNumber: string;
  contactAddresses?: ContactAddressDto[];
  persons?: string[];
  organizationId?: string;
}

export interface FacilityUpdateDto {
  id: string;
  name?: string;
  idNumber?: string;
  organizationId?: string;
  persons?: string[];
  contactAddresses?: ContactAddressDto[];
}

export interface FacilityUpdateResponse {
  result: boolean;
  message: string;
  data?: FacilityOutputDto;
}
