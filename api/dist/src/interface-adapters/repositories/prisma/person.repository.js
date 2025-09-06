"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonQueryRepository = exports.PersonCommandRepository = void 0;
const person_1 = require("../../../domains/entities/person");
const prisma_client_1 = require("../../shared/prisma-client");
const id_1 = require("../../../domains/value-object/id");
function prismaToPerson(prisma) {
    return new person_1.Person({
        id: new id_1.Id(prisma.id),
        name: prisma.name,
        contacts: [],
    });
}
class PersonCommandRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async create(person) {
        const newPerson = await this.prisma.person.create({
            data: {
                id: person.id.value,
                name: person.getName(),
            },
        });
        return prismaToPerson(newPerson);
    }
    async delete(id) {
        await this.prisma.$transaction(async (tx) => {
            await tx.contactAddress.deleteMany({ where: { personId: id.value } });
            const principal = await tx.principal.findUnique({
                where: { personId: id.value },
                select: { id: true },
            });
            if (principal) {
                await tx.account.deleteMany({ where: { principalId: principal.id } });
                await tx.principal.delete({ where: { id: principal.id } });
            }
            await tx.person.delete({ where: { id: id.value } });
        });
    }
}
exports.PersonCommandRepository = PersonCommandRepository;
class PersonQueryRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async find(id) {
        const person = await this.prisma.person.findUnique({
            where: { id: id.value },
        });
        if (person) {
            return prismaToPerson(person);
        }
        else {
            return undefined;
        }
    }
    async list() {
        const persons = await this.prisma.person.findMany();
        return persons.map(prismaToPerson);
    }
}
exports.PersonQueryRepository = PersonQueryRepository;
//# sourceMappingURL=person.repository.js.map