/**
 * CSRF（Cross-Site Request Forgery）対策ユーティリティ
 * Double Submit Cookie パターンを実装
 * 
 * セキュリティ要件:
 * - CSRFトークンは暗号学的に安全なランダム値
 * - トークンの有効期限は1時間
 * - Cookie と HTTPヘッダーの両方でトークンを送信
 */

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { logger } from "./logger";

/**
 * CSRF トークン名
 */
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * トークン有効期限（1時間）
 */
const TOKEN_MAX_AGE = 60 * 60; // 3600秒

/**
 * 暗号学的に安全なランダムトークンを生成
 * Node.js の crypto.randomBytes を使用
 */
export function generateCSRFToken(): string {
  // 32バイト（256ビット）のランダム値を生成してBase64エンコード
  return randomBytes(32).toString("base64url");
}

/**
 * CSRFトークンをCookieに設定
 * Double Submit Cookie パターンの一部
 */
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // クライアント側でJavaScriptから読み取り可能にする必要がある
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // CSRF対策として strict に設定
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

/**
 * CookieからCSRFトークンを取得
 */
export async function getCSRFTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * リクエストヘッダーからCSRFトークンを取得
 */
export function getCSRFTokenFromHeader(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

/**
 * CSRF トークンを検証
 * Cookie のトークンとヘッダーのトークンが一致するか確認
 * 
 * @param request - Next.js Request オブジェクト
 * @returns 検証成功の場合 true、失敗の場合 false
 */
export async function verifyCSRFToken(request: Request): Promise<boolean> {
  try {
    // Cookieからトークン取得
    const cookieToken = await getCSRFTokenFromCookie();
    
    // ヘッダーからトークン取得
    const headerToken = getCSRFTokenFromHeader(request);

    // どちらかが存在しない場合は検証失敗
    if (!cookieToken || !headerToken) {
      logger.warn("CSRF検証失敗: トークンが欠落", {
        component: "csrf.ts",
        action: "verifyCSRFToken",
        meta: {
          hasCookie: !!cookieToken,
          hasHeader: !!headerToken,
        },
      });
      return false;
    }

    // トークンが一致するか確認（タイミング攻撃対策として定数時間比較）
    const isValid = timingSafeEqual(cookieToken, headerToken);
    
    if (!isValid) {
      logger.warn("CSRF検証失敗: トークンが一致しない", {
        component: "csrf.ts",
        action: "verifyCSRFToken",
      });
    }

    return isValid;
  } catch (error) {
    logger.error("CSRF検証中にエラー発生", {
      component: "csrf.ts",
      action: "verifyCSRFToken",
      error,
    });
    return false;
  }
}

/**
 * タイミング攻撃を防ぐための定数時間文字列比較
 * 
 * @param a - 比較する文字列1
 * @param b - 比較する文字列2
 * @returns 一致する場合 true
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRFトークンが必要なHTTPメソッドかチェック
 * GET, HEAD, OPTIONS は安全なメソッドとして扱い、CSRF保護不要
 */
export function isCSRFProtectedMethod(method: string): boolean {
  const protectedMethods = ["POST", "PUT", "DELETE", "PATCH"];
  return protectedMethods.includes(method.toUpperCase());
}
