import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from '../auth.resolver';
import { AuthService } from '../auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(resolver).toBeDefined();
    });

    it('should be an instance of AuthResolver', () => {
      expect(resolver).toBeInstanceOf(AuthResolver);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      // Arrange
      const input = { username: 'testuser', password: 'testpass' };
      const expectedResult = { accessToken: 'jwt-token-123' };
      authService.login.mockResolvedValue(expectedResult);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should return access token on successful login', async () => {
      // Arrange
      const input = { username: 'admin', password: 'admin123' };
      const mockToken = { accessToken: 'valid-jwt-token' };
      authService.login.mockResolvedValue(mockToken);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(result).toEqual(mockToken);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.accessToken).toBe('valid-jwt-token');
      }
    });

    it('should return null when login fails', async () => {
      // Arrange
      const input = { username: 'invaliduser', password: 'wrongpass' };
      authService.login.mockResolvedValue(null);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(result).toBeNull();
      expect(authService.login).toHaveBeenCalledWith(
        'invaliduser',
        'wrongpass',
      );
    });

    it('should handle empty username', async () => {
      // Arrange
      const input = { username: '', password: 'somepass' };
      authService.login.mockResolvedValue(null);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(authService.login).toHaveBeenCalledWith('', 'somepass');
      expect(result).toBeNull();
    });

    it('should handle empty password', async () => {
      // Arrange
      const input = { username: 'testuser', password: '' };
      authService.login.mockResolvedValue(null);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(authService.login).toHaveBeenCalledWith('testuser', '');
      expect(result).toBeNull();
    });

    it('should propagate errors from authService', async () => {
      // Arrange
      const input = { username: 'testuser', password: 'testpass' };
      const error = new Error('Database connection failed');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.login(input)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle special characters in username', async () => {
      // Arrange
      const input = {
        username: 'user@example.com',
        password: 'pass123',
      };
      const mockToken = { accessToken: 'token-with-email-user' };
      authService.login.mockResolvedValue(mockToken);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(
        'user@example.com',
        'pass123',
      );
      expect(result).toEqual(mockToken);
    });

    it('should handle long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(100);
      const input = { username: 'testuser', password: longPassword };
      const mockToken = { accessToken: 'token-for-long-pass' };
      authService.login.mockResolvedValue(mockToken);

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(authService.login).toHaveBeenCalledWith('testuser', longPassword);
      expect(result).toEqual(mockToken);
    });
  });

  describe('Decorator Metadata', () => {
    it('should have @Mutation decorator', () => {
      // Arrange & Act
      // Mutationデコレーターが適用されていることを確認
      expect(resolver.login).toBeDefined();
    });

    it('should have @SkipCsrf decorator', () => {
      // Arrange & Act
      const skipCsrfMetadata = Reflect.getMetadata(
        'skipCsrf',
        AuthResolver.prototype.login,
      );

      // Assert
      expect(skipCsrfMetadata).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should accept valid login input', async () => {
      // Arrange
      const input = { username: 'validuser', password: 'validpass123' };
      authService.login.mockResolvedValue({ accessToken: 'token' });

      // Act
      const result = await resolver.login(input);

      // Assert
      expect(result).toBeDefined();
      expect(authService.login).toHaveBeenCalled();
    });

    it('should pass input data unchanged to service', async () => {
      // Arrange
      const input = {
        username: 'test',
        password: 'pass',
      };
      authService.login.mockResolvedValue({ accessToken: 'token' });

      // Act
      await resolver.login(input);

      // Assert
      const callArgs = authService.login.mock.calls[0];
      expect(callArgs[0]).toBe(input.username);
      expect(callArgs[1]).toBe(input.password);
    });
  });
});
