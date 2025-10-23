import { ContactAddress } from '../entities/contact-address';
import { Id } from '../value-object/id';
import { ContactType } from '../type/contact';

// Query filters for contact address listing
export interface ContactAddressQueryFilters {
  personId?: Id;
  contactType?: ContactType;
  value?: string;
  isActive?: boolean;
}

export abstract class IContactAddressCommandRepository {
  abstract create(contactAddress: ContactAddress): Promise<ContactAddress>;
  abstract update(contactAddress: ContactAddress): Promise<ContactAddress>;
  abstract delete(id: Id): Promise<void>;
  abstract deleteByPersonId(personId: Id): Promise<void>;
  abstract bulkCreate(
    contactAddresses: ContactAddress[],
  ): Promise<ContactAddress[]>;
}

export abstract class IContactAddressQueryRepository {
  abstract find(id: Id): Promise<ContactAddress | undefined>;
  abstract findByPersonId(personId: Id): Promise<ContactAddress[]>;
  abstract findByContactType(
    contactType: ContactType,
    personId?: Id,
  ): Promise<ContactAddress[]>;
  abstract list(
    filters?: ContactAddressQueryFilters,
  ): Promise<ContactAddress[]>;
  abstract exists(id: Id): Promise<boolean>;
  abstract existsByPersonIdAndType(
    personId: Id,
    contactType: ContactType,
  ): Promise<boolean>;
}
