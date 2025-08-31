import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DateResolver } from 'graphql-scalars';
import { GraphContext } from './shared/graphql/graphql.context';
import { AppController } from './shared/app.controller';
import {
  IUserCommandRepository,
  IUserQueryRepository,
} from 'src/domains/repositories/user.repositories';
import {
  UserCommandRepository,
  UserQueryRepository,
} from 'src/interface-adapters/repositories/prisma/user.repository';
import { IUserInputPort } from 'src/usecases/user/input-port';
import { UserInteractor } from 'src/usecases/user/interactor';
import {
  UserMutationResolver,
  UserQueryResolver,
} from './user/graphql/user.resolver';

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
    { provide: IUserCommandRepository, useClass: UserCommandRepository },
    { provide: IUserQueryRepository, useClass: UserQueryRepository },
    { provide: IUserInputPort, useClass: UserInteractor },
    UserMutationResolver,
    UserQueryResolver,
  ],
  controllers: [AppController],
})
export class AppModule {}
