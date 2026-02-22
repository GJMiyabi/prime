/**
 * 入力サニタイゼーション Pipe
 * XSS攻撃対策として、HTML/Script タグを除去・エスケープ
 *
 * 使用例:
 * ```typescript
 * @Mutation('createPerson')
 * async createPerson(@Args('input', SanitizationPipe) input: PersonInput) {
 *   // input は既にサニタイズ済み
 * }
 * ```
 */

import { Injectable, PipeTransform, Logger } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  private readonly logger = new Logger(SanitizationPipe.name);

  transform(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    // プリミティブ型の処理
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    // 配列の処理
    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item));
    }

    // オブジェクトの処理
    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.transform(val);
      }
      return sanitized;
    }

    // その他の型はそのまま返す
    return value;
  }

  /**
   * 文字列をサニタイズ
   * XSS攻撃対策として以下を実施：
   * 1. HTMLタグの除去
   * 2. 特殊文字のエスケープ
   * 3. スクリプトタグの完全除去
   */
  private sanitizeString(input: string): string {
    let sanitized = input;

    // 1. <script> タグを完全除去（大文字小文字区別なし）
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '',
    );

    // 2. HTMLタグを除去（ホワイトリスト方式）
    // 許可するタグ: なし（すべて除去）
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // 3. 危険な文字列パターンを除去
    const dangerousPatterns = [
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick=, onload= など
      /vbscript:/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // 4. HTMLエンティティのエスケープ
    sanitized = this.escapeHtml(sanitized);

    // 5. SQLインジェクション対策（追加の防御層）
    sanitized = this.escapeSql(sanitized);

    // 6. 変更があった場合はログに記録
    if (sanitized !== input) {
      this.logger.warn('Input sanitized', {
        original: input.substring(0, 50),
        sanitized: sanitized.substring(0, 50),
      });
    }

    return sanitized;
  }

  /**
   * HTMLエンティティのエスケープ
   */
  private escapeHtml(text: string): string {
    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
  }

  /**
   * SQLインジェクション対策（追加の防御層）
   * Prismaが基本的に対策しているが、念のため
   */
  private escapeSql(text: string): string {
    // シングルクォートをエスケープ
    return text.replace(/'/g, "''");
  }
}
