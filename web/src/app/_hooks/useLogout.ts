// フレームワーク層：ログアウトカスタムフック

import { useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "../_lib/toast-helpers";
import { logger } from "../_lib/logger";
import { useAuth } from "../_contexts/auth-context";
import { apiClient } from "../_lib/api-client";

/**
 * ログアウト処理用Hook
 * httpOnly Cookie を削除（CSRF保護あり）
 */
export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const executeLogout = async () => {
    setIsLoading(true);

    try {
      // apiClient経由でログアウト（自動的にCSRFトークン付与）
      await apiClient.post("/api/auth/logout");

      // 認証コンテキストをクリア
      setUser(null);

      // 成功通知
      successToast("ログアウトしました");

      // ログイン画面にリダイレクト
      router.push("/login");
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
