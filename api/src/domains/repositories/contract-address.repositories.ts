import { ContactAddress } from '../entities/contact-address';

export abstract class IContactAddressCommandRepository {
  abstract create(data: ContactAddress): Promise<ContactAddress>;
}

export abstract class IContactAddressQueryRepository {
  abstract findByPersonId(
    personId: string,
  ): Promise<ContactAddress[] | undefined>;
}
