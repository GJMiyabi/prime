/**
 * 現在の認証ユーザー情報を取得するAPIエンドポイント
 * Cookie からトークンを読み取り、ユーザー情報をデコード
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { logger } from "@/app/_lib/logger";

interface JWTPayload {
  accountId: string;
  username: string;
  email?: string;
  role?: string;
  sub: string; // principalId
  iat: number;
  exp: number;
}

/**
 * GET /api/auth/me
 * 現在ログイン中のユーザー情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // Cookie からトークンを取得
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }

    // トークンをデコード
    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // トークンの有効期限チェック
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return NextResponse.json(
          { error: "トークンの有効期限が切れています" },
          { status: 401 }
        );
      }

      // ユーザー情報を返す
      return NextResponse.json({
        user: {
          id: decoded.accountId,
          username: decoded.username,
          email: decoded.email || `${decoded.username}@example.com`,
          role: decoded.role,
          principalId: decoded.sub,
        },
      });
    } catch (decodeError) {
      logger.error("JWTデコードエラー", {
        component: "MeAPI",
        action: "GET",
        error: decodeError,
      });

      return NextResponse.json(
        { error: "無効なトークンです" },
        { status: 401 }
      );
    }
  } catch (error) {
    logger.error("ユーザー情報取得APIでエラーが発生", {
      component: "MeAPI",
      action: "GET",
      error,
    });

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
