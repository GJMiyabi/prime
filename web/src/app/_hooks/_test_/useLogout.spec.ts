import { renderHook, waitFor } from '@testing-library/react';
import { useLogout } from '../useLogout';
import { UserRole } from '../../_types/auth';
import * as AuthContext from '../../_contexts/auth-context';
import * as apiClient from '../../_lib/api-client';
import * as toastHelpers from '../../_lib/toast-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../_contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../_lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
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

describe('useLogout', () => {
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
      user: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        principalId: 'principal-1',
      },
      setUser: mockSetUser,
      isLoading: false,
    });
  });

  describe('初期状態', () => {
    it('isLoadingがfalseである', () => {
      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoading).toBe(false);
    });

    it('executeLogout関数が提供される', () => {
      const { result } = renderHook(() => useLogout());

      expect(result.current.executeLogout).toBeDefined();
      expect(typeof result.current.executeLogout).toBe('function');
    });
  });

  describe('executeLogout - 成功時', () => {
    it('ログアウトAPIを呼び出す', async () => {
      jest.mocked(apiClient.apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(apiClient.apiClient.post).toHaveBeenCalledWith(
          '/api/auth/logout'
        );
      });
    });

    it('認証コンテキストをクリアする（setUser(null)）', async () => {
      jest.mocked(apiClient.apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null);
      });
    });

    it('成功トーストを表示する', async () => {
      jest.mocked(apiClient.apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(toastHelpers.successToast).toHaveBeenCalledWith(
          'ログアウトしました'
        );
      });
    });

    it('ログイン画面にリダイレクトする', async () => {
      jest.mocked(apiClient.apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('ローディング状態が正しく管理される（true → false）', async () => {
      jest.mocked(apiClient.apiClient.post).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: { success: true } }), 100);
          })
      );

      const { result } = renderHook(() => useLogout());

      expect(result.current.isLoading).toBe(false);

      const logoutPromise = result.current.executeLogout();

      // executeLogout呼び出し直後はisLoadingがtrueになる可能性があるため
      // waitForを使用してisLoadingの変化を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await logoutPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('executeLogout - エラー時', () => {
    it('APIエラー時はエラートーストを表示する', async () => {
      const mockError = new Error('Network error');
      jest.mocked(apiClient.apiClient.post).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          '予期しないエラーが発生しました'
        );
      });
    });

    it('エラー時もローディング状態をfalseに戻す', async () => {
      jest.mocked(apiClient.apiClient.post).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('エラー時は認証コンテキストをクリアしない', async () => {
      jest.mocked(apiClient.apiClient.post).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalled();
      });

      // setUserが呼ばれないことを確認
      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('エラー時はリダイレクトしない', async () => {
      jest.mocked(apiClient.apiClient.post).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useLogout());

      await result.current.executeLogout();

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalled();
      });

      // router.pushが呼ばれないことを確認
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('複数回実行', () => {
    it('連続してexecuteLogoutを呼び出しても正常に動作する', async () => {
      jest.mocked(apiClient.apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useLogout());

      // 1回目
      await result.current.executeLogout();

      await waitFor(() => {
        expect(apiClient.apiClient.post).toHaveBeenCalledTimes(1);
      });

      // 2回目
      await result.current.executeLogout();

      await waitFor(() => {
        expect(apiClient.apiClient.post).toHaveBeenCalledTimes(2);
      });
    });
  });
});
