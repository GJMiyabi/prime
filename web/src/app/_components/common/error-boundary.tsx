"use client";

/**
 * React Error Boundary
 * 予期しないエラーをキャッチしてユーザーにフレンドリーなエラー画面を表示
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../../_lib/logger";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントでエラーが発生した場合にキャッチして処理
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生したらstateを更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーをロガーに記録（本番環境ではSentryに送信される）
    logger.error("React Error Boundaryがエラーをキャッチ", {
      component: "ErrorBoundary",
      error,
      meta: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // カスタムのfallbackが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // デフォルトのエラー画面
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * デフォルトのエラーフォールバック画面
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="mt-4 text-xl font-bold text-center text-gray-900">
          エラーが発生しました
        </h1>

        <p className="mt-2 text-sm text-center text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
          問題が解決しない場合は、管理者にお問い合わせください。
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-xs font-semibold text-red-800">
              エラー詳細（開発環境のみ表示）:
            </p>
            <p className="mt-1 text-xs text-red-700 font-mono overflow-auto">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  スタックトレース
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            再試行
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
