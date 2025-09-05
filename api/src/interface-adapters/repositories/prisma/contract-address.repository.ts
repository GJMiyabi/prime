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
  return new ContactAddress({
    id: new Id(prisma.id),
    type: mapPrismaContactType(prisma.type),
    personId: new Id(prisma.personId),
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
        type: data.getType(),
        value: data.getValue(),
      },
    });

    return prismaToContactAddress(newData);
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
}
