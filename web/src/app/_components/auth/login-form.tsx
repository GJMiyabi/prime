// フレームワーク層：ログインフォームUIコンポーネント
"use client";

import React from "react";
import { useLogin } from "../../_hooks/useLogin";

/**
 * ログインフォームコンポーネント
 * React Hook Formで完全に制御され、バリデーションは_schemasで一元管理
 */
export default function LoginForm() {
  const { form, onSubmit, isSubmitting, loginError } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

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
        <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                {...register("username")}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="ユーザー名"
              />
              {errors.username && (
                <p id="username-error" className="text-red-600 text-xs mt-1" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="パスワード"
              />
              {errors.password && (
                <p id="password-error" className="text-red-600 text-xs mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {loginError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded" role="alert">
              {loginError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
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
