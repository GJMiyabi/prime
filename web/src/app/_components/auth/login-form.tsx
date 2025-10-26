"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../_contexts/auth-context";
import {
  LOGIN_MUTATION,
  LoginInput,
  LoginResponse,
} from "../../_hooks/useLogin";

// JWTペイロードの型定義
interface JWTPayload {
  sub: string; // principalId
  username: string;
  email?: string;
  role: string;
  accountId: string;
  iat?: number;
  exp?: number;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginInput>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // ユーザーの役割に応じたリダイレクト先を決定する関数
  const getRedirectPath = (role: string): string => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "/"; // 管理者はホームページ
      case "TEACHER":
        return "/teacher/dashboard"; // 教師用ダッシュボード
      case "STUDENT":
        return "/student/dashboard"; // 学生用ダッシュボード
      default:
        return "/"; // デフォルトはホームページ
    }
  };

  // Apollo Clientを直接使用
  const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost:4000/graphql" }),
    cache: new InMemoryCache(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // エラーをクリア
    if (errors) setErrors("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");

    try {
      const { data } = await client.mutate<
        LoginResponse,
        { input: LoginInput }
      >({
        mutation: LOGIN_MUTATION,
        variables: { input: formData },
      });

      if (data?.login?.accessToken) {
        try {
          // JWTトークンをデコードして実際のユーザー情報を取得
          const decodedToken = jwtDecode<JWTPayload>(data.login.accessToken);

          const userData = {
            id: decodedToken.accountId,
            username: decodedToken.username,
            email: decodedToken.email || `${decodedToken.username}@example.com`,
            role: decodedToken.role,
            principalId: decodedToken.sub,
          };

          login(data.login.accessToken, userData);

          // ユーザーの役割に応じてリダイレクト先を決定
          const redirectPath = getRedirectPath(decodedToken.role);
          router.push(redirectPath);
        } catch (decodeError) {
          console.error("JWT decode error:", decodeError);
          setErrors("認証情報の処理に問題が発生しました。");
        }
      } else {
        setErrors(
          "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors(
        "ログインに失敗しました。ユーザー名またはパスワードが正しくありません。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウントにログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            以下の認証情報でログインしてください
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ユーザー名"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
              />
            </div>
          </div>

          {errors && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {errors}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            <p className="font-medium">テストアカウント:</p>
            <div className="mt-2 space-y-1">
              <p>
                <strong>管理者:</strong> admin / admin123
              </p>
              <p>
                <strong>教師:</strong> teacher / teacher123
              </p>
              <p>
                <strong>学生:</strong> student / student123
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
