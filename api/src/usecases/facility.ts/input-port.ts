import { ContactAddress } from 'src/domains/entities/contact-address';

export abstract class IFacilityInputPort {
  abstract create(input: FacilityCreateDto): Promise<FacilityOutputDto>;
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
