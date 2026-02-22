/**
 * ログアウトAPIエンドポイント
 * httpOnly Cookie を削除
 */

import {  NextResponse } from "next/server";
import { logger } from "@/app/_lib/logger";

/**
 * POST /api/auth/logout
 * ログアウト（Cookie削除）
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "ログアウトしました",
    });

    // ✅ httpOnly Cookie を削除
    response.cookies.set({
      name: "access_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // 即座に削除
      path: "/",
    });

    logger.info("ログアウト成功", {
      component: "LogoutAPI",
      action: "POST",
    });

    return response;
  } catch (error) {
    logger.error("ログアウトAPIでエラーが発生", {
      component: "LogoutAPI",
      action: "POST",
      error,
    });

    return NextResponse.json(
      { error: "ログアウトに失敗しました" },
      { status: 500 }
    );
  }
}
