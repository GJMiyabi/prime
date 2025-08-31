"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const graphql_scalars_1 = require("graphql-scalars");
const graphql_context_1 = require("./shared/graphql/graphql.context");
const app_controller_1 = require("./shared/app.controller");
const user_repositories_1 = require("../../domains/repositories/user.repositories");
const user_repository_1 = require("../../interface-adapters/repositories/prisma/user.repository");
const input_port_1 = require("../../usecases/user/input-port");
const interactor_1 = require("../../usecases/user/interactor");
const user_resolver_1 = require("./user/graphql/user.resolver");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                context: ({ req }) => new graphql_context_1.GraphContext(req),
                typePaths: ['../graphql-schema/**/*.graphql'],
                resolvers: { Date: graphql_scalars_1.DateResolver },
                playground: true,
            }),
        ],
        providers: [
            { provide: user_repositories_1.IUserCommandRepository, useClass: user_repository_1.UserCommandRepository },
            { provide: user_repositories_1.IUserQueryRepository, useClass: user_repository_1.UserQueryRepository },
            { provide: input_port_1.IUserInputPort, useClass: interactor_1.UserInteractor },
            user_resolver_1.UserMutationResolver,
            user_resolver_1.UserQueryResolver,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map