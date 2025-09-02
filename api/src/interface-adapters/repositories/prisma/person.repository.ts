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
