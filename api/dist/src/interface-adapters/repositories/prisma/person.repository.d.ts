import { Person } from 'src/domains/entities/person';
import { Id } from 'src/domains/value-object/id';
import { IPersonCommandRepository, IPersonQueryRepository } from 'src/domains/repositories/person.repositories';
export declare class PersonCommandRepository implements IPersonCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    create(person: Person): Promise<Person>;
    delete(id: Id): Promise<void>;
}
export declare class PersonQueryRepository implements IPersonQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    find(id: Id): Promise<Person | undefined>;
    list(): Promise<Person[]>;
}
