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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const account_repository_1 = require("../../../interface-adapters/repositories/prisma/account.repository");
const jwt_1 = require("@nestjs/jwt");
const account_repositories_1 = require("../../../domains/repositories/account.repositories");
let AuthService = class AuthService {
    accountQueryRepository;
    jwtService;
    constructor(accountQueryRepository, jwtService) {
        this.accountQueryRepository = accountQueryRepository;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        try {
            const account = await this.accountQueryRepository.findByUsername(username);
            if (!account || !account.isEnabled())
                return null;
            const isMatch = await argon2.verify(account.getPassword(), password);
            if (!isMatch)
                return null;
            return {
                id: account.getId(),
                principalId: account.getPrincipalId(),
                username: account.getUsername(),
                email: account.getEmail(),
            };
        }
        catch (err) {
            if (err instanceof Error) {
                throw new common_1.InternalServerErrorException(err.message);
            }
            throw new common_1.InternalServerErrorException('Authentication failed');
        }
    }
    async login(username, password) {
        const account = await this.validateUser(username, password);
        if (!account)
            return null;
        const payload = {
            sub: account.principalId,
            username: account.username,
        };
        return {
            accessToken: await this.jwtService.signAsync(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(account_repositories_1.IAccountQueryRepository)),
    __metadata("design:paramtypes", [account_repository_1.AccountQueryRepository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map