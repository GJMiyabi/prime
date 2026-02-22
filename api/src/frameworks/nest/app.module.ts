import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DateResolver } from 'graphql-scalars';
import { GraphContext } from './shared/graphql/graphql.context';
import { AppController } from './shared/app.controller';
import { CsrfGuard } from './auth/guards/csrf.guard';
import { SentryExceptionFilter } from './shared/filters/sentry-exception.filter';
import { PerformanceInterceptor } from './shared/interceptors/performance.interceptor';
import { AlertService } from './shared/alerts/alert.service';
import { RequestWithUser } from './shared/types/request.types';
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
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req }: { req: RequestWithUser }) => new GraphContext(req),
      typePaths: ['../graphql-schema/**/*.graphql'],
      resolvers: { Date: DateResolver },
      playground: true,
    }),
    HealthModule, // ヘルスチェック機能
    AuthModule,
  ],
  providers: [
    // ✅ Performance Interceptor をグローバルに適用（全リクエストのパフォーマンス計測）
    { provide: APP_INTERCEPTOR, useClass: PerformanceInterceptor },
    // ✅ Sentry Exception Filter をグローバルに適用（全エラーをキャプチャ）
    { provide: APP_FILTER, useClass: SentryExceptionFilter },
    // ✅ CSRF Guard をグローバルに適用（全 Mutation を保護）
    { provide: APP_GUARD, useClass: CsrfGuard },
    // グローバル認証ガード（必要に応じてコメントアウトを解除）
    // { provide: APP_GUARD, useClass: GqlAuthGuard },
    // Alert Service（アラート送信）
    AlertService,
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
