/**
 * LoginFormコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../login-form';
import { useLogin } from '@/app/_hooks/useLogin';
import type { UseFormReturn } from 'react-hook-form';
import type { LoginFormData } from '@/app/_schemas/auth.schema';

// useLoginフックをモック
jest.mock('@/app/_hooks/useLogin');

const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;

describe('LoginForm', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('フォーム要素が正常に表示される', () => {
      // デフォルトのモック設定
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => fn),
          watch: jest.fn(),
          reset: jest.fn(),
          setValue: jest.fn(),
          getValues: jest.fn(),
          setError: jest.fn(),
          clearErrors: jest.fn(),
          trigger: jest.fn(),
          control: {} as unknown,
          unregister: jest.fn(),
          resetField: jest.fn(),
          setFocus: jest.fn(),
          getFieldState: jest.fn(),
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      // ヘッダーテキストの確認
      expect(screen.getByText('アカウントにログイン')).toBeInTheDocument();
      expect(
        screen.getByText('以下の認証情報でログインしてください')
      ).toBeInTheDocument();

      // フォームフィールドの確認
      expect(screen.getByPlaceholderText('ユーザー名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();

      // 送信ボタンの確認
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();

      // テストアカウント情報の確認
      expect(screen.getByText('テストアカウント:')).toBeInTheDocument();
      expect(screen.getByText(/admin \/ admin123/)).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    it('ユーザー名とパスワードの入力が可能', async () => {
      const user = userEvent.setup();
      const mockRegister = jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }));

      mockUseLogin.mockReturnValue({
        form: {
          register: mockRegister,
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => fn),
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      const usernameInput = screen.getByPlaceholderText('ユーザー名');
      const passwordInput = screen.getByPlaceholderText('パスワード');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');

      // registerが正しく呼ばれたか確認
      expect(mockRegister).toHaveBeenCalledWith('username');
      expect(mockRegister).toHaveBeenCalledWith('password');
    });
  });

  describe('バリデーションエラー表示', () => {
    it('ユーザー名のエラーメッセージが表示される', () => {
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              username: {
                type: 'required',
                message: 'ユーザー名は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('ユーザー名は必須です');
    });

    it('パスワードのエラーメッセージが表示される', () => {
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              password: {
                type: 'required',
                message: 'パスワードは必須です',
              },
            },
          },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    });
  });

  describe('送信中状態', () => {
    it('送信中はボタンが無効化され、テキストが変わる', () => {
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: true,
        loginError: null,
      });

      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: 'ログイン中...' });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });

    it('送信中は入力フィールドが無効化される', () => {
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: true,
        loginError: null,
      });

      render(<LoginForm />);

      expect(screen.getByPlaceholderText('ユーザー名')).toBeDisabled();
      expect(screen.getByPlaceholderText('パスワード')).toBeDisabled();
    });
  });

  describe('ログインエラー表示', () => {
    it('ログインエラーメッセージが表示される', () => {
      const errorMessage = 'ユーザー名またはパスワードが正しくありません';

      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: errorMessage,
      });

      render(<LoginForm />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorMessage);
    });
  });

  describe('フォーム送信', () => {
    it('フォーム送信時にonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn(async (e) => e?.preventDefault());

      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
          handleSubmit: jest.fn(() => mockOnSubmit),
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: mockOnSubmit,
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: 'ログイン' });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('入力フィールドに適切なaria属性が設定されている', () => {
      mockUseLogin.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              username: {
                type: 'required',
                message: 'ユーザー名は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<LoginFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
        loginError: null,
      });

      render(<LoginForm />);

      const usernameInput = screen.getByPlaceholderText('ユーザー名');
      expect(usernameInput).toHaveAttribute('aria-required', 'true');
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error');

      const passwordInput = screen.getByPlaceholderText('パスワード');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
