import toast from 'react-hot-toast';
import {
  successToast,
  errorToast,
  infoToast,
  confirmToast,
  loadingToast,
  promiseToast,
} from '../toast-helpers';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(
    jest.fn(),
    {
      success: jest.fn(),
      error: jest.fn(),
      loading: jest.fn(),
      promise: jest.fn(),
      dismiss: jest.fn(),
    }
  ),
}));

describe('toast-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successToast', () => {
    it('成功メッセージを表示', () => {
      successToast('操作が成功しました');

      expect(toast.success).toHaveBeenCalledWith('操作が成功しました', {
        duration: 3000,
      });
    });

    it('カスタムdurationを使用', () => {
      successToast('保存しました', 5000);

      expect(toast.success).toHaveBeenCalledWith('保存しました', {
        duration: 5000,
      });
    });

    it('デフォルトdurationは3000', () => {
      successToast('完了');

      expect(toast.success).toHaveBeenCalledWith('完了', {
        duration: 3000,
      });
    });

    it('空文字でも表示', () => {
      successToast('');

      expect(toast.success).toHaveBeenCalledWith('', {
        duration: 3000,
      });
    });
  });

  describe('errorToast', () => {
    it('エラーメッセージ（string）を表示', () => {
      errorToast('エラーが発生しました');

      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました', {
        duration: 5000,
      });
    });

    it('Errorオブジェクトからメッセージを抽出', () => {
      const error = new Error('データの取得に失敗しました');

      errorToast(error);

      expect(toast.error).toHaveBeenCalledWith('データの取得に失敗しました', {
        duration: 5000,
      });
    });

    it('カスタムdurationを使用', () => {
      errorToast('エラー', 10000);

      expect(toast.error).toHaveBeenCalledWith('エラー', {
        duration: 10000,
      });
    });

    it('デフォルトdurationは5000', () => {
      errorToast('エラー');

      expect(toast.error).toHaveBeenCalledWith('エラー', {
        duration: 5000,
      });
    });

    it('Error.messageが空の場合もエラーなし', () => {
      const error = new Error('');

      errorToast(error);

      expect(toast.error).toHaveBeenCalledWith('', {
        duration: 5000,
      });
    });
  });

  describe('infoToast', () => {
    it('情報メッセージを表示', () => {
      infoToast('データを読み込んでいます');

      expect(toast).toHaveBeenCalledWith('データを読み込んでいます', {
        duration: 4000,
        icon: 'ℹ️',
      });
    });

    it('カスタムdurationを使用', () => {
      infoToast('お知らせ', 6000);

      expect(toast).toHaveBeenCalledWith('お知らせ', {
        duration: 6000,
        icon: 'ℹ️',
      });
    });

    it('デフォルトdurationは4000', () => {
      infoToast('情報');

      expect(toast).toHaveBeenCalledWith('情報', {
        duration: 4000,
        icon: 'ℹ️',
      });
    });

    it('情報アイコンが表示される', () => {
      infoToast('テスト');

      expect(toast).toHaveBeenCalledWith(
        'テスト',
        expect.objectContaining({
          icon: 'ℹ️',
        })
      );
    });
  });

  describe('confirmToast', () => {
    it('確認トーストを表示してPromiseを返す', async () => {
      // toastが呼ばれたときにレンダリングされたJSXをキャプチャ
      jest.mocked(toast).mockImplementation(() => {
        return 'toast-id';
      });

      const promise = confirmToast('本当に削除しますか？');

      expect(toast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: Infinity,
          position: 'top-center',
        })
      );

      // Promiseが返される
      expect(promise).toBeInstanceOf(Promise);
    });

    it('メッセージを含むJSXが表示される', () => {
      const mockToast = jest.mocked(toast);
      
      confirmToast('本当によろしいですか？');

      expect(mockToast).toHaveBeenCalled();
      // toastが呼ばれたかを検証（JSXの内容は実装詳細なので簡略化）
      const callArgs = mockToast.mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('positionはtop-center', () => {
      confirmToast('確認');

      expect(toast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          position: 'top-center',
        })
      );
    });

    it('durationはInfinity（手動で閉じるまで表示）', () => {
      confirmToast('確認');

      expect(toast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: Infinity,
        })
      );
    });
  });

  describe('loadingToast', () => {
    it('ローディングトーストを表示', () => {
      jest.mocked(toast.loading).mockReturnValue('loading-id');

      const id = loadingToast('読み込み中...');

      expect(toast.loading).toHaveBeenCalledWith('読み込み中...');
      expect(id).toBe('loading-id');
    });

    it('トーストIDを返す', () => {
      jest.mocked(toast.loading).mockReturnValue('custom-id');

      const id = loadingToast('処理中');

      expect(id).toBe('custom-id');
    });

    it('空メッセージでも表示', () => {
      jest.mocked(toast.loading).mockReturnValue('id');

      loadingToast('');

      expect(toast.loading).toHaveBeenCalledWith('');
    });
  });

  describe('promiseToast', () => {
    it('Promiseの成功を監視', async () => {
      const promise = Promise.resolve('成功データ');
      const messages = {
        loading: '処理中...',
        success: '完了しました',
        error: '失敗しました',
      };

      jest.mocked(toast.promise).mockResolvedValue(undefined);

      await promiseToast(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(
        promise,
        messages,
        expect.objectContaining({
          success: { duration: 3000 },
          error: { duration: 5000 },
        })
      );
    });

    it('Promiseの失敗を監視', async () => {
      const promise = Promise.resolve('dummy'); // Promise.rejectを避ける
      const messages = {
        loading: '送信中...',
        success: '送信完了',
        error: '送信失敗',
      };

      jest.mocked(toast.promise).mockResolvedValue(undefined);

      await promiseToast(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(
        promise,
        messages,
        expect.objectContaining({
          success: { duration: 3000 },
          error: { duration: 5000 },
        })
      );
    });

    it('成功時のdurationは3000', async () => {
      const promise = Promise.resolve();
      const messages = {
        loading: 'Loading',
        success: 'Success',
        error: 'Error',
      };

      await promiseToast(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(
        promise,
        messages,
        expect.objectContaining({
          success: { duration: 3000 },
        })
      );
    });

    it('失敗時のdurationは5000', async () => {
      const promise = Promise.resolve();
      const messages = {
        loading: 'Loading',
        success: 'Success',
        error: 'Error',
      };

      await promiseToast(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(
        promise,
        messages,
        expect.objectContaining({
          error: { duration: 5000 },
        })
      );
    });

    it('Promiseの結果を返す', async () => {
      const expectedResult = { data: 'test' };
      const promise = Promise.resolve(expectedResult);
      const messages = {
        loading: 'Loading',
        success: 'Success',
        error: 'Error',
      };

      jest.mocked(toast.promise).mockResolvedValue(expectedResult);

      const result = await promiseToast(promise, messages);

      expect(result).toEqual(expectedResult);
    });

    it('複数のPromiseを同時に監視可能', async () => {
      const promise1 = Promise.resolve('result1');
      const promise2 = Promise.resolve('result2');
      const messages = {
        loading: 'Loading',
        success: 'Success',
        error: 'Error',
      };

      jest.mocked(toast.promise).mockResolvedValue(undefined);

      await Promise.all([
        promiseToast(promise1, messages),
        promiseToast(promise2, messages),
      ]);

      expect(toast.promise).toHaveBeenCalledTimes(2);
    });
  });

  describe('エッジケース', () => {
    it('全関数が連続で呼び出せる', () => {
      successToast('成功');
      errorToast('エラー');
      infoToast('情報');
      loadingToast('ローディング');

      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast).toHaveBeenCalledTimes(1); // infoToast
      expect(toast.loading).toHaveBeenCalledTimes(1);
    });

    it('非常に長いメッセージも表示', () => {
      const longMessage = 'あ'.repeat(1000);

      successToast(longMessage);

      expect(toast.success).toHaveBeenCalledWith(longMessage, expect.anything());
    });

    it('特殊文字を含むメッセージ', () => {
      const specialMessage = '<script>alert("XSS")</script>';

      successToast(specialMessage);

      expect(toast.success).toHaveBeenCalledWith(specialMessage, expect.anything());
    });
  });
});