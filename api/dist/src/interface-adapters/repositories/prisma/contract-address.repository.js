"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactAddressQueryRepository = exports.ContactAddressCommandRepository = void 0;
exports.prismaToContactAddress = prismaToContactAddress;
const contact_address_1 = require("../../../domains/entities/contact-address");
const contact_1 = require("../../../domains/type/contact");
const client_1 = require("@prisma/client");
const id_1 = require("../../../domains/value-object/id");
const prisma_client_1 = require("../../shared/prisma-client");
function mapPrismaContactType(t) {
    switch (t) {
        case client_1.ContactType.EMAIL:
            return contact_1.ContactType.EMAIL;
        case client_1.ContactType.PHONE:
            return contact_1.ContactType.PHONE;
        case client_1.ContactType.ADDRESS:
            return contact_1.ContactType.ADDRESS;
    }
}
function prismaToContactAddress(prisma) {
    return new contact_address_1.ContactAddress({
        id: new id_1.Id(prisma.id),
        type: mapPrismaContactType(prisma.type),
        personId: new id_1.Id(prisma.personId),
        value: prisma.value,
    });
}
class ContactAddressCommandRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async create(data) {
        const newData = await this.prisma.contactAddress.create({
            data: {
                id: data.getId(),
                personId: data.getPersonId(),
                type: data.getType(),
                value: data.getValue(),
            },
        });
        return prismaToContactAddress(newData);
    }
}
exports.ContactAddressCommandRepository = ContactAddressCommandRepository;
class ContactAddressQueryRepository {
    prisma;
    constructor(prisma = prisma_client_1.PrismaClientSingleton.instance) {
        this.prisma = prisma;
    }
    async findByPersonId(personId) {
        const rows = await this.prisma.contactAddress.findMany({
            where: { personId: personId },
            orderBy: { id: 'asc' },
        });
        return rows.map(prismaToContactAddress);
    }
}
exports.ContactAddressQueryRepository = ContactAddressQueryRepository;
//# sourceMappingURL=contract-address.repository.js.map