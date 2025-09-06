import { Account } from 'src/domains/entities/account';
import { Id } from 'src/domains/value-object/id';
import { IAccountQueryRepository, IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
export declare class AccountCommandRepository implements IAccountCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    create(data: Account): Promise<Account>;
    delete(principalId: Id): Promise<void>;
}
export declare class AccountQueryRepository implements IAccountQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    findByPrincipalId(principalId: string): Promise<Account | undefined>;
    findByUsername(username: string): Promise<Account | undefined>;
}
