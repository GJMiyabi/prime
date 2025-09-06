"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonInteractor = void 0;
const common_1 = require("@nestjs/common");
const person_repositories_1 = require("../../domains/repositories/person.repositories");
const principal_repositories_1 = require("../../domains/repositories/principal.repositories");
const account_repositories_1 = require("../../domains/repositories/account.repositories");
const contract_address_repositories_1 = require("../../domains/repositories/contract-address.repositories");
const id_1 = require("../../domains/value-object/id");
const person_1 = require("../../domains/entities/person");
const account_1 = require("../../domains/entities/account");
const contact_address_1 = require("../../domains/entities/contact-address");
const principal_1 = require("../../domains/entities/principal");
const principal_kind_1 = require("../../domains/type/principal-kind");
let PersonInteractor = class PersonInteractor {
    personCommandRepository;
    personQueryRepository;
    principalQueryRepository;
    principalCommandRepository;
    accountCommandRepository;
    accountQueryRepository;
    contactAddressQueryRepository;
    contactAddressCommandRepository;
    constructor(personCommandRepository, personQueryRepository, principalQueryRepository, principalCommandRepository, accountCommandRepository, accountQueryRepository, contactAddressQueryRepository, contactAddressCommandRepository) {
        this.personCommandRepository = personCommandRepository;
        this.personQueryRepository = personQueryRepository;
        this.principalQueryRepository = principalQueryRepository;
        this.principalCommandRepository = principalCommandRepository;
        this.accountCommandRepository = accountCommandRepository;
        this.accountQueryRepository = accountQueryRepository;
        this.contactAddressQueryRepository = contactAddressQueryRepository;
        this.contactAddressCommandRepository = contactAddressCommandRepository;
    }
    async createAdmin(input) {
        const person = new person_1.Person({
            id: new id_1.Id(),
            name: input.name,
        });
        const address = new contact_address_1.ContactAddress({
            id: new id_1.Id(),
            type: input.type,
            personId: new id_1.Id(person.id.value),
            value: input.value,
        });
        const principal = new principal_1.Principal({
            id: new id_1.Id(),
            personId: new id_1.Id(person.id.value),
            kind: principal_kind_1.PrincipalKind.ADMIN,
        });
        const account = new account_1.Account({
            id: new id_1.Id(),
            password: '',
            username: address.getValue(),
            principalId: new id_1.Id(principal.getId()),
        });
        const newPerson = await this.personCommandRepository.create(person);
        const newAddress = await this.contactAddressCommandRepository.create(address);
        await this.principalCommandRepository.create(principal);
        await this.accountCommandRepository.create(account);
        return {
            id: newPerson.id.value,
            name: newPerson.getName(),
            value: newAddress.getValue(),
            type: newAddress.getType(),
        };
    }
    async find(id) {
        const person = await this.personQueryRepository.find(new id_1.Id(id));
        const principal = await this.principalQueryRepository.findByPersonId(id);
        const address = await this.contactAddressQueryRepository.findByPersonId(id);
        let account;
        if (principal) {
            account = await this.accountQueryRepository.findByPrincipalId(principal.id.value);
        }
        if (person) {
            return {
                id: person.id.value,
                name: person.getName(),
                principal: principal ?? undefined,
                contactAddress: address ?? undefined,
                account: account ?? undefined,
            };
        }
        else {
            return undefined;
        }
    }
    async delete(id) {
        await this.personCommandRepository.delete(new id_1.Id(id));
    }
};
exports.PersonInteractor = PersonInteractor;
exports.PersonInteractor = PersonInteractor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [person_repositories_1.IPersonCommandRepository,
        person_repositories_1.IPersonQueryRepository,
        principal_repositories_1.IPrincipalQueryRepository,
        principal_repositories_1.IPrincipalCommandRepository,
        account_repositories_1.IAccountCommandRepository,
        account_repositories_1.IAccountQueryRepository,
        contract_address_repositories_1.IContactAddressQueryRepository,
        contract_address_repositories_1.IContactAddressCommandRepository])
], PersonInteractor);
//# sourceMappingURL=interactor.js.map