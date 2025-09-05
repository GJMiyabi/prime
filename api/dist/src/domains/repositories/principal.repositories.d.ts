import { Principal } from '../entities/principal';
export declare abstract class IPrincipalCommandRepository {
    abstract create(data: Principal): Promise<Principal>;
}
export declare abstract class IPrincipalQueryRepository {
    abstract findByPersonId(personId: string): Promise<Principal | undefined>;
}
