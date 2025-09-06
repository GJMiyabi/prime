"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipalQueryRepository = exports.PrincipalCommandRepository = void 0;
const principal_1 = require("../../../domains/entities/principal");
const client_1 = require("@prisma/client");
const principal_kind_1 = require("../../../domains/type/principal-kind");
const id_1 = require("../../../domains/value-object/id");
const prisma_client_1 = require("../../shared/prisma-client");
function mapPrismaKind(k) {
    switch (k) {
        case client_1.PrincipalKind.ADMIN:
            return principal_kind_1.PrincipalKind.ADMIN;
        case client_1.PrincipalKind.STAKEHOLDER:
            return principal_kind_1.PrincipalKind.STAKEHOLDER;
        case client_1.PrincipalKind.STUDENT:
            return principal_kind_1.PrincipalKind.STUDENT;
        case client_1.PrincipalKind.TEACHER:
            return principal_kind_1.PrincipalKind.TEACHER;
    }
}
function prismaToPrincipal(p) {
    return new principal_1.Principal({
        id: new id_1.Id(p.id),
        kind: mapPrismaKind(p.kind),
        personId: new id_1.Id(p.personId),
    });
}
class PrincipalCommandRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async create(data) {
        const newData = await this.prisma.principal.create({
            data: {
                id: data.getId(),
                kind: data.getKind(),
                personId: data.getPersonId(),
            },
        });
        return prismaToPrincipal(newData);
    }
    async delete(personId) {
        await this.prisma.principal.delete({ where: { personId: personId.value } });
    }
}
exports.PrincipalCommandRepository = PrincipalCommandRepository;
class PrincipalQueryRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async findByPersonId(personId) {
        const findData = await this.prisma.principal.findUnique({
            where: { personId: personId },
        });
        if (findData) {
            return prismaToPrincipal(findData);
        }
        else {
            return undefined;
        }
    }
}
exports.PrincipalQueryRepository = PrincipalQueryRepository;
//# sourceMappingURL=principal.repository.js.map