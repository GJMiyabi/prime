import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { GqlAuthGuard } from '../gql-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GqlAuthGuard],
    }).compile();

    guard = module.get<GqlAuthGuard>(GqlAuthGuard);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of GqlAuthGuard', () => {
      expect(guard).toBeInstanceOf(GqlAuthGuard);
    });
  });

  describe('getRequest', () => {
    it('should extract request from GraphQL context', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token',
        },
        user: { id: 'user-123' },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
      } as unknown as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(
        mockExecutionContext,
      );
      expect(mockGqlContext.getContext).toHaveBeenCalled();
    });

    it('should handle request with authorization header', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer jwt-token-123',
        },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
      expect(result.headers.authorization).toBe('Bearer jwt-token-123');
    });

    it('should handle request without authorization header', () => {
      // Arrange
      const mockRequest = {
        headers: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
      expect(result.headers.authorization).toBeUndefined();
    });

    it('should handle request with user already attached', () => {
      // Arrange
      const mockUser = {
        id: 'user-456',
        principalId: 'principal-789',
        username: 'testuser',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: mockUser,
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
      expect(result.user).toEqual(mockUser);
    });

    it('should preserve all request properties', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer token',
          'content-type': 'application/json',
        },
        body: { query: 'test' },
        method: 'POST',
        url: '/graphql',
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
      expect(result.method).toBe('POST');
      expect(result.url).toBe('/graphql');
      expect(result.body).toEqual({ query: 'test' });
    });
  });

  describe('JWT Strategy Integration', () => {
    it('should work with JWT strategy', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      // JWT Strategyがこのrequestからトークンを抽出できることを確認
      expect(result.headers.authorization).toContain('Bearer');
    });
  });

  describe('Error Handling', () => {
    it('should return request even if context has minimal properties', () => {
      // Arrange
      const mockRequest = {} as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.getRequest(mockExecutionContext);

      // Assert
      expect(result).toBe(mockRequest);
    });
  });

  describe('GraphQL Context Handling', () => {
    it('should create GqlExecutionContext from ExecutionContext', () => {
      // Arrange
      const mockRequest = { headers: {} } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {
        getType: jest.fn().mockReturnValue('graphql'),
      } as any;

      const createSpy = jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      guard.getRequest(mockExecutionContext);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(mockExecutionContext);
    });

    it('should call getContext on GqlExecutionContext', () => {
      // Arrange
      const mockRequest = { headers: {} } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      const mockExecutionContext = {} as ExecutionContext;

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      guard.getRequest(mockExecutionContext);

      // Assert
      expect(mockGqlContext.getContext).toHaveBeenCalled();
    });
  });
});
