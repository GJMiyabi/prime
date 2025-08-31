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
exports.UserInteractor = void 0;
const common_1 = require("@nestjs/common");
const user_repositories_1 = require("../../domains/repositories/user.repositories");
const user_1 = require("../../domains/entities/user");
const id_1 = require("../../domains/value-object/id");
const argon2 = require("argon2");
let UserInteractor = class UserInteractor {
    userCommandRepository;
    userQueryRepository;
    constructor(userCommandRepository, userQueryRepository) {
        this.userCommandRepository = userCommandRepository;
        this.userQueryRepository = userQueryRepository;
    }
    async save(input) {
        const passwordHash = await argon2.hash(input.password);
        const user = new user_1.User({
            id: new id_1.Id(),
            name: input.name,
            email: input.email,
            password: passwordHash,
        });
        const newUser = await this.userCommandRepository.save(user);
        return {
            id: newUser.id.value,
            email: newUser.getEmail(),
            name: newUser.getName(),
        };
    }
    async findOne(id) {
        const user = await this.userQueryRepository.find(new id_1.Id(id));
        if (user) {
            return {
                id: user.id.value,
                name: user.name,
                email: user.email,
            };
        }
        else {
            return undefined;
        }
    }
};
exports.UserInteractor = UserInteractor;
exports.UserInteractor = UserInteractor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repositories_1.IUserCommandRepository,
        user_repositories_1.IUserQueryRepository])
], UserInteractor);
//# sourceMappingURL=interactor.js.map