/**
 * CSRF対応 API クライアント
 * すべての fetch リクエストに自動的にCSRFトークンを付与
 * 
 * 使用方法:
 * ```typescript
 * import { apiClient } from '@/app/_lib/api-client';
 * 
 * // GET リクエスト（CSRFトークン不要）
 * const data = await apiClient.get('/api/users');
 * 
 * // POST リクエスト（自動的にCSRFトークンを付与）
 * const result = await apiClient.post('/api/users', { name: 'John' });
 * ```
 */

import { CSRF_HEADER_NAME, getCSRFTokenFromCookie as getCookieToken } from "./csrf.client";
import { logger } from "./logger";

/**
 * CSRFトークンをCookieから取得
 * csrf.client.ts から再エクスポート
 */
const getCSRFTokenFromCookie = getCookieToken;

/**
 * CSRFトークンをサーバーから取得
 * Cookie にトークンがない場合に自動的に取得
 */
async function fetchCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      logger.error("CSRFトークン取得失敗", {
        component: "api-client.ts",
        action: "fetchCSRFToken",
        meta: { status: response.status },
      });
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    logger.error("CSRFトークン取得中にエラー発生", {
      component: "api-client.ts",
      action: "fetchCSRFToken",
      error,
    });
    return null;
  }
}

/**
 * CSRFトークンを取得（Cookie または サーバーから）
 */
async function getCSRFToken(): Promise<string | null> {
  // まずCookieから取得を試みる
  let token = getCSRFTokenFromCookie();
  
  if (!token) {
    // Cookieにない場合はサーバーから取得
    token = await fetchCSRFToken();
  }

  return token;
}

/**
 * CSRF保護が必要なHTTPメソッドかチェック
 */
function isProtectedMethod(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

/**
 * CSRFトークンを含むヘッダーを作成
 */
async function createHeaders(
  method: string,
  customHeaders?: HeadersInit
): Promise<Headers> {
  const headers = new Headers(customHeaders);

  // Content-Type が未設定の場合はデフォルトで application/json を設定
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // CSRF保護が必要なメソッドの場合、トークンを付与
  if (isProtectedMethod(method)) {
    const token = await getCSRFToken();
    
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    } else {
      logger.warn("CSRFトークンが取得できませんでした", {
        component: "api-client.ts",
        action: "createHeaders",
        meta: { method },
      });
    }
  }

  return headers;
}

/**
 * APIリクエストのオプション型
 */
interface RequestOptions extends Omit<RequestInit, "method" | "body" | "headers"> {
  headers?: HeadersInit;
}

/**
 * API クライアント
 */
export const apiClient = {
  /**
   * GET リクエスト
   */
  async get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    const headers = await createHeaders("GET", options?.headers);

    const response = await fetch(url, {
      ...options,
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`GET ${url} failed with status ${response.status}`);
    }

    return response.json();
  },

  /**
   * POST リクエスト（CSRF保護あり）
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const headers = await createHeaders("POST", options?.headers);

    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    return response.json();
  },

  /**
   * PUT リクエスト（CSRF保護あり）
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const headers = await createHeaders("PUT", options?.headers);

    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`PUT ${url} failed with status ${response.status}`);
    }

    return response.json();
  },

  /**
   * DELETE リクエスト（CSRF保護あり）
   */
  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    const headers = await createHeaders("DELETE", options?.headers);

    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`DELETE ${url} failed with status ${response.status}`);
    }

    return response.json();
  },

  /**
   * PATCH リクエスト（CSRF保護あり）
   */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const headers = await createHeaders("PATCH", options?.headers);

    const response = await fetch(url, {
      ...options,
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`PATCH ${url} failed with status ${response.status}`);
    }

    return response.json();
  },
};
