// フレームワーク層：ログインカスタムフック（React Hook Formとビジネスロジック統合）

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "../_lib/toast-helpers";
import { logger } from "../_lib/logger";
import { useAuth } from "../_contexts/auth-context";
import { loginSchema, LoginFormData } from "../_schemas/auth.schema";
import { getRedirectPathByRole } from "../_usecases/auth/redirect.usecase";

/**
 * ログインフォーム用Hook
 * React Hook FormとビジネスロジックをNext.js API経由で統合
 */
export function useLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { setUser } = useAuth();

  // React Hook Formのセットアップ
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onBlur", // フォーカスが外れた時にバリデーション
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /**
   * フォーム送信ハンドラ
   * バリデーション済みのデータのみが渡される
   */
  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      // Next.js API経由でログイン（httpOnly Cookie設定）
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Cookie を受け取る
        body: JSON.stringify({
          username: data.username.trim(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.user) {
        // 認証コンテキストにユーザー情報を保存
        setUser(result.user);

        // 成功通知
        successToast(`ようこそ、${result.user.username}さん`);

        // ユーザーのロールに応じてリダイレクト
        const redirectPath = getRedirectPathByRole(result.user.role);
        router.push(redirectPath);
      } else {
        // エラーをセット（フォーム下部に表示）
        const errorMessage = result.error || "ログインに失敗しました";
        setLoginError(errorMessage);
        errorToast(errorMessage);
      }
    } catch (error) {
      logger.error("ログイン処理で予期しないエラーが発生", {
        component: "useLogin",
        action: "onSubmit",
        error,
        meta: { username: data.username },
      });
      const errorMessage = "予期しないエラーが発生しました";
      setLoginError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,         // React Hook Formのメソッド全体
    onSubmit,     // 送信ハンドラ
    isSubmitting, // 送信中フラグ
    loginError,   // ログインエラー（バリデーションエラーとは別）
  };
}
