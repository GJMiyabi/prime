/**
 * ログインAPIエンドポイント（Next.js App Router）
 * JWT を httpOnly Cookie として設定
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/_lib/logger";

/**
 * ログインリクエストの型
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * POST /api/auth/login
 * ユーザー名とパスワードでログイン
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: "ユーザー名とパスワードは必須です" },
        { status: 400 }
      );
    }

    // バックエンドAPIにログインリクエスト
    const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql";
    const loginMutation = `
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          accessToken
          user {
            id
            username
            email
            role
            principalId
          }
        }
      }
    `;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: loginMutation,
        variables: { username, password },
      }),
    });

    const result = await response.json();

    // エラーチェック
    if (result.errors) {
      logger.error("バックエンドログインエラー", {
        component: "LoginAPI",
        action: "POST",
        error: result.errors[0],
        meta: { username },
      });

      return NextResponse.json(
        { error: result.errors[0].message || "ログインに失敗しました" },
        { status: 401 }
      );
    }

    const { accessToken, user } = result.data.login;

    if (!accessToken || !user) {
      return NextResponse.json(
        { error: "ログイン情報の取得に失敗しました" },
        { status: 401 }
      );
    }

    // レスポンス作成
    const apiResponse = NextResponse.json({
      success: true,
      user,
    });

    // ✅ httpOnly Cookie として accessToken を設定
    apiResponse.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true, // JavaScriptからアクセス不可（XSS対策）
      secure: process.env.NODE_ENV === "production", // 本番環境ではHTTPSのみ
      sameSite: "lax", // CSRF対策（strictだと外部リンクからのアクセスで問題が出る場合がある）
      maxAge: 60 * 60 * 24, // 24時間
      path: "/",
    });

    logger.info("ログイン成功", {
      component: "LoginAPI",
      action: "POST",
      meta: { username, userId: user.id },
    });

    return apiResponse;
  } catch (error) {
    logger.error("ログインAPIでエラーが発生", {
      component: "LoginAPI",
      action: "POST",
      error,
    });

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
