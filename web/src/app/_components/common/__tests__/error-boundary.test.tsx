/**
 * ErrorBoundaryコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../error-boundary';
import { logger } from '@/app/_lib/logger';

// loggerをモック
jest.mock('@/app/_lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// エラーを投げるテストコンポーネント
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // コンソールエラーを抑制（エラーバウンダリのテストなので意図的）
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('エラーがない場合は子コンポーネントを表示する', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('エラーキャッチ', () => {
    it('エラーが発生した場合はデフォルトのエラー画面を表示する', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // デフォルトのエラーメッセージ
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(
        screen.getByText(
          '申し訳ございません。予期しないエラーが発生しました。 問題が解決しない場合は、管理者にお問い合わせください。'
        )
      ).toBeInTheDocument();

      // ボタンの確認
      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ホームへ戻る' })
      ).toBeInTheDocument();
    });

    it('エラーがloggerに記録される', () => {
      const mockLoggerError = logger.error as jest.MockedFunction<
        typeof logger.error
      >;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // loggerが呼ばれたことを確認
      expect(mockLoggerError).toHaveBeenCalledWith(
        'React Error Boundaryがエラーをキャッチ',
        expect.objectContaining({
          component: 'ErrorBoundary',
          error: expect.any(Error),
          meta: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        })
      );
    });
  });

  describe('カスタムfallback', () => {
    it('カスタムfallbackが提供されている場合はそれを表示する', () => {
      const customFallback = (error: Error, reset: () => void) => (
        <div>
          <h1>Custom Error Screen</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error Screen')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Custom Reset' })
      ).toBeInTheDocument();
    });
  });

  describe('リセット機能', () => {
    it('再試行ボタンとホームへ戻るボタンが機能する', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // エラー画面が表示されている
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

      // 再試行ボタンが存在し、クリック可能
      const resetButton = screen.getByRole('button', { name: '再試行' });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toBeEnabled();

      // ホームへ戻るボタンが存在し、クリック可能
      const homeButton = screen.getByRole('button', { name: 'ホームへ戻る' });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toBeEnabled();
    });
  });
});
