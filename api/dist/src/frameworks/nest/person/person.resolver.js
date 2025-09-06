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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonQueryResolver = exports.PersonMutationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const input_port_1 = require("../../../usecases/person/input-port");
let PersonMutationResolver = class PersonMutationResolver {
    personInputport;
    constructor(personInputport) {
        this.personInputport = personInputport;
    }
    async saveAdminUser(input) {
        const admin = await this.personInputport.createAdmin(input);
        return {
            __type: 'AdminPeron',
            ...admin,
        };
    }
    async deletePerson(id) {
        await this.personInputport.delete(id);
        return true;
    }
};
exports.PersonMutationResolver = PersonMutationResolver;
__decorate([
    (0, graphql_1.Mutation)('saveAdminPeron'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PersonMutationResolver.prototype, "saveAdminUser", null);
__decorate([
    (0, graphql_1.Mutation)('deletePerson'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PersonMutationResolver.prototype, "deletePerson", null);
exports.PersonMutationResolver = PersonMutationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [input_port_1.IPersonInputPort])
], PersonMutationResolver);
let PersonQueryResolver = class PersonQueryResolver {
    personInputPort;
    constructor(personInputPort) {
        this.personInputPort = personInputPort;
    }
    async findPerson(id) {
        const person = await this.personInputPort.find(id);
        return {
            __type: 'Person',
            ...person,
        };
    }
};
exports.PersonQueryResolver = PersonQueryResolver;
__decorate([
    (0, graphql_1.Query)(() => Object, { name: 'person' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PersonQueryResolver.prototype, "findPerson", null);
exports.PersonQueryResolver = PersonQueryResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [input_port_1.IPersonInputPort])
], PersonQueryResolver);
//# sourceMappingURL=person.resolver.js.map