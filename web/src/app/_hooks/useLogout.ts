// フレームワーク層：ログアウトカスタムフック（ユースケースとUIの橋渡し）

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_contexts/auth-context";
import { LogoutUseCase } from "../_usecases/auth/logout.usecase";

/**
 * ログアウト処理を扱うカスタムフック
 */
export function useLogout() {
  const { logout: authContextLogout } = useAuth();
  const router = useRouter();

  // ユースケースをメモ化して再生成を防ぐ
  const logoutUseCase = useMemo(() => {
    return new LogoutUseCase();
  }, []);

  /**
   * ログアウト処理を実行
   */
  const executeLogout = () => {
    // 1. 認証コンテキストからログアウト
    authContextLogout();

    // 2. ユースケースからリダイレクト先を取得
    const redirectPath = logoutUseCase.execute();

    // 3. リダイレクト
    router.push(redirectPath);
  };

  return {
    executeLogout,
  };
}
