import { renderHook } from '@testing-library/react';
import { useRole } from '../useRole';
import { UserRole } from '../../_types/auth';
import * as AuthContext from '../../_contexts/auth-context';

// Mock useAuth
jest.mock('../../_contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('useRole', () => {
  describe('role', () => {
    it('ユーザーがログインしている場合、roleを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.role).toBe(UserRole.ADMIN);
    });

    it('ユーザーがログインしていない場合、roleはundefined', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.role).toBeUndefined();
    });
  });

  describe('hasRole', () => {
    it('指定されたroleを持っている場合、trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'teacher',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(UserRole.TEACHER)).toBe(true);
    });

    it('指定されたroleを持っていない場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'student',
          email: 'student@example.com',
          role: UserRole.STUDENT,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    });

    it('ユーザーがログインしていない場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('hasMinRole', () => {
    it('指定された最低権限以上を持っている場合、trueを返す（ADMIN >= STUDENT）', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasMinRole(UserRole.STUDENT)).toBe(true);
    });

    it('指定された最低権限以上を持っている場合、trueを返す（TEACHER >= STUDENT）', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'teacher',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasMinRole(UserRole.STUDENT)).toBe(true);
    });

    it('指定された最低権限に満たない場合、falseを返す（STUDENT < ADMIN）', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'student',
          email: 'student@example.com',
          role: UserRole.STUDENT,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasMinRole(UserRole.ADMIN)).toBe(false);
    });

    it('同じ権限レベルの場合、trueを返す（TEACHER >= TEACHER）', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'teacher',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasMinRole(UserRole.TEACHER)).toBe(true);
    });

    it('ユーザーがログインしていない場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasMinRole(UserRole.STUDENT)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('指定されたリストのいずれかのroleを持っている場合、trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'teacher',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(
        result.current.hasAnyRole([UserRole.ADMIN, UserRole.TEACHER])
      ).toBe(true);
    });

    it('指定されたリストのどのroleも持っていない場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'student',
          email: 'student@example.com',
          role: UserRole.STUDENT,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(
        result.current.hasAnyRole([UserRole.ADMIN, UserRole.TEACHER])
      ).toBe(false);
    });

    it('空の配列を渡した場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.hasAnyRole([])).toBe(false);
    });

    it('ユーザーがログインしていない場合、falseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(
        result.current.hasAnyRole([UserRole.ADMIN, UserRole.TEACHER])
      ).toBe(false);
    });
  });

  describe('便利なboolean flags', () => {
    it('isAdmin: 管理者の場合trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
      expect(result.current.isStakeholder).toBe(false);
    });

    it('isTeacher: 教師の場合trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'teacher',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(true);
      expect(result.current.isStudent).toBe(false);
      expect(result.current.isStakeholder).toBe(false);
    });

    it('isStudent: 学生の場合trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'student',
          email: 'student@example.com',
          role: UserRole.STUDENT,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(true);
      expect(result.current.isStakeholder).toBe(false);
    });

    it('isStakeholder: 関係者の場合trueを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: {
          id: 'user-1',
          username: 'stakeholder',
          email: 'stakeholder@example.com',
          role: UserRole.STAKEHOLDER,
          principalId: 'principal-1',
        },
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
      expect(result.current.isStakeholder).toBe(true);
    });

    it('ユーザーがログインしていない場合、すべてfalseを返す', () => {
      jest.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        setUser: jest.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useRole());

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.isStudent).toBe(false);
      expect(result.current.isStakeholder).toBe(false);
    });
  });
});
