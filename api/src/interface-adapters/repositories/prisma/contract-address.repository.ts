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

  async delete(id: Id): Promise<void> {
    await this.prisma.contactAddress.delete({
      where: { id: id.value },
    });
  }

  async deleteByPersonId(personId: Id): Promise<void> {
    await this.prisma.contactAddress.deleteMany({
      where: { personId: personId.value },
    });
  }

  async bulkCreate(
    contactAddresses: ContactAddress[],
  ): Promise<ContactAddress[]> {
    const createData = contactAddresses.map((contact) => ({
      id: contact.getId(),
      personId: contact.getPersonId(),
      facilityId: contact.getFacilityId(),
      organizationId: contact.getOrganizationId(),
      type: contact.getType(),
      value: contact.getValue(),
    }));

    // PrismaのcreateMany後に、作成されたレコードを取得
    await this.prisma.contactAddress.createMany({
      data: createData,
    });

    // 作成されたレコードのIDで検索して返す
    const createdIds = contactAddresses.map((contact) => contact.getId());
    const created = await this.prisma.contactAddress.findMany({
      where: {
        id: {
          in: createdIds,
        },
      },
    });

    return created.map(prismaToContactAddress);
  }
}

export class ContactAddressQueryRepository
  implements IContactAddressQueryRepository
{
  constructor(private readonly prisma = PrismaClientSingleton.instance) {}

  async find(id: Id): Promise<ContactAddress | undefined> {
    const row = await this.prisma.contactAddress.findUnique({
      where: { id: id.value },
    });
    return row ? prismaToContactAddress(row) : undefined;
  }

  async findByPersonId(personId: Id): Promise<ContactAddress[]> {
    const rows = await this.prisma.contactAddress.findMany({
      where: { personId: personId.value },
      orderBy: { id: 'asc' },
    });

    return rows.map(prismaToContactAddress);
  }

  async findByContactType(
    contactType: ContactType,
    personId?: Id,
  ): Promise<ContactAddress[]> {
    const rows = await this.prisma.contactAddress.findMany({
      where: {
        type: contactType,
        ...(personId && { personId: personId.value }),
      },
      orderBy: { id: 'asc' },
    });

    return rows.map(prismaToContactAddress);
  }

  async list(filters?: {
    personId?: Id;
    contactType?: ContactType;
    value?: string;
    isActive?: boolean;
  }): Promise<ContactAddress[]> {
    const rows = await this.prisma.contactAddress.findMany({
      where: {
        ...(filters?.personId && { personId: filters.personId.value }),
        ...(filters?.contactType && { type: filters.contactType }),
        ...(filters?.value && { value: { contains: filters.value } }),
      },
      orderBy: { id: 'asc' },
    });

    return rows.map(prismaToContactAddress);
  }

  async exists(id: Id): Promise<boolean> {
    const count = await this.prisma.contactAddress.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  async existsByPersonIdAndType(
    personId: Id,
    contactType: ContactType,
  ): Promise<boolean> {
    const count = await this.prisma.contactAddress.count({
      where: {
        personId: personId.value,
        type: contactType,
      },
    });
    return count > 0;
  }
}
