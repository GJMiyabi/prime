import { Person } from 'src/domains/entities/person';
import type {
  Prisma as PrismaNS,
  Person as PrismaPerson,
  Principal as PrismaPrincipal,
  ContactAddress as PrismaContactAddress,
  Facility as PrismaFacility,
  Organization as PrismaOrganization,
} from '@prisma/client';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import { Id } from 'src/domains/value-object/id';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';
import { prismaToPrincipal } from './principal.repository';
import { prismaToContactAddress } from './contract-address.repository';
import { prismaToFacility } from './facility.repository';
import { prismaToOrganization } from './organization.repository';

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

  async update(person: Person): Promise<Person> {
    const id = person.id.value;

    const updated = await this.prisma.$transaction(async (tx) => {
      const base = await tx.person.update({
        where: { id },
        data: {
          name: person.getName(),
        },
      });

      return base;
    });

    return prismaToPerson(updated);
  }

  async delete(id: Id): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.contactAddress.deleteMany({ where: { personId: id.value } });

      const principal = await tx.principal.findUnique({
        where: { personId: id.value },
        select: { id: true },
      });

      if (principal) {
        await tx.account.deleteMany({ where: { principalId: principal.id } });
        await tx.principal.delete({ where: { id: principal.id } });
      }

      await tx.person.delete({ where: { id: id.value } });
    });
  }
}

export class PersonQueryRepository implements IPersonQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async list(): Promise<Person[]> {
    const persons = await this.prisma.person.findMany();
    return persons.map(prismaToPerson);
  }

  async find(
    id: Id,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facilities?: boolean;
      organization?: boolean;
    },
  ): Promise<Person | undefined> {
    let prismaInclude: PrismaNS.PersonInclude | undefined;

    if (include) {
      prismaInclude = {
        contacts: include.contacts ? true : undefined,
        facilities: include.facilities ? true : undefined,
        organization: include.organization ? true : undefined,
        principal: include.principal
          ? include.principal.include?.account
            ? { include: { account: true } }
            : true
          : undefined,
      };
    }

    const person = await this.prisma.person.findUnique({
      where: { id: id.value },
      include: prismaInclude,
    });

    return person ? prismaToPerson(person) : undefined;
  }
}

function prismaToPerson(
  prisma: PrismaPerson & {
    contacts?: PrismaContactAddress[];
    principal?: PrismaPrincipal | null;
    facilities?: PrismaFacility[];
    organization?: PrismaOrganization | null;
  },
) {
  return new Person({
    id: new Id(prisma.id),
    name: prisma.name,
    contacts: prisma.contacts
      ? prisma.contacts.map((c) => prismaToContactAddress(c))
      : undefined,
    principal: prisma.principal
      ? prismaToPrincipal(prisma.principal)
      : undefined,
    facilities: prisma.facilities
      ? prisma.facilities.map((f) => prismaToFacility(f))
      : [],
    organization: prisma.organization
      ? prismaToOrganization(prisma.organization)
      : undefined,
  });
}
