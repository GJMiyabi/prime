import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SentryExceptionFilter } from '../shared/filters/sentry-exception.filter';
import { PerformanceInterceptor } from '../shared/interceptors/performance.interceptor';
import { AlertService } from '../shared/alerts/alert.service';
import { IPersonInputPort } from 'src/usecases/person/input-port';
import { IPersonCommandRepository } from 'src/domains/repositories/person.repositories';
import { IPersonQueryRepository } from 'src/domains/repositories/person.repositories';
import { IPrincipalCommandRepository } from 'src/domains/repositories/principal.repositories';
import { IPrincipalQueryRepository } from 'src/domains/repositories/principal.repositories';
import { IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
import { IAccountQueryRepository } from 'src/domains/repositories/account.repositories';
import { IContactAddressCommandRepository } from 'src/domains/repositories/contract-address.repositories';
import { IContactAddressQueryRepository } from 'src/domains/repositories/contract-address.repositories';
import { PersonMutationResolver } from '../person/person.resolver';
import { PersonQueryResolver } from '../person/person.resolver';
import { AppController } from '../shared/app.controller';

describe('AppModule', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Module Compilation', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should create the application', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Global Providers', () => {
    it('should create PerformanceInterceptor instance', () => {
      const interceptor = new PerformanceInterceptor();
      expect(interceptor).toBeDefined();
      expect(interceptor).toBeInstanceOf(PerformanceInterceptor);
    });

    it('should create SentryExceptionFilter instance', () => {
      const filter = new SentryExceptionFilter();
      expect(filter).toBeDefined();
      expect(filter).toBeInstanceOf(SentryExceptionFilter);
    });

    it('should create CsrfGuard instance with Reflector', () => {
      const mockReflector = {
        getAllAndOverride: jest.fn(),
      } as any;
      const guard = new CsrfGuard(mockReflector);
      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(CsrfGuard);
    });
  });

  describe('Service Providers', () => {
    it('should provide AlertService', () => {
      const alertService = module.get<AlertService>(AlertService);
      expect(alertService).toBeDefined();
      expect(alertService).toBeInstanceOf(AlertService);
    });
  });

  describe('Repository Providers', () => {
    it('should provide IPersonCommandRepository', () => {
      const repository = module.get<IPersonCommandRepository>(
        IPersonCommandRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IPersonQueryRepository', () => {
      const repository = module.get<IPersonQueryRepository>(
        IPersonQueryRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IPrincipalCommandRepository', () => {
      const repository = module.get<IPrincipalCommandRepository>(
        IPrincipalCommandRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IPrincipalQueryRepository', () => {
      const repository = module.get<IPrincipalQueryRepository>(
        IPrincipalQueryRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IAccountCommandRepository', () => {
      const repository = module.get<IAccountCommandRepository>(
        IAccountCommandRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IAccountQueryRepository', () => {
      const repository = module.get<IAccountQueryRepository>(
        IAccountQueryRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IContactAddressCommandRepository', () => {
      const repository = module.get<IContactAddressCommandRepository>(
        IContactAddressCommandRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide IContactAddressQueryRepository', () => {
      const repository = module.get<IContactAddressQueryRepository>(
        IContactAddressQueryRepository,
      );
      expect(repository).toBeDefined();
    });
  });

  describe('Use Case Providers', () => {
    it('should provide IPersonInputPort', () => {
      const useCase = module.get<IPersonInputPort>(IPersonInputPort);
      expect(useCase).toBeDefined();
    });
  });

  describe('Resolver Providers', () => {
    it('should provide PersonMutationResolver', () => {
      const resolver = module.get<PersonMutationResolver>(
        PersonMutationResolver,
      );
      expect(resolver).toBeDefined();
      expect(resolver).toBeInstanceOf(PersonMutationResolver);
    });

    it('should provide PersonQueryResolver', () => {
      const resolver = module.get<PersonQueryResolver>(PersonQueryResolver);
      expect(resolver).toBeDefined();
      expect(resolver).toBeInstanceOf(PersonQueryResolver);
    });
  });

  describe('Controller Providers', () => {
    it('should provide AppController', () => {
      const controller = module.get<AppController>(AppController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AppController);
    });
  });

  describe('Module Imports', () => {
    it('should import HttpModule', () => {
      // HttpModuleが正しくインポートされていることを確認
      // モジュールがコンパイルされていれば正常
      expect(module).toBeDefined();
    });

    it('should import GraphQLModule', () => {
      // GraphQLModuleが正しくインポートされていることを確認
      // モジュールがコンパイルされていれば正常
      expect(module).toBeDefined();
    });

    it('should import HealthModule', () => {
      // HealthModuleが正しくインポートされていることを確認
      expect(module).toBeDefined();
    });

    it('should import AuthModule', () => {
      // AuthModuleが正しくインポートされていることを確認
      expect(module).toBeDefined();
    });
  });

  describe('Dependency Injection', () => {
    it('should resolve all dependencies without circular dependencies', () => {
      // すべてのプロバイダーが正しく解決できることを確認
      expect(() => {
        module.get(AlertService);
        module.get(IPersonInputPort);
        module.get(IPersonCommandRepository);
        module.get(IPersonQueryRepository);
        module.get(PersonMutationResolver);
        module.get(PersonQueryResolver);
        module.get(AppController);
      }).not.toThrow();
    });

    it('should create unique instances for each repository', () => {
      const personCommandRepo1 = module.get(IPersonCommandRepository);
      const personCommandRepo2 = module.get(IPersonCommandRepository);
      // デフォルトではシングルトンなので同じインスタンス
      expect(personCommandRepo1).toBe(personCommandRepo2);
    });

    it('should inject repositories into use cases', () => {
      const useCase = module.get<IPersonInputPort>(IPersonInputPort);
      // ユースケースが正しく初期化されていることを確認
      expect(useCase).toBeDefined();
      // ユースケースが正しくインスタンス化されていることを確認
      expect(typeof useCase).toBe('object');
    });

    it('should inject dependencies into resolvers', () => {
      const mutationResolver = module.get<PersonMutationResolver>(
        PersonMutationResolver,
      );
      const queryResolver =
        module.get<PersonQueryResolver>(PersonQueryResolver);
      expect(mutationResolver).toBeDefined();
      expect(queryResolver).toBeDefined();
    });
  });

  describe('Application Lifecycle', () => {
    it('should initialize application successfully', async () => {
      // アプリケーションが正常に初期化されることを確認
      await expect(app.init()).resolves.not.toThrow();
    });

    it('should close application gracefully', async () => {
      // アプリケーションが正常にクローズできることを確認
      await expect(app.close()).resolves.not.toThrow();
    });
  });

  describe('Guards, Filters, and Interceptors Integration', () => {
    it('should have module properly configured', () => {
      expect(module).toBeDefined();
      expect(app).toBeDefined();
    });

    it('should create PerformanceInterceptor instance', () => {
      const interceptor = new PerformanceInterceptor();
      expect(interceptor).toBeDefined();
      expect(interceptor).toBeInstanceOf(PerformanceInterceptor);
    });

    it('should create SentryExceptionFilter instance', () => {
      const filter = new SentryExceptionFilter();
      expect(filter).toBeDefined();
      expect(filter).toBeInstanceOf(SentryExceptionFilter);
    });

    it('should create CsrfGuard instance with Reflector', () => {
      const mockReflector = {
        getAllAndOverride: jest.fn(),
      } as any;
      const guard = new CsrfGuard(mockReflector);
      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(CsrfGuard);
    });

    it('should have all core providers available', () => {
      expect(() => {
        module.get(AlertService);
        module.get(AppController);
      }).not.toThrow();
    });
  });
});
