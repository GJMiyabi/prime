import { renderHook, waitFor, act } from '@testing-library/react';
import { usePersonCreate } from '../person/usePersonCreate';
import * as usePersonUseCasesModule from '../factories/usePersonUseCases';
import * as toastHelpers from '../../_lib/toast-helpers';
import * as personValidation from '../../_validations/person.validation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../factories/usePersonUseCases', () => ({
  usePersonUseCases: jest.fn(),
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

jest.mock('../../_validations/person.validation', () => ({
  createValidatedPersonName: jest.fn(),
  createValidatedPersonValue: jest.fn(),
  validatePersonName: jest.fn(() => ({ isValid: true })),
  validatePersonValue: jest.fn(() => ({ isValid: true })),
  PersonValidationRules: {
    name: { minLength: 2, maxLength: 100 },
    value: { minLength: 5, maxLength: 255 },
  },
}));

describe('usePersonCreate', () => {
  const mockPush = jest.fn();
  const mockExecute = jest.fn();

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

    // Mock usePersonUseCases
    jest.mocked(usePersonUseCasesModule.usePersonUseCases).mockReturnValue({
      get: {
        execute: jest.fn(),
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      create: {
        execute: mockExecute,
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    // Mock validation functions
    jest.mocked(personValidation.createValidatedPersonName).mockImplementation(
      (name) => name.trim() as personValidation.ValidatedPersonName
    );
    jest.mocked(personValidation.createValidatedPersonValue).mockImplementation(
      (value) => value.trim() as personValidation.ValidatedPersonValue
    );
  });

  describe('初期状態', () => {
    it('isSubmittingがfalseである', () => {
      const { result } = renderHook(() => usePersonCreate());

      expect(result.current.isSubmitting).toBe(false);
    });

    it('formオブジェクトが提供される', () => {
      const { result } = renderHook(() => usePersonCreate());

      expect(result.current.form).toBeDefined();
      expect(result.current.form.handleSubmit).toBeDefined();
      expect(result.current.form.register).toBeDefined();
    });

    it('onSubmit関数が提供される', () => {
      const { result } = renderHook(() => usePersonCreate());

      expect(result.current.onSubmit).toBeDefined();
      expect(typeof result.current.onSubmit).toBe('function');
    });
  });

  describe('onSubmit - 成功時', () => {
    it('validationを通過してUseCaseを実行する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        value: 'test@example.com',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith({
          name: 'Test Person',
          value: 'test@example.com',
        });
      });
    });

    it('成功トーストを表示する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        value: 'test@example.com',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.successToast).toHaveBeenCalledWith(
          'Personを作成しました'
        );
      });
    });

    it('作成後、詳細ページにリダイレクトする', async () => {
      const mockPerson = {
        id: 'person-123',
        name: 'Test Person',
        value: 'test@example.com',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/person/person-123');
      });
    });

    it('入力値の前後の空白を削除する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        value: 'test@example.com',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', '  Test Person  ');
        result.current.form.setValue('value', '  test@example.com  ');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(personValidation.createValidatedPersonName).toHaveBeenCalledWith(
          'Test Person'
        );
        expect(
          personValidation.createValidatedPersonValue
        ).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('onSubmit - エラー時', () => {
    it('validationエラー時はエラートーストを表示する', async () => {
      // createValidatedPersonNameがnullを返すようにモック
      jest.mocked(
        personValidation.createValidatedPersonName
      ).mockReturnValue(null);

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        // React Hook Formのバリデーションを通過するために正しい形式のデータを設定
        result.current.form.setValue('name', 'Valid Name');
        result.current.form.setValue('value', 'valid@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          '入力データが正しくありません'
        );
      });
    });

    it('UseCaseエラー時はエラートーストを表示する', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: 'Person作成に失敗しました',
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          'Person作成に失敗しました'
        );
      });
    });

    it('エラーメッセージがない場合はデフォルトメッセージを表示する', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: undefined,
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          'Person作成に失敗しました'
        );
      });
    });

    it('予期しないエラー時はエラートーストを表示する', async () => {
      mockExecute.mockRejectedValue(new Error('Unexpected error'));

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(toastHelpers.errorToast).toHaveBeenCalledWith(
          '予期しないエラーが発生しました'
        );
      });
    });

    it('エラー時はリダイレクトしない', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: 'Person作成に失敗しました',
      });

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
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
      mockExecute.mockRejectedValue(new Error('Unexpected error'));

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('ローディング状態', () => {
    it('送信中はisSubmittingがtrueになる', async () => {
      // 遅延を追加してisSubmittingがtrueの間をキャッチできるようにする
      mockExecute.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  person: { id: 'person-1', name: 'Test', value: 'test' },
                }),
              300 // 300msの遅延
            );
          })
      );

      const { result } = renderHook(() => usePersonCreate());

      act(() => {
        result.current.form.setValue('name', 'Test Person');
        result.current.form.setValue('value', 'test@example.com');
      });

      // 送信前はfalse
      expect(result.current.isSubmitting).toBe(false);

      // 送信開始（actなしで呼び出して、すぐに状態をチェックできるようにする）
      const submitPromise = result.current.onSubmit();

      // 送信中はtrueになることを確認
      await waitFor(
        () => {
          expect(result.current.isSubmitting).toBe(true);
        },
        { timeout: 100 }
      );

      // 送信完了を待つ
      await act(async () => {
        await submitPromise;
      });

      // 送信後はfalse
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
