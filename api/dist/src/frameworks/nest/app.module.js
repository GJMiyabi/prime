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
const input_port_1 = require("../../usecases/person/input-port");
const interactor_1 = require("../../usecases/person/interactor");
const person_repository_1 = require("../../interface-adapters/repositories/prisma/person.repository");
const person_repositories_1 = require("../../domains/repositories/person.repositories");
const person_resolver_1 = require("./person/person.resolver");
const principal_repositories_1 = require("../../domains/repositories/principal.repositories");
const principal_repository_1 = require("../../interface-adapters/repositories/prisma/principal.repository");
const account_repositories_1 = require("../../domains/repositories/account.repositories");
const account_repository_1 = require("../../interface-adapters/repositories/prisma/account.repository");
const contract_address_repositories_1 = require("../../domains/repositories/contract-address.repositories");
const contract_address_repository_1 = require("../../interface-adapters/repositories/prisma/contract-address.repository");
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
            { provide: person_repositories_1.IPersonCommandRepository, useClass: person_repository_1.PersonCommandRepository },
            { provide: person_repositories_1.IPersonQueryRepository, useClass: person_repository_1.PersonQueryRepository },
            { provide: input_port_1.IPersonInputPort, useClass: interactor_1.PersonInteractor },
            {
                provide: principal_repositories_1.IPrincipalCommandRepository,
                useClass: principal_repository_1.PrincipalCommandRepository,
            },
            { provide: principal_repositories_1.IPrincipalQueryRepository, useClass: principal_repository_1.PrincipalQueryRepository },
            { provide: account_repositories_1.IAccountCommandRepository, useClass: account_repository_1.AccountCommandRepository },
            { provide: account_repositories_1.IAccountQueryRepository, useClass: account_repository_1.AccountQueryRepository },
            {
                provide: contract_address_repositories_1.IContactAddressCommandRepository,
                useClass: contract_address_repository_1.ContactAddressCommandRepository,
            },
            {
                provide: contract_address_repositories_1.IContactAddressQueryRepository,
                useClass: contract_address_repository_1.ContactAddressQueryRepository,
            },
            person_resolver_1.PersonMutationResolver,
            person_resolver_1.PersonQueryResolver,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map