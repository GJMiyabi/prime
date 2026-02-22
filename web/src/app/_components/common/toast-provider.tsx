"use client";

import { Toaster } from "react-hot-toast";

/**
 * Toast通知のグローバルプロバイダー
 * アプリケーション全体で使用する通知システム
 * 
 * 使い方:
 * import toast from "react-hot-toast";
 * 
 * toast.success("成功しました");
 * toast.error("エラーが発生しました");
 * toast.loading("処理中...");
 * toast.promise(promise, { loading: "処理中...", success: "完了", error: "失敗" });
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // デフォルトのスタイル
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
        },
        // 成功時のスタイル
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        // エラー時のスタイル
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
        // ローディング時のスタイル
        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
