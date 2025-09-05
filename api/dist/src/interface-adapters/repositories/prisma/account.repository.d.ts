import { Account } from 'src/domains/entities/account';
import { IAccountQueryRepository, IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
export declare class AccountCommandRepository implements IAccountCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    create(data: Account): Promise<Account>;
}
export declare class AccountQueryRepository implements IAccountQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    findByPrincipalId(principalId: string): Promise<Account | undefined>;
}
