import { Principal as Prisma } from '@prisma/client';
import { Principal } from 'src/domains/entities/principal';
import { PrincipalKind as Kind } from '@prisma/client';
import { PrincipalKind } from 'src/domains/type/principal-kind';
import { Id } from 'src/domains/value-object/id';

import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import {
  IPrincipalQueryRepository,
  IPrincipalCommandRepository,
} from 'src/domains/repositories/principal.repositories';

function mapPrismaKind(k: Kind): PrincipalKind {
  switch (k) {
    case Kind.ADMIN:
      return PrincipalKind.ADMIN;
    case Kind.STAKEHOLDER:
      return PrincipalKind.STAKEHOLDER;
    case Kind.STUDENT:
      return PrincipalKind.STUDENT;
    case Kind.TEACHER:
      return PrincipalKind.TEACHER;
  }
}

function prismaToPrincipal(p: Prisma) {
  return new Principal({
    id: new Id(p.id),
    kind: mapPrismaKind(p.kind),
    personId: new Id(p.personId),
  });
}

export class PrincipalCommandRepository implements IPrincipalCommandRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async create(data: Principal): Promise<Principal> {
    const newData = await this.prisma.principal.create({
      data: {
        id: data.getId(),
        kind: data.getKind(),
        personId: data.getPersonId(),
      },
    });
    return prismaToPrincipal(newData);
  }

  async delete(personId: Id): Promise<void> {
    await this.prisma.principal.delete({ where: { personId: personId.value } });
  }
}

export class PrincipalQueryRepository implements IPrincipalQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async findByPersonId(personId: string): Promise<Principal | undefined> {
    const findData = await this.prisma.principal.findUnique({
      where: { personId: personId },
    });

    if (findData) {
      return prismaToPrincipal(findData);
    } else {
      return undefined;
    }
  }
}
