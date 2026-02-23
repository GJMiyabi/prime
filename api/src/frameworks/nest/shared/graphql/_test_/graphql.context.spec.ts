import { GraphContext } from '../graphql.context';
import { RequestWithUser, AuthenticatedUser } from '../../types/request.types';

describe('GraphContext', () => {
  describe('constructor', () => {
    it('should create context with request', () => {
      // Arrange
      const mockRequest = {
        headers: {},
        body: {},
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.request).toBe(mockRequest);
    });
  });

  describe('user getter', () => {
    it('should return user when authenticated', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-123',
        role: 'ADMIN',
        sub: 'principal-456',
      };
      const mockRequest = {
        user: mockUser,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.user).toBe(mockUser);
      expect(context.user?.userId).toBe('user-123');
      expect(context.user?.role).toBe('ADMIN');
      expect(context.user?.sub).toBe('principal-456');
    });

    it('should return undefined when not authenticated', () => {
      // Arrange
      const mockRequest = {} as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.user).toBeUndefined();
    });
  });

  describe('isAuthenticated getter', () => {
    it('should return true when user exists', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-123',
        role: 'TEACHER',
        sub: 'principal-789',
      };
      const mockRequest = {
        user: mockUser,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(true);
    });

    it('should return false when user does not exist', () => {
      // Arrange
      const mockRequest = {} as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(false);
    });

    it('should return false when user is undefined', () => {
      // Arrange
      const mockRequest = {
        user: undefined,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(false);
    });
  });

  describe('principalId getter', () => {
    it('should return principalId when user is authenticated', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-123',
        role: 'STUDENT',
        sub: 'principal-999',
      };
      const mockRequest = {
        user: mockUser,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.principalId).toBe('principal-999');
    });

    it('should return undefined when user is not authenticated', () => {
      // Arrange
      const mockRequest = {} as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.principalId).toBeUndefined();
    });

    it('should return undefined when user has no sub field', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-123',
        role: 'ADMIN',
      };
      const mockRequest = {
        user: mockUser,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.principalId).toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should handle complete authenticated user', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-xyz',
        role: 'TEACHER',
        sub: 'principal-abc',
      };
      const mockRequest = {
        user: mockUser,
        headers: { authorization: 'Bearer token' },
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(true);
      expect(context.user?.userId).toBe('user-xyz');
      expect(context.user?.role).toBe('TEACHER');
      expect(context.principalId).toBe('principal-abc');
    });

    it('should handle unauthenticated request with all undefined values', () => {
      // Arrange
      const mockRequest = {
        headers: {},
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(false);
      expect(context.user).toBeUndefined();
      expect(context.principalId).toBeUndefined();
    });

    it('should work with minimal user info (userId only)', () => {
      // Arrange
      const mockUser: AuthenticatedUser = {
        userId: 'user-minimal',
      };
      const mockRequest = {
        user: mockUser,
      } as RequestWithUser;

      // Act
      const context = new GraphContext(mockRequest);

      // Assert
      expect(context.isAuthenticated).toBe(true);
      expect(context.user?.userId).toBe('user-minimal');
      expect(context.user?.role).toBeUndefined();
      expect(context.principalId).toBeUndefined();
    });
  });
});
