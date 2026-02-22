// フレームワーク層：ログアウトカスタムフック

import { useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "../_lib/toast-helpers";
import { logger } from "../_lib/logger";
import { useAuth } from "../_contexts/auth-context";

/**
 * ログアウト処理用Hook
 * httpOnly Cookie を削除
 */
export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const executeLogout = async () => {
    setIsLoading(true);

    try {
      // Next.js API経由でログアウト（Cookie削除）
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // 認証コンテキストをクリア
        setUser(null);

        // 成功通知
        successToast("ログアウトしました");

        // ログイン画面にリダイレクト
        router.push("/login");
      } else {
        const result = await response.json();
        errorToast(result.error || "ログアウトに失敗しました");
      }
    } catch (error) {
      logger.error("ログアウト処理で予期しないエラーが発生", {
        component: "useLogout",
        action: "executeLogout",
        error,
      });
      errorToast("予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return { executeLogout, isLoading };
}
