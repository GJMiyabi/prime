import { ContactAddress as PrismaContactAddress } from '@prisma/client';
import { ContactAddress } from 'src/domains/entities/contact-address';
import { ContactType } from 'src/domains/type/contact';
import { ContactType as PrismaContactType } from '@prisma/client';
import { Id } from 'src/domains/value-object/id';

import {
  IContactAddressCommandRepository,
  IContactAddressQueryRepository,
} from 'src/domains/repositories/contract-address.repositories';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

function mapPrismaContactType(t: PrismaContactType): ContactType {
  switch (t) {
    case PrismaContactType.EMAIL:
      return ContactType.EMAIL;
    case PrismaContactType.PHONE:
      return ContactType.PHONE;
    case PrismaContactType.ADDRESS:
      return ContactType.ADDRESS;
  }
}

export function prismaToContactAddress(prisma: PrismaContactAddress) {
  const fid = prisma.facilityId ? new Id(prisma.facilityId) : undefined;
  const pid = prisma.personId ? new Id(prisma.personId) : undefined;
  const oid = prisma.organizationId ? new Id(prisma.organizationId) : undefined;
  return new ContactAddress({
    id: new Id(prisma.id),
    type: mapPrismaContactType(prisma.type),
    personId: pid,
    organizationId: oid,
    facilityId: fid,
    value: prisma.value,
  });
}

export class ContactAddressCommandRepository
  implements IContactAddressCommandRepository
{
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async create(data: ContactAddress): Promise<ContactAddress> {
    const newData = await this.prisma.contactAddress.create({
      data: {
        id: data.getId(),
        personId: data.getPersonId(),
        facilityId: data.getFacilityId(),
        organizationId: data.getOrganizationId(),
        type: data.getType(),
        value: data.getValue(),
      },
    });

    return prismaToContactAddress(newData);
  }

  async update(c: ContactAddress): Promise<ContactAddress> {
    const id = c.id.value;

    const updated = await this.prisma.contactAddress.update({
      where: { id },
      data: {
        type: c.getType(),
        value: c.getValue(),
        personId: c.getPersonId() !== undefined ? c.getPersonId()! : undefined,
        facilityId:
          c.getFacilityId() !== undefined ? c.getFacilityId()! : undefined,
        organizationId:
          c.getOrganizationId() !== undefined
            ? c.getOrganizationId()!
            : undefined,
      },
    });

    return prismaToContactAddress(updated);
  }

  async delete(personId: Id): Promise<void> {
    await this.prisma.contactAddress.deleteMany({
      where: { personId: personId.value },
    });
  }
}

export class ContactAddressQueryRepository
  implements IContactAddressQueryRepository
{
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async findByPersonId(personId: string): Promise<ContactAddress[]> {
    const rows = await this.prisma.contactAddress.findMany({
      where: { personId: personId },
      orderBy: { id: 'asc' },
    });

    return rows.map(prismaToContactAddress);
  }

  async find(id: Id): Promise<ContactAddress | undefined> {
    const row = await this.prisma.contactAddress.findUnique({
      where: { id: id.value },
    });
    return row ? prismaToContactAddress(row) : undefined;
  }
}
