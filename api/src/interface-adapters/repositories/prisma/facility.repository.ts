import { Facility as Prisma } from '@prisma/client';
import { Facility } from 'src/domains/entities/facility';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import {
  IFacilityQueryRepository,
  IFacilityCommandRepository,
  FacilityIncludeOptions,
  FacilityQueryFilters,
} from 'src/domains/repositories/facility.repositories';

export function prismaToFacility(p: Prisma) {
  return new Facility({
    id: new Id(p.id),
    idNumber: p.IDNumber,
    name: p.name,
  });
}

export class FacilityCommandRepository implements IFacilityCommandRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async create(facility: Facility): Promise<Facility> {
    const newData = await this.prisma.facility.create({
      data: {
        id: facility.getId(),
        IDNumber: facility.getIDNumber(),
        name: facility.getName(),
      },
    });
    return prismaToFacility(newData);
  }

  async update(facility: Facility): Promise<Facility> {
    const updated = await this.prisma.facility.update({
      where: { id: facility.getId() },
      data: {
        IDNumber: facility.getIDNumber(),
        name: facility.getName(),
        organizationId: facility.getOrganizationId(),
      },
    });
    return prismaToFacility(updated);
  }

  async delete(id: Id): Promise<void> {
    await this.prisma.facility.delete({
      where: { id: id.value },
    });
  }
}

export class FacilityQueryRepository implements IFacilityQueryRepository {
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async find(
    id: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility | undefined> {
    const facility = await this.prisma.facility.findUnique({
      where: { id: id.value },
      include: include
        ? {
            contactAddress: include.contactAddress,
            persons: include.persons,
            organization: include.organization,
          }
        : undefined,
    });

    if (facility) {
      return prismaToFacility(facility);
    } else {
      return undefined;
    }
  }

  async list(
    filters?: FacilityQueryFilters,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]> {
    const facilities = await this.prisma.facility.findMany({
      where: {
        ...(filters?.organizationId && {
          organizationId: filters.organizationId.value,
        }),
        ...(filters?.name && { name: { contains: filters.name } }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.personIds &&
          filters.personIds.length > 0 && {
            persons: {
              some: {
                id: {
                  in: filters.personIds.map((id) => id.value),
                },
              },
            },
          }),
      },
      include: include
        ? {
            contactAddress: include.contactAddress,
            persons: include.persons,
            organization: include.organization,
          }
        : undefined,
    });
    return facilities.map(prismaToFacility);
  }

  async findByOrganization(
    organizationId: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]> {
    const facilities = await this.prisma.facility.findMany({
      where: { organizationId: organizationId.value },
      include: include
        ? {
            contactAddress: include.contactAddress,
            persons: include.persons,
            organization: include.organization,
          }
        : undefined,
    });
    return facilities.map(prismaToFacility);
  }

  async findByPerson(
    personId: Id,
    include?: FacilityIncludeOptions,
  ): Promise<Facility[]> {
    const facilities = await this.prisma.facility.findMany({
      where: {
        persons: {
          some: {
            id: personId.value,
          },
        },
      },
      include: include
        ? {
            contactAddress: include.contactAddress,
            persons: include.persons,
            organization: include.organization,
          }
        : undefined,
    });
    return facilities.map(prismaToFacility);
  }

  async exists(id: Id): Promise<boolean> {
    const count = await this.prisma.facility.count({
      where: { id: id.value },
    });
    return count > 0;
  }
}
