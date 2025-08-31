import { Id } from '../value-object/id';
import { Person } from '../entities/person';

export abstract class IPersonCommandRepository {
  abstract create(person: Person): Promise<Person>;
}

export abstract class IPersonQueryRepository {
  abstract find(id: Id): Promise<Person | undefined>;
  abstract list(): Promise<Person[]>;
}
