/**
 * 入力サニタイゼーションユーティリティ
 * XSS攻撃対策として、ユーザー入力から危険なコンテンツを除去
 * 
 * DOMPurifyを使用してHTML/Script タグを安全に除去・エスケープ
 */

import DOMPurify from "dompurify";
import { logger } from "./logger";

/**
 * サニタイゼーション設定
 */
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [] as string[], // HTMLタグを一切許可しない
  ALLOWED_ATTR: [] as string[], // 属性も許可しない
  KEEP_CONTENT: true, // タグは削除するが内容は保持
};

/**
 * 文字列をサニタイズ
 * XSS攻撃対策として危険なコンテンツを除去
 * 
 * @param input - サニタイズする文字列
 * @param config - DOMPurify設定（オプション）
 * @returns サニタイズされた文字列
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeInput(userInput);
 * // => 'Hello'
 * ```
 */
export function sanitizeInput(
  input: string,
  config: typeof DEFAULT_CONFIG = DEFAULT_CONFIG
): string {
  if (!input) return input;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized = String(DOMPurify.sanitize(input, config as any));

  // サニタイゼーションで変更があった場合はログに記録
  if (sanitized !== input) {
    logger.warn("入力がサニタイズされました", {
      component: "sanitize.ts",
      action: "sanitizeInput",
      meta: {
        original: input.substring(0, 50),
        sanitized: sanitized.substring(0, 50),
      },
    });
  }

  return sanitized;
}

/**
 * オブジェクトの文字列フィールドをすべてサニタイズ
 * 
 * @param obj - サニタイズするオブジェクト
 * @returns サニタイズされたオブジェクト
 * 
 * @example
 * ```typescript
 * const userInput = {
 *   name: '<script>alert("XSS")</script>John',
 *   email: 'john@example.com',
 *   age: 30
 * };
 * const safe = sanitizeObject(userInput);
 * // => { name: 'John', email: 'john@example.com', age: 30 }
 * ```
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeInput(item)
          : typeof item === "object" && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return sanitized as T;
}

/**
 * HTMLを安全に表示するためのサニタイゼーション
 * 一部のHTMLタグ（<b>, <i>, <p>など）を許可
 * 
 * @param html - サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 * 
 * @example
 * ```typescript
 * const userHtml = '<p>Hello <script>alert("XSS")</script></p>';
 * const safe = sanitizeHtml(userHtml);
 * // => '<p>Hello </p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  const config = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "span"] as string[],
    ALLOWED_ATTR: ["class"] as string[],
    KEEP_CONTENT: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return String(DOMPurify.sanitize(html, config as any));
}

/**
 * URLをサニタイズ
 * javascript:, data:, vbscript: などの危険なプロトコルを除去
 * 
 * @param url - サニタイズするURL
 * @returns サニタイズされたURL（危険な場合は空文字列）
 * 
 * @example
 * ```typescript
 * const dangerousUrl = 'javascript:alert("XSS")';
 * const safe = sanitizeUrl(dangerousUrl);
 * // => ''
 * 
 * const safeUrl = 'https://example.com';
 * const result = sanitizeUrl(safeUrl);
 * // => 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url)) {
    logger.warn("危険なURLが検出されました", {
      component: "sanitize.ts",
      action: "sanitizeUrl",
      meta: { url },
    });
    return "";
  }

  return url;
}
