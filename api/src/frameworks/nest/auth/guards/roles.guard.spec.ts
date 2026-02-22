import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesGuard } from './roles.guard';
import { PrincipalKind } from '../../../../domains/type/principal-kind';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      getType: jest.fn().mockReturnValue('graphql'),
    };

    // Mock GqlExecutionContext
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: { user },
      }),
    } as any);

    return mockContext as any;
  };

  describe('canActivate', () => {
    it('ロール指定がない場合はtrueを返す（誰でもアクセス可能）', () => {
      // Arrange
      const context = createMockExecutionContext();
      reflector.getAllAndOverride.mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('空配列のロール指定の場合はtrueを返す', () => {
      // Arrange
      const context = createMockExecutionContext();
      reflector.getAllAndOverride.mockReturnValue([]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('認証されていないユーザーの場合はForbiddenExceptionをスロー', () => {
      // Arrange
      const context = createMockExecutionContext(undefined);
      reflector.getAllAndOverride.mockReturnValue([PrincipalKind.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Authentication required',
      );
    });

    it('必要なロールを持つユーザーはtrueを返す', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'admin',
        role: PrincipalKind.ADMIN,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([PrincipalKind.ADMIN]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('複数のロールが指定されている場合、いずれかに一致すればtrueを返す', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'teacher',
        role: PrincipalKind.TEACHER,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([
        PrincipalKind.ADMIN,
        PrincipalKind.TEACHER,
      ]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('必要なロールを持たないユーザーはForbiddenExceptionをスロー', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'student',
        role: PrincipalKind.STUDENT,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([PrincipalKind.ADMIN]);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    });

    it('ForbiddenExceptionには必要なロール情報が含まれる', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'student',
        role: PrincipalKind.STUDENT,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([
        PrincipalKind.ADMIN,
        PrincipalKind.TEACHER,
      ]);

      // Act & Assert
      try {
        guard.canActivate(context);
        fail('Should throw ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        const response = (error as ForbiddenException).getResponse() as {
          message: string;
          code: string;
          details: string;
        };
        expect(response.details).toContain('ADMIN');
        expect(response.details).toContain('TEACHER');
      }
    });

    it('STUDENTロールは生徒専用エンドポイントにアクセス可能', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'student',
        role: PrincipalKind.STUDENT,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([PrincipalKind.STUDENT]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('STAKEHOLDERロールはstakeholder専用エンドポイントにアクセス可能', () => {
      // Arrange
      const user = {
        sub: 'principal-id',
        username: 'stakeholder',
        role: PrincipalKind.STAKEHOLDER,
        accountId: 'account-id',
      };
      const context = createMockExecutionContext(user);
      reflector.getAllAndOverride.mockReturnValue([PrincipalKind.STAKEHOLDER]);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
