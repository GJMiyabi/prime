import { User } from '../entities/user';
import { Id } from '../value-object/id';

export abstract class IUserCommandRepository {
  abstract save(user: User): Promise<User>;
}

export abstract class IUserQueryRepository {
  abstract find(id: Id): Promise<User | undefined>;
  abstract list(): Promise<User[]>;
}
