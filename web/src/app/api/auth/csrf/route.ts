/**
 * CSRFトークン取得APIエンドポイント
 * GET /api/auth/csrf
 * 
 * クライアント側がCSRFトークンを取得するためのエンドポイント
 * Double Submit Cookie パターン：
 * 1. サーバー側でトークン生成
 * 2. Cookie にトークンを設定（httpOnly: false）
 * 3. レスポンスボディでもトークンを返却
 * 4. クライアント側でトークンをヘッダーに含めてリクエスト送信
 */

import { NextResponse } from "next/server";
import { generateCSRFToken, setCSRFCookie } from "@/app/_lib/csrf.server";
import { logger } from "@/app/_lib/logger";

/**
 * GET /api/auth/csrf
 * CSRFトークンを生成してCookieに設定し、レスポンスで返却
 */
export async function GET() {
  try {
    // 暗号学的に安全なトークン生成
    const token = generateCSRFToken();

    // Cookieにトークンを設定（クライアント側で読み取り可能）
    await setCSRFCookie(token);

    logger.info("CSRFトークン生成成功", {
      component: "csrf/route.ts",
      action: "GET",
    });

    // クライアント側にトークンを返却
    return NextResponse.json({
      token,
      expiresIn: 3600, // 1時間
    });
  } catch (error) {
    logger.error("CSRFトークン生成中にエラー発生", {
      component: "csrf/route.ts",
      action: "GET",
      error,
    });

    return NextResponse.json(
      { error: "トークン生成に失敗しました" },
      { status: 500 }
    );
  }
}
