/**
 * Next.js Middleware
 * すべてのリクエストに対して実行され、CSRF保護を提供
 * 
 * CSRF保護の仕組み：
 * 1. POST/PUT/DELETE/PATCH リクエストに対してCSRF検証を実施
 * 2. GET/HEAD/OPTIONS は安全なメソッドとして保護対象外
 * 3. /api/auth/csrf エンドポイント自体は検証対象外（トークン取得用）
 * 4. 検証失敗時は 403 Forbidden を返却
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isCSRFProtectedMethod,
  verifyCSRFToken,
  CSRF_HEADER_NAME,
} from "./app/_lib/csrf.server";

/**
 * CSRF検証が不要なパス
 */
const CSRF_EXEMPT_PATHS = [
  "/api/auth/csrf", // CSRFトークン取得エンドポイント
  "/api/auth/login", // ログインは初回アクセスなのでCSRF不要
];

/**
 * Middleware メイン処理
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // CSRF保護が必要なメソッドかチェック
  if (!isCSRFProtectedMethod(method)) {
    // GET, HEAD, OPTIONS は保護不要
    return NextResponse.next();
  }

  // 除外パスのチェック
  if (CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // APIエンドポイントに対してCSRF検証を実施
  if (pathname.startsWith("/api/")) {
    const isValid = await verifyCSRFToken(request);

    if (!isValid) {
      // CSRF検証失敗
      return NextResponse.json(
        {
          error: "CSRF検証に失敗しました",
          message: "Invalid CSRF token",
          hint: `CSRFトークンを取得して ${CSRF_HEADER_NAME} ヘッダーに含めてください`,
        },
        { status: 403 }
      );
    }
  }

  // 検証成功、または対象外のリクエスト
  return NextResponse.next();
}

/**
 * Middleware を適用するパスの設定
 * すべてのAPIエンドポイントに適用
 */
export const config = {
  matcher: [
    /*
     * 以下のパスを除く、すべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, sitemap.xml, robots.txt (メタデータファイル)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
