import { Account } from '../entities/account';
export declare abstract class IAccountCommandRepository {
    abstract create(data: Account): Promise<Account>;
}
export declare abstract class IAccountQueryRepository {
    abstract findByPrincipalId(principalId: string): Promise<Account | undefined>;
}
