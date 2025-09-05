import { Principal } from 'src/domains/entities/principal';
import { IPrincipalQueryRepository, IPrincipalCommandRepository } from 'src/domains/repositories/principal.repositories';
export declare class PrincipalCommandRepository implements IPrincipalCommandRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    create(data: Principal): Promise<Principal>;
}
export declare class PrincipalQueryRepository implements IPrincipalQueryRepository {
    private readonly prisma;
    constructor(prisma?: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>);
    findByPersonId(personId: string): Promise<Principal | undefined>;
}
