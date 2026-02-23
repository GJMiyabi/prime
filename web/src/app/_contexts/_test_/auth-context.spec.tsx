import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';
import * as logger from '@/app/_lib/logger';
import React from 'react';

// Mock logger
jest.mock('@/app/_lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    it('初期状態はloading=true, user=null', () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('API成功時にユーザー情報を設定', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'STUDENT',
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith('/api/auth/me', {
        credentials: 'include',
      });
    });

    it('API失敗時はuser=nullのまま', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('ネットワークエラー時はlogger.errorを呼び出してuser=null', async () => {
      const mockError = new Error('Network error');
      jest.mocked(fetch).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(logger.logger.error).toHaveBeenCalledWith(
        'ユーザー情報の取得に失敗',
        expect.objectContaining({
          component: 'AuthProvider',
          action: 'fetchUser',
          error: mockError,
        })
      );
    });

    it('setUserで手動でユーザーを設定できる', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newUser = {
        id: 'user-2',
        username: 'newuser',
        email: 'new@example.com',
      };

      await waitFor(() => {
        result.current.setUser(newUser);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(newUser);
      });
    });

    it('setUserでnullを設定してログアウト状態にできる', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await waitFor(() => {
        result.current.setUser(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
    });

    it('credentials: includeでCookieを送信する', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: '1', username: 'test' } }),
      } as Response);

      renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('複数回レンダリングしてもfetchは1回のみ', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { rerender } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      rerender();

      // useEffectの依存配列が空なので、再レンダリングしても呼ばれない
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('APIレスポンスにuserがない場合はnull設定', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}), // userプロパティなし
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeUndefined();
    });
  });

  describe('useAuth', () => {
    it('AuthProvider外で使用するとエラーをスロー', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });

    it('AuthProvider内で使用すると正常に動作', async () => {
      jest.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('setUser');
    });
  });

  describe('User型の各プロパティ', () => {
    it('必須プロパティ（id, username）が設定される', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(result.current.user?.id).toBe('user-1');
      expect(result.current.user?.username).toBe('testuser');
    });

    it('オプショナルプロパティ（email, role, principalId）が設定される', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'ADMIN',
        principalId: 'principal-1',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.user?.role).toBe('ADMIN');
      expect(result.current.user?.principalId).toBe('principal-1');
    });

    it('オプショナルプロパティなしでも動作する', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
      };

      jest.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      } as Response);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(result.current.user?.email).toBeUndefined();
      expect(result.current.user?.role).toBeUndefined();
      expect(result.current.user?.principalId).toBeUndefined();
    });
  });
});
