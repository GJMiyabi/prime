// フレームワーク層：ログインカスタムフック（ユースケースとUIの橋渡し）

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_contexts/auth-context";
import { GraphQLAuthRepository } from "../_repositories/auth.repository";
import { LoginUseCase } from "../_usecases/auth/login.usecase";
import { getRedirectPathByRole } from "../_usecases/auth/redirect.usecase";
import { LoginInput } from "../_types/auth";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

/**
 * ログイン処理を扱うカスタムフック
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { login: authContextLogin } = useAuth();
  const router = useRouter();

  // リポジトリとユースケースをメモ化して再生成を防ぐ
  const loginUseCase = useMemo(() => {
    const authRepository = new GraphQLAuthRepository(GRAPHQL_ENDPOINT);
    return new LoginUseCase(authRepository);
  }, []);

  /**
   * ログイン処理を実行
   */
  const executeLogin = async (input: LoginInput): Promise<boolean> => {
    setIsLoading(true);
    setError("");

    try {
      // ユースケースを実行
      const result = await loginUseCase.execute(input);

      if (result.success && result.accessToken && result.user) {
        // 認証コンテキストにログイン情報を保存
        authContextLogin(result.accessToken, result.user);

        // ユーザーのロールに応じてリダイレクト
        const redirectPath = getRedirectPathByRole(result.user.role);
        router.push(redirectPath);

        return true;
      } else {
        setError(result.error || "ログインに失敗しました。");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "予期しないエラーが発生しました。";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    executeLogin,
    isLoading,
    error,
    clearError,
  };
}
