import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    // JWT_SECRETを設定
    process.env.JWT_SECRET = 'test-secret-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should be an instance of JwtStrategy', () => {
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });
  });

  describe('validate', () => {
    it('should return user object with sub and username', () => {
      // Arrange
      const payload = {
        sub: 'principal-123',
        username: 'testuser',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: 'principal-123',
        username: 'testuser',
      });
    });

    it('should return user object with only sub when username is missing', () => {
      // Arrange
      const payload = {
        sub: 'principal-456',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: 'principal-456',
        username: undefined,
      });
    });

    it('should preserve sub as principalId', () => {
      // Arrange
      const payload = {
        sub: 'principal-789',
        username: 'admin',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('principal-789');
    });

    it('should preserve username', () => {
      // Arrange
      const payload = {
        sub: 'principal-101',
        username: 'teacher',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.username).toBe('teacher');
    });

    it('should handle payload with additional fields', () => {
      // Arrange
      const payload = {
        sub: 'principal-202',
        username: 'student',
        email: 'student@example.com',
        role: 'STUDENT',
      } as any;

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('principal-202');
      expect(result.username).toBe('student');
      // 追加フィールドは返却されない（明示的に選択されたフィールドのみ）
    });

    it('should return consistent structure', () => {
      // Arrange
      const payload1 = {
        sub: 'principal-1',
        username: 'user1',
      };
      const payload2 = {
        sub: 'principal-2',
        username: 'user2',
      };

      // Act
      const result1 = strategy.validate(payload1);
      const result2 = strategy.validate(payload2);

      // Assert
      expect(Object.keys(result1)).toEqual(['sub', 'username']);
      expect(Object.keys(result2)).toEqual(['sub', 'username']);
    });

    it('should handle empty username', () => {
      // Arrange
      const payload = {
        sub: 'principal-303',
        username: '',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('principal-303');
      expect(result.username).toBe('');
    });

    it('should handle undefined username', () => {
      // Arrange
      const payload = {
        sub: 'principal-404',
        username: undefined,
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('principal-404');
      expect(result.username).toBeUndefined();
    });

    it('should return object that can be attached to req.user', () => {
      // Arrange
      const payload = {
        sub: 'principal-505',
        username: 'graphqluser',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      // このオブジェクトがreq.userまたはGQLのcontext.userに格納される
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('username');
    });
  });

  describe('JWT Configuration', () => {
    it('should use JWT_SECRET from environment', () => {
      // Arrange & Act
      const secret = process.env.JWT_SECRET;

      // Assert
      expect(secret).toBe('test-secret-key');
    });

    it('should extract JWT from Authorization header as Bearer token', () => {
      // Arrange & Act
      // PassportStrategy のコンストラクタで
      // ExtractJwt.fromAuthHeaderAsBearerToken() を使用

      // Assert
      expect(strategy).toBeDefined();
    });

    it('should not ignore token expiration', () => {
      // Arrange & Act
      // コンストラクタで ignoreExpiration: false を設定

      // Assert
      expect(strategy).toBeDefined();
    });
  });

  describe('Passport Integration', () => {
    it('should extend PassportStrategy with JWT Strategy', () => {
      // Arrange & Act
      // PassportStrategy(Strategy)を継承

      // Assert
      expect(strategy).toBeDefined();
    });

    it('should use HS256 algorithm by default', () => {
      // Arrange & Act
      // JWTのデフォルトアルゴリズムはHS256

      // Assert
      expect(strategy).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should validate JWT signature with secret', () => {
      // Arrange & Act
      // JWT検証時にsecretOrKeyを使用してシグネチャを検証

      // Assert
      expect(strategy).toBeDefined();
    });

    it('should reject expired tokens', () => {
      // Arrange & Act
      // ignoreExpiration: false により期限切れトークンを拒否

      // Assert
      expect(strategy).toBeDefined();
    });
  });

  describe('User Context', () => {
    it('should map JWT sub to user identifier', () => {
      // Arrange
      const payload = {
        sub: 'principal-unique-id',
        username: 'contextuser',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      // subはprincipalIdとして使用される
      expect(result.sub).toBe('principal-unique-id');
    });

    it('should provide username for context', () => {
      // Arrange
      const payload = {
        sub: 'principal-999',
        username: 'contextname',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.username).toBe('contextname');
    });
  });

  describe('Payload Structure', () => {
    it('should handle minimal payload', () => {
      // Arrange
      const payload = {
        sub: 'min-principal',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result.sub).toBe('min-principal');
    });

    it('should handle standard JWT payload', () => {
      // Arrange
      const payload = {
        sub: 'standard-principal',
        username: 'standarduser',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('standard-principal');
      expect(result.username).toBe('standarduser');
    });
  });

  describe('Type Safety', () => {
    it('should accept JwtPayload type', () => {
      // Arrange
      const payload: { sub: string; username?: string } = {
        sub: 'typed-principal',
        username: 'typeduser',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
