import { ContactAddress as PrismaContactAddress } from '@prisma/client';
import { ContactAddress } from 'src/domains/entities/contact-address';
import { IContactAddressCommandRepository, IContactAddressQueryRepository } from 'src/domains/repositories/contract-address.repositories';
export declare function prismaToContactAddress(prisma: PrismaContactAddress): ContactAddress;
export declare class ContactAddressCommandRepository implements IContactAddressCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    create(data: ContactAddress): Promise<ContactAddress>;
}
export declare class ContactAddressQueryRepository implements IContactAddressQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    findByPersonId(personId: string): Promise<ContactAddress[]>;
}
