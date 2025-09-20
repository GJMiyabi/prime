import { Id } from '../value-object/id';
import { Person } from '../entities/person';

export abstract class IPersonCommandRepository {
  abstract create(person: Person): Promise<Person>;
  abstract update(person: Person): Promise<Person>;
  abstract delete(id: Id): Promise<void>;
}

export abstract class IPersonQueryRepository {
  abstract find(
    id: Id,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facilities?: boolean;
      organization?: boolean;
    },
  ): Promise<Person | undefined>;
  abstract list(): Promise<Person[]>;
}
