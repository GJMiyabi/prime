import { ContactAddress } from '../entities/contact-address';
export declare abstract class IContactAddressCommandRepository {
    abstract create(data: ContactAddress): Promise<ContactAddress>;
}
export declare abstract class IContactAddressQueryRepository {
    abstract findByPersonId(personId: string): Promise<ContactAddress[] | undefined>;
}
