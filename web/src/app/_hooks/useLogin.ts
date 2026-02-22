// フレームワーク層：ログインカスタムフック（React Hook Formとビジネスロジック統合）

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { successToast, errorToast } from "../_lib/toast-helpers";
import { logger } from "../_lib/logger";
import { useAuth } from "../_contexts/auth-context";
import { GraphQLAuthRepository } from "../_repositories/auth.repository";
import { LoginUseCase } from "../_usecases/auth/login.usecase";
import { getRedirectPathByRole } from "../_usecases/auth/redirect.usecase";
import { loginSchema, LoginFormData } from "../_schemas/auth.schema";
import { CONFIG } from "../_constants/config";

/**
 * ログインフォーム用Hook
 * React Hook Formとビジネスロジックを統合
 */
export function useLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login: authContextLogin } = useAuth();

  // React Hook Formのセットアップ
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onBlur", // フォーカスが外れた時にバリデーション
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // リポジトリとユースケースをメモ化して再生成を防ぐ
  const loginUseCase = useMemo(() => {
    const authRepository = new GraphQLAuthRepository(CONFIG.GRAPHQL_ENDPOINT);
    return new LoginUseCase(authRepository);
  }, []);

  /**
   * フォーム送信ハンドラ
   * バリデーション済みのデータのみが渡される
   */
  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      // バリデーション済みのデータをUseCaseに渡す
      const result = await loginUseCase.execute({
        username: data.username.trim(),
        password: data.password,
      });

      if (result.success && result.accessToken && result.user) {
        // 認証コンテキストにログイン情報を保存
        authContextLogin(result.accessToken, result.user);

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
