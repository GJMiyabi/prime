import { User } from 'src/domains/entities/user';
import { Id } from 'src/domains/value-object/id';
import { IUserCommandRepository, IUserQueryRepository } from 'src/domains/repositories/user.repositories';
export declare class UserCommandRepository implements IUserCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    save(user: User): Promise<User>;
}
export declare class UserQueryRepository implements IUserQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    list(): Promise<User[]>;
    find(id: Id): Promise<User | undefined>;
}
