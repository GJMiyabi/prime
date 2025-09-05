import { Person } from 'src/domains/entities/person';
import { Person as Prisma } from '@prisma/client';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import { Id } from 'src/domains/value-object/id';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';

function prismaToPerson(prisma: Prisma) {
  return new Person({
    id: new Id(prisma.id),
    name: prisma.name,
    contacts: [],
  });
}

export class PersonCommandRepository implements IPersonCommandRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async create(person: Person): Promise<Person> {
    const newPerson = await this.prisma.person.create({
      data: {
        id: person.id.value,
        name: person.getName(),
      },
    });

    return prismaToPerson(newPerson);
  }
}

export class PersonQueryRepository implements IPersonQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async find(id: Id): Promise<Person | undefined> {
    const person = await this.prisma.person.findUnique({
      where: { id: id.value },
    });
    if (person) {
      return prismaToPerson(person);
    } else {
      return undefined;
    }
  }

  async list(): Promise<Person[]> {
    const persons = await this.prisma.person.findMany();
    return persons.map(prismaToPerson);
  }
}
