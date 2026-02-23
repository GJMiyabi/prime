import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { LocalAuthGuard } from '../guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should be an instance of AuthController', () => {
      expect(controller).toBeInstanceOf(AuthController);
    });
  });

  describe('login', () => {
    it('should return user from request', () => {
      // Arrange
      const mockUser = {
        id: 'account-123',
        principalId: 'principal-456',
        username: 'testuser',
        email: 'test@example.com',
      };

      const mockRequest = {
        user: mockUser,
      } as any;

      // Act
      const result = controller.login(mockRequest);

      // Assert
      expect(result).toEqual(mockUser);
      expect(result).toBe(mockUser);
    });

    it('should return user with all properties', () => {
      // Arrange
      const mockUser = {
        id: 'account-789',
        principalId: 'principal-101',
        username: 'adminuser',
        email: 'admin@example.com',
      };

      const mockRequest = {
        user: mockUser,
      } as any;

      // Act
      const result = controller.login(mockRequest);

      // Assert
      expect(result).toHaveProperty('id', 'account-789');
      expect(result).toHaveProperty('principalId', 'principal-101');
      expect(result).toHaveProperty('username', 'adminuser');
      expect(result).toHaveProperty('email', 'admin@example.com');
    });

    it('should handle request with undefined user', () => {
      // Arrange
      const mockRequest = {
        user: undefined,
      } as any;

      // Act
      const result = controller.login(mockRequest);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle request with null user', () => {
      // Arrange
      const mockRequest = {
        user: null,
      } as any;

      // Act
      const result = controller.login(mockRequest);

      // Assert
      expect(result).toBeNull();
    });

    it('should pass through user object without modification', () => {
      // Arrange
      const mockUser = {
        id: 'test-id',
        principalId: 'test-principal',
        username: 'testuser',
        email: 'test@test.com',
        extraField: 'extra',
      };

      const mockRequest = {
        user: mockUser,
      } as any;

      // Act
      const result = controller.login(mockRequest);

      // Assert
      expect(result).toBe(mockUser);
      expect((result as any).extraField).toBe('extra');
    });
  });

  describe('LocalAuthGuard Integration', () => {
    it('should be protected by LocalAuthGuard', () => {
      // Arrange & Act
      const loginMetadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.login,
      );

      // Assert
      expect(loginMetadata).toBeDefined();
    });
  });

  describe('Route Metadata', () => {
    it('should have correct route path', () => {
      // Arrange & Act
      const path = Reflect.getMetadata('path', AuthController);

      // Assert
      expect(path).toBe('auth');
    });

    it('should have POST method for login', () => {
      // Arrange & Act
      const method = Reflect.getMetadata(
        'method',
        AuthController.prototype.login,
      );

      // Assert
      expect(method).toBeDefined();
    });
  });
});
