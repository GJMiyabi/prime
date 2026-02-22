/**
 * CSRF保護をスキップするためのデコレーター
 * ログインなど、初回アクセスでCSRFトークンがまだ取得できない場合に使用
 * 
 * 使用例:
 * ```typescript
 * @Mutation('login')
 * @SkipCsrf()
 * async login(@Args('input') input: LoginInput) {
 *   return this.auth.login(input.username, input.password);
 * }
 * ```
 */

import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_KEY = 'skipCsrf';
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
