/**
 * PersonCreateFormコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonCreateForm from '../index';
import { usePersonCreate } from '@/app/_hooks/person/usePersonCreate';
import * as CONSTANTS from '@/app/person/_constants';
import type { UseFormReturn } from 'react-hook-form';
import type { PersonCreateFormData } from '@/app/_schemas/person.schema';

// usePersonCreateフックをモック
jest.mock('@/app/_hooks/person/usePersonCreate');

const mockUsePersonCreate = usePersonCreate as jest.MockedFunction<
  typeof usePersonCreate
>;

describe('PersonCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('フォーム要素が正常に表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => fn),
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      // ヘッダーテキストの確認
      expect(
        screen.getByText(`${CONSTANTS.LABEL_PROFILE}作成`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`新しい${CONSTANTS.LABEL_PROFILE}情報を入力してください`)
      ).toBeInTheDocument();

      // フォームフィールドの確認
      expect(
        screen.getByPlaceholderText(CONSTANTS.LABEL_NAME_EN)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(CONSTANTS.LABEL_VALUE)
      ).toBeInTheDocument();

      // 送信ボタンの確認
      expect(
        screen.getByRole('button', { name: CONSTANTS.ACTION_SUBMIT })
      ).toBeInTheDocument();

      // 必須項目の説明
      expect(screen.getByText(/は必須項目です/)).toBeInTheDocument();
    });

    it('必須フィールドにアスタリスクが表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      // nameフィールドのラベルに必須マーク
      const nameLabel = screen
        .getByText(CONSTANTS.LABEL_NAME_EN)
        .closest('label');
      expect(nameLabel).toBeInTheDocument();

      // valueフィールドのラベルに必須マーク
      const valueLabel = screen.getByText(CONSTANTS.LABEL_VALUE).closest('label');
      expect(valueLabel).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    it('name入力フィールドが動作する', async () => {
      const user = userEvent.setup();
      const mockRegister = jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }));

      mockUsePersonCreate.mockReturnValue({
        form: {
          register: mockRegister,
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => fn),
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      const nameInput = screen.getByPlaceholderText(CONSTANTS.LABEL_NAME_EN);
      await user.type(nameInput, 'Test Name');

      expect(mockRegister).toHaveBeenCalledWith('name');
    });

    it('value入力フィールドが動作する', async () => {
      const user = userEvent.setup();
      const mockRegister = jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }));

      mockUsePersonCreate.mockReturnValue({
        form: {
          register: mockRegister,
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => fn),
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      const valueInput = screen.getByPlaceholderText(CONSTANTS.LABEL_VALUE);
      await user.type(valueInput, 'Test Value');

      expect(mockRegister).toHaveBeenCalledWith('value');
    });
  });

  describe('バリデーションエラー表示', () => {
    it('nameのエラーメッセージが表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              name: {
                type: 'required',
                message: '名前は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      expect(screen.getByText('名前は必須です')).toBeInTheDocument();
    });

    it('valueのエラーメッセージが表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              value: {
                type: 'required',
                message: '値は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      expect(screen.getByText('値は必須です')).toBeInTheDocument();
    });

    it('複数のエラーメッセージが同時に表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              name: {
                type: 'required',
                message: '名前は必須です',
              },
              value: {
                type: 'required',
                message: '値は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      expect(screen.getByText('名前は必須です')).toBeInTheDocument();
      expect(screen.getByText('値は必須です')).toBeInTheDocument();
    });
  });

  describe('送信中状態', () => {
    it('送信中はボタンが無効化され、ローディング表示になる', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: true,
      });

      render(<PersonCreateForm />);

      const submitButton = screen.getByRole('button', {
        name: CONSTANTS.ACTION_SAVING,
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });

    it('送信中は入力フィールドが無効化される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: true,
      });

      render(<PersonCreateForm />);

      expect(screen.getByPlaceholderText(CONSTANTS.LABEL_NAME_EN)).toBeDisabled();
      expect(screen.getByPlaceholderText(CONSTANTS.LABEL_VALUE)).toBeDisabled();
    });

    it('送信中はローディングスピナーが表示される', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: true,
      });

      render(<PersonCreateForm />);

      // SVGスピナーの存在確認
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('フォーム送信', () => {
    it('フォーム送信時にonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn(async (e) => e?.preventDefault());

      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
          handleSubmit: jest.fn((fn) => mockOnSubmit),
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: mockOnSubmit,
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      const submitButton = screen.getByRole('button', {
        name: CONSTANTS.ACTION_SUBMIT,
      });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('入力フィールドに適切なaria属性が設定されている', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: {
            errors: {
              name: {
                type: 'required',
                message: '名前は必須です',
              },
            },
          },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      render(<PersonCreateForm />);

      const nameInput = screen.getByPlaceholderText(CONSTANTS.LABEL_NAME_EN);
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');

      const valueInput = screen.getByPlaceholderText(CONSTANTS.LABEL_VALUE);
      expect(valueInput).toHaveAttribute('aria-required', 'true');
      expect(valueInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('フォームがnoValidate属性を持つ', () => {
      mockUsePersonCreate.mockReturnValue({
        form: {
          register: jest.fn((name) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            ref: jest.fn(),
          })),
          formState: { errors: {} },
        } as unknown as UseFormReturn<PersonCreateFormData>,
        onSubmit: jest.fn(async (e) => e?.preventDefault()),
        isSubmitting: false,
      });

      const { container } = render(<PersonCreateForm />);
      const form = container.querySelector('form');

      expect(form).toHaveAttribute('noValidate');
    });
  });
});
