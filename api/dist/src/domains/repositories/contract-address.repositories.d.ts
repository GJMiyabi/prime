import { ContactAddress } from '../entities/contact-address';
import { Id } from '../value-object/id';
export declare abstract class IContactAddressCommandRepository {
    abstract create(data: ContactAddress): Promise<ContactAddress>;
    abstract delete(personId: Id): Promise<void>;
}
export declare abstract class IContactAddressQueryRepository {
    abstract findByPersonId(personId: string): Promise<ContactAddress[] | undefined>;
}
