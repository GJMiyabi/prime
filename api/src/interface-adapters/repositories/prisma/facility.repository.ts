import { Facility as Prisma } from '@prisma/client';
import { Facility } from 'src/domains/entities/facility';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';
import {
  IFacilityQueryRepository,
  IFacilityCommandRepository,
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

  async create(f: Facility): Promise<Facility> {
    const newData = await this.prisma.facility.create({
      data: {
        id: f.getId(),
        IDNumber: f.getIDNumber(),
        name: f.getName(),
      },
    });
    return prismaToFacility(newData);
  }

  async update(f: Facility): Promise<Facility> {
    const updated = await this.prisma.facility.update({
      where: { id: f.getId() },
      data: {
        IDNumber: f.getIDNumber(),
        name: f.getName(),
        organizationId: f.getOrganizationId(),
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
    include?: {
      contactAddress?: boolean;
      persons?: boolean;
      organization?: boolean;
    },
  ): Promise<Facility | undefined> {
    const facility = await this.prisma.facility.findUnique({
      where: { id: id.value },
      include: include,
    });

    if (facility) {
      return prismaToFacility(facility);
    } else {
      return undefined;
    }
  }

  async list(): Promise<Facility[]> {
    const facilities = await this.prisma.facility.findMany();
    return facilities.map(prismaToFacility);
  }
}
