import { ContactAddress } from '../entities/contact-address';
import { Id } from '../value-object/id';

export abstract class IContactAddressCommandRepository {
  abstract create(data: ContactAddress): Promise<ContactAddress>;
  abstract delete(personId: Id): Promise<void>;
  abstract update(c: ContactAddress): Promise<ContactAddress>;
}

export abstract class IContactAddressQueryRepository {
  abstract findByPersonId(
    personId: string,
  ): Promise<ContactAddress[] | undefined>;
  abstract find(id: Id): Promise<ContactAddress | undefined>;
}
