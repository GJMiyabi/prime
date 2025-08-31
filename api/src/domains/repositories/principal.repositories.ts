import { Id } from '../value-object/id';
import { Principal } from '../entities/principal';

export abstract class IPrincipalCommandRepository {
  abstract create(data: Principal): Promise<Principal>;
}

export abstract class IPrincipalQueryRepository {
  abstract findByPersonId(personId: Id): Promise<Principal | undefined>;
}
