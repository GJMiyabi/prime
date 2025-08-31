"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserQueryRepository = exports.UserCommandRepository = void 0;
const user_1 = require("../../../domains/entities/user");
const id_1 = require("../../../domains/value-object/id");
const prisma_client_1 = require("../../shared/prisma-client");
function prismaToUser(prisma) {
    return new user_1.User({
        id: new id_1.Id(prisma.id),
        email: prisma.email,
        name: prisma.name,
        password: prisma.password,
    });
}
class UserCommandRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async save(user) {
        const newuser = await this.prisma.user.create({
            data: {
                id: user.id.value,
                name: user.getName(),
                email: user.getEmail(),
                password: user.getPasswordHash(),
                createdAt: new Date(),
            },
        });
        return prismaToUser(newuser);
    }
}
exports.UserCommandRepository = UserCommandRepository;
class UserQueryRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async list() {
        const users = await this.prisma.user.findMany();
        return users.map(prismaToUser);
    }
    async find(id) {
        const user = await this.prisma.user.findUnique({ where: { id: id.value } });
        if (user) {
            return prismaToUser(user);
        }
        return undefined;
    }
}
exports.UserQueryRepository = UserQueryRepository;
//# sourceMappingURL=user.repository.js.map