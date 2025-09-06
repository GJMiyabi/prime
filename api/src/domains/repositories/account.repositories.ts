import { Account } from '../entities/account';
import { Id } from '../value-object/id';

export abstract class IAccountCommandRepository {
  abstract create(data: Account): Promise<Account>;
  abstract delete(principalId: Id): Promise<void>;
}

export abstract class IAccountQueryRepository {
  abstract findByPrincipalId(principalId: string): Promise<Account | undefined>;
  abstract findByUsername(username: string): Promise<Account | undefined>;
}
