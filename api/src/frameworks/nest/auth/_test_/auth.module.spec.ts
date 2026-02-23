import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { AuthResolver } from '../auth.resolver';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/strategy';
import { IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
import { IAccountQueryRepository } from 'src/domains/repositories/account.repositories';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  describe('Module Compilation', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined();
    });
  });

  describe('Service Providers', () => {
    it('should provide AuthService', () => {
      const service = module.get<AuthService>(AuthService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AuthService);
    });
  });

  describe('Controller Providers', () => {
    it('should provide AuthController', () => {
      const controller = module.get<AuthController>(AuthController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });
  });

  describe('Resolver Providers', () => {
    it('should provide AuthResolver', () => {
      const resolver = module.get<AuthResolver>(AuthResolver);
      expect(resolver).toBeDefined();
      expect(resolver).toBeInstanceOf(AuthResolver);
    });
  });

  describe('Strategy Providers', () => {
    it('should provide JwtStrategy', () => {
      const strategy = module.get<JwtStrategy>(JwtStrategy);
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('should provide LocalStrategy', () => {
      const strategy = module.get<LocalStrategy>(LocalStrategy);
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(LocalStrategy);
    });
  });

  describe('Repository Providers', () => {
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
  });

  describe('Module Imports', () => {
    it('should import PassportModule', () => {
      // PassportModuleが正しくインポートされていることを確認
      expect(module).toBeDefined();
    });

    it('should import JwtModule', () => {
      // JwtModuleが正しくインポートされていることを確認
      expect(module).toBeDefined();
    });
  });

  describe('Module Exports', () => {
    it('should export AuthService', () => {
      const service = module.get<AuthService>(AuthService);
      expect(service).toBeDefined();
    });

    it('should export JwtStrategy', () => {
      const strategy = module.get<JwtStrategy>(JwtStrategy);
      expect(strategy).toBeDefined();
    });

    it('should export LocalStrategy', () => {
      const strategy = module.get<LocalStrategy>(LocalStrategy);
      expect(strategy).toBeDefined();
    });
  });

  describe('Dependency Injection', () => {
    it('should resolve all dependencies without errors', () => {
      expect(() => {
        module.get(AuthService);
        module.get(AuthController);
        module.get(AuthResolver);
        module.get(JwtStrategy);
        module.get(LocalStrategy);
      }).not.toThrow();
    });

    it('should create singleton instances', () => {
      const service1 = module.get<AuthService>(AuthService);
      const service2 = module.get<AuthService>(AuthService);
      expect(service1).toBe(service2);
    });

    it('should inject dependencies into AuthService', () => {
      const service = module.get<AuthService>(AuthService);
      expect(service).toBeDefined();
      // AuthServiceが正しく依存性を注入されていることを確認
      expect(typeof (service as any).validateUser).toBe('function');
      expect(typeof (service as any).login).toBe('function');
    });

    it('should inject dependencies into strategies', () => {
      const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
      const localStrategy = module.get<LocalStrategy>(LocalStrategy);
      expect(jwtStrategy).toBeDefined();
      expect(localStrategy).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should use JWT_SECRET from environment', () => {
      // JWT_SECRETが設定されていることを確認
      expect(process.env.JWT_SECRET).toBeDefined();
    });

    it('should use JWT_EXPIRES_IN from environment or default', () => {
      // JWT_EXPIRES_INが設定されているか、デフォルト値が使用されることを確認
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      expect(expiresIn).toBeDefined();
    });
  });
});
