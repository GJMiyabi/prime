import { ContactAddress } from 'src/domains/entities/contact-address';
import { ContactAddressSaveDto } from '../contact-address/input-port';

export abstract class IFacilityInputPort {
  abstract create(input: FacilityCreateDto): Promise<FacilityOutputDto>;
  abstract update(input: FacilityUpdateDto): Promise<FacilityUpdateResponse>;
}

export type FacilityCreateDto = {
  name: string;
  IDNumber: string;
  value: string;
  personId: string;
};

export type FacilityOutputDto = {
  name: string;
  IDNumber: string;
  contactAddress?: ContactAddress[];
};

export type FacilityUpdateDto = {
  id: string;
  name: string;
  IDNumber: string;
  organizationId?: string;
  persons?: string[];
  contactAddresses?: ContactAddressSaveDto[];
};

export type FacilityUpdateOutputDto = {
  id: string;
  name: string;
  IDNumber: string;
  organizationId?: string;
  persons?: string[];
  contactAddresses?: string[];
};

export type FacilityUpdateResponse = {
  result: boolean;
  message: string;
  data: FacilityUpdateOutputDto | undefined;
};
