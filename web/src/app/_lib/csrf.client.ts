/**
 * CSRF クライアント側ユーティリティ
 * ブラウザ環境でCSRFトークンを取得するための軽量版
 */

/**
 * CSRF トークン名（サーバー側と一致させる）
 */
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Cookie からCSRFトークンを取得
 * ブラウザ環境専用
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split("; ");
  const csrfCookie = cookies.find((cookie) =>
    cookie.startsWith(`${CSRF_COOKIE_NAME}=`)
  );

  if (!csrfCookie) {
    return null;
  }

  return csrfCookie.split("=")[1];
}
