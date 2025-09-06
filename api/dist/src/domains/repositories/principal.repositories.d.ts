import { Principal } from '../entities/principal';
import { Id } from '../value-object/id';
export declare abstract class IPrincipalCommandRepository {
    abstract create(data: Principal): Promise<Principal>;
    abstract delete(personId: Id): Promise<void>;
}
export declare abstract class IPrincipalQueryRepository {
    abstract findByPersonId(personId: string): Promise<Principal | undefined>;
}
