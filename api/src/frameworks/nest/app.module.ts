import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DateResolver } from 'graphql-scalars';
import { GraphContext } from './shared/graphql/graphql.context';
import { AppController } from './shared/app.controller';
import { IPersonInputPort } from 'src/usecases/person/input-port';
import { PersonInteractor } from 'src/usecases/person/interactor';
import {
  PersonCommandRepository,
  PersonQueryRepository,
} from 'src/interface-adapters/repositories/prisma/person.repository';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from 'src/domains/repositories/person.repositories';
import {
  PersonQueryResolver,
  PersonMutationResolver,
} from './person/person.resolver';
import {
  IPrincipalCommandRepository,
  IPrincipalQueryRepository,
} from 'src/domains/repositories/principal.repositories';
import {
  PrincipalCommandRepository,
  PrincipalQueryRepository,
} from 'src/interface-adapters/repositories/prisma/principal.repository';
import {
  IAccountCommandRepository,
  IAccountQueryRepository,
} from 'src/domains/repositories/account.repositories';
import {
  AccountCommandRepository,
  AccountQueryRepository,
} from 'src/interface-adapters/repositories/prisma/account.repository';

import {
  IContactAddressQueryRepository,
  IContactAddressCommandRepository,
} from 'src/domains/repositories/contract-address.repositories';
import {
  ContactAddressCommandRepository,
  ContactAddressQueryRepository,
} from 'src/interface-adapters/repositories/prisma/contract-address.repository';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req }: { req: Request }) => new GraphContext(req),
      typePaths: ['../graphql-schema/**/*.graphql'],
      resolvers: { Date: DateResolver },
      playground: true,
    }),
  ],
  providers: [
    { provide: IPersonCommandRepository, useClass: PersonCommandRepository },
    { provide: IPersonQueryRepository, useClass: PersonQueryRepository },
    { provide: IPersonInputPort, useClass: PersonInteractor },
    {
      provide: IPrincipalCommandRepository,
      useClass: PrincipalCommandRepository,
    },
    { provide: IPrincipalQueryRepository, useClass: PrincipalQueryRepository },
    { provide: IAccountCommandRepository, useClass: AccountCommandRepository },
    { provide: IAccountQueryRepository, useClass: AccountQueryRepository },
    {
      provide: IContactAddressCommandRepository,
      useClass: ContactAddressCommandRepository,
    },
    {
      provide: IContactAddressQueryRepository,
      useClass: ContactAddressQueryRepository,
    },
    PersonMutationResolver,
    PersonQueryResolver,
  ],
  controllers: [AppController],
})
export class AppModule {}
