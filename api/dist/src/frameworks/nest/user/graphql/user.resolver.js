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
exports.UserQueryResolver = exports.UserMutationResolver = void 0;
const input_port_1 = require("../../../../usecases/user/input-port");
const graphql_1 = require("@nestjs/graphql");
let UserMutationResolver = class UserMutationResolver {
    userInputPort;
    constructor(userInputPort) {
        this.userInputPort = userInputPort;
    }
    async saveUser(input) {
        const user = await this.userInputPort.save(input);
        return {
            __type: 'User',
            ...user,
        };
    }
};
exports.UserMutationResolver = UserMutationResolver;
__decorate([
    (0, graphql_1.Mutation)('saveUser'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMutationResolver.prototype, "saveUser", null);
exports.UserMutationResolver = UserMutationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [input_port_1.IUserInputPort])
], UserMutationResolver);
let UserQueryResolver = class UserQueryResolver {
    userInputPort;
    constructor(userInputPort) {
        this.userInputPort = userInputPort;
    }
    async findOne(input) {
        const user = await this.userInputPort.findOne(input);
        return {
            __type: 'User',
            ...user,
        };
    }
};
exports.UserQueryResolver = UserQueryResolver;
__decorate([
    (0, graphql_1.Query)(() => Object, { name: 'user' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserQueryResolver.prototype, "findOne", null);
exports.UserQueryResolver = UserQueryResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [input_port_1.IUserInputPort])
], UserQueryResolver);
//# sourceMappingURL=user.resolver.js.map