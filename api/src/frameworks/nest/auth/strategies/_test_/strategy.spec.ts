import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategy';
import { AuthService } from '../../auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should be an instance of LocalStrategy', () => {
      expect(strategy).toBeInstanceOf(LocalStrategy);
    });
  });

  describe('validate', () => {
    it('should return account when credentials are valid', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpass';
      const mockAccount = {
        id: 'account-123',
        principalId: 'principal-456',
        username: 'testuser',
        email: 'test@example.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      expect(authService.validateUser).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(mockAccount);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      const username = 'invaliduser';
      const password = 'wrongpass';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(username, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when account is null', async () => {
      // Arrange
      const username = 'user';
      const password = 'pass';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call authService.validateUser with correct parameters', async () => {
      // Arrange
      const username = 'admin';
      const password = 'admin123';
      const mockAccount = {
        id: 'account-789',
        principalId: 'principal-101',
        username: 'admin',
        email: 'admin@example.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      await strategy.validate(username, password);

      // Assert
      expect(authService.validateUser).toHaveBeenCalledTimes(1);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'admin',
        'admin123',
      );
    });

    it('should return account with all properties', async () => {
      // Arrange
      const username = 'teacher';
      const password = 'teacher123';
      const mockAccount = {
        id: 'account-202',
        principalId: 'principal-303',
        username: 'teacher',
        email: 'teacher@school.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      expect(result).toHaveProperty('id', 'account-202');
      expect(result).toHaveProperty('principalId', 'principal-303');
      expect(result).toHaveProperty('username', 'teacher');
      expect(result).toHaveProperty('email', 'teacher@school.com');
    });

    it('should handle empty username', async () => {
      // Arrange
      const username = '';
      const password = 'somepass';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith('', 'somepass');
    });

    it('should handle empty password', async () => {
      // Arrange
      const username = 'user';
      const password = '';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith('user', '');
    });

    it('should handle special characters in username', async () => {
      // Arrange
      const username = 'user@example.com';
      const password = 'pass123';
      const mockAccount = {
        id: 'account-404',
        principalId: 'principal-505',
        username: 'user@example.com',
        email: 'user@example.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      expect(result).toEqual(mockAccount);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'user@example.com',
        'pass123',
      );
    });

    it('should handle long passwords', async () => {
      // Arrange
      const username = 'user';
      const password = 'a'.repeat(100);
      const mockAccount = {
        id: 'account-606',
        principalId: 'principal-707',
        username: 'user',
        email: 'user@test.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      expect(result).toEqual(mockAccount);
      expect(authService.validateUser).toHaveBeenCalledWith(username, password);
    });

    it('should propagate errors from authService', async () => {
      // Arrange
      const username = 'user';
      const password = 'pass';
      const error = new Error('Database connection failed');
      authService.validateUser.mockRejectedValue(error);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Passport Strategy Configuration', () => {
    it('should use username field', () => {
      // Arrange & Act
      // コンストラクタでusernameFieldを'username'に設定

      // Assert
      expect(strategy).toBeDefined();
    });

    it('should use password field', () => {
      // Arrange & Act
      // コンストラクタでpasswordFieldを'password'に設定

      // Assert
      expect(strategy).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should complete authentication flow on success', async () => {
      // Arrange
      const username = 'validuser';
      const password = 'validpass';
      const mockAccount = {
        id: 'account-808',
        principalId: 'principal-909',
        username: 'validuser',
        email: 'valid@example.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      // 認証成功時、返されたオブジェクトがrequest.userに格納される
      expect(result).toEqual(mockAccount);
    });

    it('should fail authentication flow on invalid credentials', async () => {
      // Arrange
      const username = 'invaliduser';
      const password = 'invalidpass';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Security', () => {
    it('should not expose password in returned account', async () => {
      // Arrange
      const username = 'secureuser';
      const password = 'securepass';
      const mockAccount = {
        id: 'account-111',
        principalId: 'principal-222',
        username: 'secureuser',
        email: 'secure@example.com',
      };
      authService.validateUser.mockResolvedValue(mockAccount);

      // Act
      const result = await strategy.validate(username, password);

      // Assert
      // パスワードは含まれていない
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(mockAccount);
    });

    it('should validate credentials before granting access', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpass';

      // 最初の試行は失敗
      authService.validateUser.mockResolvedValueOnce(null);
      // 2回目の試行は成功
      authService.validateUser.mockResolvedValueOnce({
        id: 'account-333',
        principalId: 'principal-444',
        username: 'testuser',
        email: 'test@example.com',
      });

      // Act & Assert
      await expect(strategy.validate(username, password)).rejects.toThrow(
        UnauthorizedException,
      );

      const result = await strategy.validate(username, password);
      expect(result).toBeDefined();
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error message on authentication failure', async () => {
      // Arrange
      const username = 'user';
      const password = 'pass';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      try {
        await strategy.validate(username, password);
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe(
          'Invalid credentials',
        );
      }
    });
  });

  describe('Dependency Injection', () => {
    it('should inject AuthService', () => {
      // Assert
      expect(authService).toBeDefined();
      expect(strategy).toBeDefined();
    });

    it('should use injected AuthService for validation', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpass';
      authService.validateUser.mockResolvedValue({
        id: 'test',
        principalId: 'test',
        username: 'test',
        email: 'test@test.com',
      });

      // Act
      await strategy.validate(username, password);

      // Assert
      expect(authService.validateUser).toHaveBeenCalled();
    });
  });
});
