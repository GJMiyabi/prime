import { Organization as Prisma } from '@prisma/client';
import { Organization } from 'src/domains/entities/organization';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import {
  IOrganizationQueryRepository,
  IOrganizationCommandRepository,
} from 'src/domains/repositories/organization.repositories';

function prismaToOrganization(p: Prisma) {
  return new Organization({
    id: new Id(p.id),
    idNumber: p.IDNumber,
    name: p.name,
  });
}

export class OrganizationCommandRepository
  implements IOrganizationCommandRepository
{
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async create(o: Organization): Promise<Organization> {
    const newData = await this.prisma.organization.create({
      data: {
        id: o.getId(),
        IDNumber: o.getIDNumber(),
        name: o.getName(),
      },
    });
    return prismaToOrganization(newData);
  }

  async delete(id: Id): Promise<void> {
    await this.prisma.organization.delete({
      where: { id: id.value },
    });
  }
}

export class OrganizationQueryRepository
  implements IOrganizationQueryRepository
{
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async find(
    id: Id,
    include?: {
      contactAddresses?: boolean;
      persons?: boolean;
      facilities?: boolean;
    },
  ): Promise<Organization | undefined> {
    const o = await this.prisma.organization.findUnique({
      where: { id: id.value },
      include: include,
    });

    if (o) {
      return prismaToOrganization(o);
    } else {
      return undefined;
    }
  }
}
