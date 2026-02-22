/**
 * トースト通知ヘルパー関数
 * react-hot-toastをラップして一貫した通知UXを提供
 */

import toast from "react-hot-toast";

/**
 * 成功通知を表示
 * @param message - 表示するメッセージ
 * @param duration - 表示時間（デフォルト: 3秒）
 */
export const successToast = (message: string, duration = 3000) => {
  toast.success(message, { duration });
};

/**
 * エラー通知を表示
 * @param error - Errorオブジェクトまたはエラーメッセージ
 * @param duration - 表示時間（デフォルト: 5秒）
 */
export const errorToast = (error: Error | string, duration = 5000) => {
  const message = error instanceof Error ? error.message : error;
  toast.error(message, { duration });
};

/**
 * 情報通知を表示
 * @param message - 表示するメッセージ
 * @param duration - 表示時間（デフォルト: 4秒）
 */
export const infoToast = (message: string, duration = 4000) => {
  toast(message, { duration });
};

/**
 * 確認ダイアログ風のトースト
 * ユーザーに「はい」「いいえ」の選択を促す
 * 
 * @param message - 確認メッセージ
 * @returns ユーザーの選択結果（はい: true, いいえ: false）
 * 
 * @example
 * const result = await confirmToast("本当に削除しますか？");
 * if (result) {
 *   // 削除処理
 * }
 */
export const confirmToast = async (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              いいえ
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              はい
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // ユーザーが選択するまで表示
        position: "top-center",
      }
    );
  });
};

/**
 * ローディング中のトーストを表示
 * @param message - ローディングメッセージ
 * @returns トーストID（後でdismissするために使用）
 * 
 * @example
 * const loadingId = loadingToast("処理中...");
 * try {
 *   await someAsyncOperation();
 *   toast.dismiss(loadingId);
 *   successToast("完了しました");
 * } catch (error) {
 *   toast.dismiss(loadingId);
 *   errorToast(error);
 * }
 */
export const loadingToast = (message: string): string => {
  return toast.loading(message);
};

/**
 * Promise処理のトースト
 * 処理中・成功・失敗を自動的に切り替える
 * 
 * @param promise - 監視するPromise
 * @param messages - 各状態のメッセージ
 * @returns Promiseの結果
 * 
 * @example
 * await promiseToast(
 *   createPerson(data),
 *   {
 *     loading: "Personを作成中...",
 *     success: "Personを作成しました",
 *     error: "Person作成に失敗しました",
 *   }
 * );
 */
export const promiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> => {
  return toast.promise(promise, messages, {
    success: { duration: 3000 },
    error: { duration: 5000 },
  });
};
