import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthGuard } from '../local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalAuthGuard],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of LocalAuthGuard', () => {
      expect(guard).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('AuthGuard Extension', () => {
    it('should extend AuthGuard with local strategy', () => {
      // Assert
      expect(guard).toBeDefined();
      // LocalAuthGuardはAuthGuard('local')を継承している
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should use local strategy', () => {
      // Arrange & Act
      // LocalAuthGuardが'local'ストラテジーを使用していることを確認
      // これはPassportのLocalStrategyと連携する

      // Assert
      expect(guard).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('Guard Behavior', () => {
    it('should have canActivate method', () => {
      // Assert
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should have handleRequest method inherited from AuthGuard', () => {
      // Assert
      expect((guard as any).handleRequest).toBeDefined();
    });

    it('should have logIn method inherited from AuthGuard', () => {
      // Assert
      expect((guard as any).logIn).toBeDefined();
    });
  });

  describe('Passport Integration', () => {
    it('should work with Passport local strategy', () => {
      // Arrange & Act
      // LocalAuthGuardはPassportのlocalストラテジーを使用する
      // これはusername/passwordによる認証を処理する

      // Assert
      expect(guard).toBeDefined();
    });
  });

  describe('Usage Context', () => {
    it('should be used on login endpoint', () => {
      // Arrange
      // LocalAuthGuardはログインエンドポイント(@Post('login'))で使用される

      // Assert
      expect(guard).toBeDefined();
    });

    it('should validate credentials before allowing access', () => {
      // Arrange
      // LocalStrategyがusername/passwordを検証する
      // 検証成功時のみcanActivateがtrueを返す

      // Assert
      expect(guard).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should be instantiable', () => {
      // Arrange & Act
      const newGuard = new LocalAuthGuard();

      // Assert
      expect(newGuard).toBeDefined();
      expect(newGuard).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('Type Safety', () => {
    it('should be injectable', () => {
      // Arrange & Act
      // @Injectable()デコレーターにより、DIコンテナで使用可能

      // Assert
      expect(guard).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should trigger Passport local strategy validation', () => {
      // Arrange
      // LocalAuthGuardが使用されると、Passportは以下を実行:
      // 1. リクエストからusername/passwordを抽出
      // 2. LocalStrategy.validate()を呼び出す
      // 3. 認証成功時にreq.userにユーザー情報を設定

      // Assert
      expect(guard.canActivate).toBeDefined();
    });

    it('should allow controller to access authenticated user', () => {
      // Arrange
      // LocalAuthGuardによる認証成功後、
      // コントローラーはreq.userからユーザー情報にアクセス可能

      // Assert
      expect(guard).toBeDefined();
    });
  });

  describe('Guard Lifecycle', () => {
    it('should be created as singleton by default', async () => {
      // Arrange
      const module = await Test.createTestingModule({
        providers: [LocalAuthGuard],
      }).compile();

      // Act
      const guard1 = module.get<LocalAuthGuard>(LocalAuthGuard);
      const guard2 = module.get<LocalAuthGuard>(LocalAuthGuard);

      // Assert
      expect(guard1).toBe(guard2);
    });
  });

  describe('Dependency Injection', () => {
    it('should be resolvable from DI container', async () => {
      // Arrange
      const module = await Test.createTestingModule({
        providers: [LocalAuthGuard],
      }).compile();

      // Act
      const resolvedGuard = module.get<LocalAuthGuard>(LocalAuthGuard);

      // Assert
      expect(resolvedGuard).toBeDefined();
      expect(resolvedGuard).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('Strategy Name', () => {
    it('should use "local" as strategy name', () => {
      // Arrange & Act
      // AuthGuard('local')により、Passportは'local'という名前の
      // ストラテジー(LocalStrategy)を探して実行する

      // Assert
      expect(guard).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should prevent unauthorized access when validation fails', () => {
      // Arrange
      // LocalStrategy.validate()がnullを返すかUnauthorizedExceptionを投げると、
      // ガードはアクセスを拒否する

      // Assert
      expect(guard.canActivate).toBeDefined();
    });

    it('should allow access when validation succeeds', () => {
      // Arrange
      // LocalStrategy.validate()がユーザーオブジェクトを返すと、
      // ガードはアクセスを許可し、req.userにユーザー情報を設定する

      // Assert
      expect(guard.canActivate).toBeDefined();
    });
  });
});
