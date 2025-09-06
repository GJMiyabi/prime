import { Account } from '../entities/account';

export abstract class IAccountCommandRepository {
  abstract create(data: Account): Promise<Account>;
}

export abstract class IAccountQueryRepository {
  abstract findByPrincipalId(principalId: string): Promise<Account | undefined>;
  abstract findByUsername(username: string): Promise<Account | undefined>;
}
