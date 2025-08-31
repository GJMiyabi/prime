import { Id } from '../value-object/id';
import { Account } from '../entities/account';

export abstract class IPrincipalCommandRepository {
  abstract create(data: Account): Promise<Account>;
}

export abstract class IPrincipalQueryRepository {
  abstract findByPrincipalId(principalId: Id): Promise<Account | undefined>;
}
