"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountQueryRepository = exports.AccountCommandRepository = void 0;
const argon2 = require("argon2");
const account_1 = require("../../../domains/entities/account");
const id_1 = require("../../../domains/value-object/id");
const prisma_client_1 = require("../../shared/prisma-client");
function prismToAccount(prisma) {
    return new account_1.Account({
        id: new id_1.Id(prisma.id),
        password: prisma.password,
        principalId: new id_1.Id(prisma.principalId),
        isActive: prisma.isActive,
        username: prisma.username,
    });
}
class AccountCommandRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async create(data) {
        const passwordHash = await argon2.hash(data.getPassword());
        const newData = await this.prisma.account.create({
            data: {
                id: data.getId(),
                password: passwordHash,
                principalId: data.getPrincipalId(),
                username: data.getUsername(),
                isActive: true,
            },
        });
        return prismToAccount(newData);
    }
    async delete(principalId) {
        await this.prisma.account.delete({
            where: { principalId: principalId.value },
        });
    }
}
exports.AccountCommandRepository = AccountCommandRepository;
class AccountQueryRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async findByPrincipalId(principalId) {
        const row = await this.prisma.account.findUnique({
            where: { principalId },
        });
        return row ? prismToAccount(row) : undefined;
    }
    async findByUsername(username) {
        const row = await this.prisma.account.findUnique({
            where: { username },
        });
        return row ? prismToAccount(row) : undefined;
    }
}
exports.AccountQueryRepository = AccountQueryRepository;
//# sourceMappingURL=account.repository.js.map