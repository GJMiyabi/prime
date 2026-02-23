import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CsrfGuard } from '../csrf.guard';
import { SKIP_CSRF_KEY } from '../../decorators/skip-csrf.decorator';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: Reflector;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    // テスト環境変数を保存
    originalEnv = process.env.NODE_ENV;
    // テスト中はNODE_ENVを'development'に設定してCSRFチェックを有効にする
    process.env.NODE_ENV = 'development';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CsrfGuard>(CsrfGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // テスト環境変数を元に戻す
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of CsrfGuard', () => {
      expect(guard).toBeInstanceOf(CsrfGuard);
    });
  });

  describe('canActivate - @SkipCsrf decorator', () => {
    it('テスト環境ではCSRFチェックをスキップ', () => {
      // Arrange
      process.env.NODE_ENV = 'test';

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      // テスト環境ではreflectorは呼ばれない
      expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });

    it('@SkipCsrf デコレーターがある場合はCSRFチェックをスキップ', () => {
      // Arrange
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_CSRF_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });
  });

  describe('canActivate - Query operations', () => {
    it('Query操作の場合はCSRFチェックをスキップ', () => {
      // Arrange
      const mockRequest = {
        cookies: {},
        headers: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'query',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('canActivate - Mutation operations', () => {
    it('Mutation操作でCSRFトークンが正しい場合は成功', () => {
      // Arrange
      const csrfToken = 'valid-csrf-token-123';
      const mockRequest = {
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('Mutation操作でCookieにCSRFトークンがない場合はForbiddenException', () => {
      // Arrange
      const mockRequest = {
        cookies: {},
        headers: { 'x-csrf-token': 'some-token' },
        body: { operationName: 'CreateUser' },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF token is required',
      );
    });

    it('Mutation操作でHeaderにCSRFトークンがない場合はForbiddenException', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'some-token' },
        headers: {},
        body: { operationName: 'UpdateUser' },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF token is required',
      );
    });

    it('Mutation操作でCSRFトークンが不一致の場合はForbiddenException', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'cookie-token-123' },
        headers: { 'x-csrf-token': 'header-token-456' },
        body: { operationName: 'DeleteUser' },
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF token validation failed',
      );
    });

    it('Mutation操作でCSRFトークンの長さが異なる場合はForbiddenException', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'short' },
        headers: { 'x-csrf-token': 'very-long-token' },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF token validation failed',
      );
    });

    it('Mutation操作でCSRFトークンが空文字列の場合はForbiddenException', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: '' },
        headers: { 'x-csrf-token': '' },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF token is required',
      );
    });
  });

  describe('canActivate - Unknown operation type', () => {
    it('不明な操作タイプの場合は拒否', () => {
      // Arrange
      const mockRequest = {
        cookies: {},
        headers: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'subscription',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('operationTypeがundefinedの場合は拒否', () => {
      // Arrange
      const mockRequest = {
        cookies: {},
        headers: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {},
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('timingSafeEqual', () => {
    it('同じ文字列の場合はtrueを返す', () => {
      // Arrange
      const token = 'test-token-123';
      const mockRequest = {
        cookies: { csrf_token: token },
        headers: { 'x-csrf-token': token },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('異なる文字列の場合はForbiddenExceptionをスローする', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'token-abc' },
        headers: { 'x-csrf-token': 'token-xyz' },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('長さが異なる文字列の場合はForbiddenExceptionをスローする', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'short' },
        headers: { 'x-csrf-token': 'very-long-token' },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Error handling', () => {
    it('ForbiddenException以外のエラーをラップする', () => {
      // Arrange
      const mockRequest = {
        cookies: { csrf_token: 'token' },
        get headers() {
          throw new Error('Unexpected error');
        },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'CSRF validation failed',
      );
    });
  });

  describe('Edge cases', () => {
    it('CSRFトークンに特殊文字が含まれる場合も正しく検証', () => {
      // Arrange
      const token = 'token-!@#$%^&*()_+-=[]{}|;:,.<>?';
      const mockRequest = {
        cookies: { csrf_token: token },
        headers: { 'x-csrf-token': token },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('CSRFトークンが非常に長い場合も正しく検証', () => {
      // Arrange
      const token = 'a'.repeat(1000);
      const mockRequest = {
        cookies: { csrf_token: token },
        headers: { 'x-csrf-token': token },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('CSRFトークンがUnicode文字を含む場合も正しく検証', () => {
      // Arrange
      const token = 'token-日本語-😀-🔒';
      const mockRequest = {
        cookies: { csrf_token: token },
        headers: { 'x-csrf-token': token },
        body: {},
      } as any;

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
        getInfo: jest.fn().mockReturnValue({
          operation: {
            operation: 'mutation',
          },
        }),
      };

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockGqlContext as any);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });
  });
});
