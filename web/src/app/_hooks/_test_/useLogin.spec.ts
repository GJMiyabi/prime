import { renderHook, waitFor, act } from '@testing-library/react';
import { useLogin } from '../useLogin';
import { UserRole } from '../../_types/auth';
import * as AuthContext from '../../_contexts/auth-context';
import * as toastHelpers from '../../_lib/toast-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../_contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../_lib/toast-helpers', () => ({
  successToast: jest.fn(),
  errorToast: jest.fn(),
}));

jest.mock('../../_lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../_validations/auth.validation', () => ({
  validateUsername: jest.fn(() => ({ isValid: true })),
  validatePassword: jest.fn(() => ({ isValid: true })),
  AuthValidationRules: {
    username: { minLength: 3, maxLength: 50, pattern: /^[\s\w-]+$/ }, // 空白も許可
    password: { minLength: 8 },
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('useLogin', () => {
  const mockPush = jest.fn();
  const mockSetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useRouter
    const nextNavigation = jest.requireMock<typeof import('next/navigation')>('next/navigation');
    jest.mocked(nextNavigation.useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });

    // Mock useAuth
    jest.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      isLoading: false,
    });
  });

  describe('初期状態', () => {
    it('isSubmittingがfalseである', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.isSubmitting).toBe(false);
    });

    it('loginErrorがnullである', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.loginError).toBeNull();
    });

    it('formオブジェクトが提供される', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.form).toBeDefined();
      expect(result.current.form.handleSubmit).toBeDefined();
      expect(result.current.form.register).toBeDefined();
    });

    it('onSubmit関数が提供される', () => {
      const { result } = renderHook(() => useLogin());

      expect(result.current.onSubmit).toBeDefined();
      expect(typeof result.current.onSubmit).toBe('function');
    });
  });

  describe('onSubmit - 成功時', () => {
    it('ログインAPIを呼び出してユーザー情報を設定する（ADMIN）', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'admin');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              username: 'admin',
              password: 'password123',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      });
    });

    it('成功トーストを表示する', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'testuser');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.successToast).toHaveBeenCalledWith(
          'ようこそ、testuserさん'
        );
      });
    });

    it('ADMINロールの場合、/にリダイレクトする', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'admin');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('TEACHERロールの場合、/teacher/dashboardにリダイレクトする', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'teacher',
        email: 'teacher@example.com',
        role: UserRole.TEACHER,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'teacher');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/teacher/dashboard');
      });
    });

    it('STUDENTロールの場合、/student/dashboardにリダイレクトする', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'student',
        email: 'student@example.com',
        role: UserRole.STUDENT,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'student');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
      });
    });
  });

  describe('onSubmit - エラー時', () => {
    it('APIエラー時はloginErrorを設定する', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ユーザー名またはパスワードが正しくありません',
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'wronguser');
        result.current.form.setValue('password', 'wrongpass');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.loginError).toBe(
          'ユーザー名またはパスワードが正しくありません'
        );
      });
    });

    it('エラー時はエラートーストを表示する', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ログインに失敗しました',
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'testuser');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          'ログインに失敗しました'
        );
      });
    });

    it('ネットワークエラー時はエラーを設定する', async () => {
      jest.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'testuser');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.loginError).toBe(
          '予期しないエラーが発生しました'
        );
      });
    });

    it('エラー時はリダイレクトしない', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ログインに失敗しました',
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'testuser');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalled();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('エラー時も最終的にisSubmittingがfalseに戻る', async () => {
      jest.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', 'testuser');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('入力値のトリミング', () => {
    it('ユーザー名の前後の空白を削除する', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      } as Response);

      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.form.setValue('username', '  testuser  ');
        result.current.form.setValue('password', 'password123');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            body: JSON.stringify({
              username: 'testuser',
              password: 'password123',
            }),
          })
        );
      });
    });
  });
});
