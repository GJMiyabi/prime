import { ContactType } from 'src/__generated__/types';
import { ContactAddress } from 'src/domains/entities/contact-address';

export abstract class IFacilityInputPort {
  abstract create(input: FacilityCreateDto): Promise<FacilityOutputDto>;
}

export type FacilityCreateDto = {
  name: string;
  IDNumber: string;
  value: string;
  type: ContactType;
};

export type FacilityOutputDto = {
  name: string;
  IDNumber: string;
  contactAddress?: ContactAddress[];
};
