/**
 * ProtectedRouteコンポーネントのテスト
 */

import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../protected-route';
import { useAuth } from '@/app/_contexts/auth-context';
import { useRouter } from 'next/navigation';

// useAuthとuseRouterをモック
jest.mock('@/app/_contexts/auth-context');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  describe('認証済みユーザー', () => {
    it('ユーザーがログインしている場合は子コンポーネントを表示する', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', username: 'testuser', role: 'ADMIN' },
        isLoading: false,
        setUser: jest.fn(),
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('未認証ユーザー', () => {
    it('ユーザーが未ログインの場合はログインページにリダイレクトする', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        setUser: jest.fn(),
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    it('認証状態を確認中はローディング表示する', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        setUser: jest.fn(),
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
