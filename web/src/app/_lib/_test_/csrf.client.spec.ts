import {
  getCSRFTokenFromCookie,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../csrf.client';

describe('csrf.client', () => {
  beforeEach(() => {
    // document.cookie をクリア
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('CSRF定数', () => {
    it('CSRF_COOKIE_NAMEが正しく定義されている', () => {
      expect(CSRF_COOKIE_NAME).toBe('csrf_token');
    });

    it('CSRF_HEADER_NAMEが正しく定義されている', () => {
      expect(CSRF_HEADER_NAME).toBe('x-csrf-token');
    });
  });

  describe('getCSRFTokenFromCookie', () => {
    it('Cookieが存在しない場合はnullを返す', () => {
      const token = getCSRFTokenFromCookie();

      expect(token).toBeNull();
    });

    it('CSRFトークンが存在する場合は値を返す', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf_token=abc123; other_cookie=value',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe('abc123');
    });

    it('複数のCookieがある場合でも正しく取得', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'session=xyz; csrf_token=token456; user=admin',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe('token456');
    });

    it('CSRFトークンが空文字の場合は空文字を返す', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf_token=',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe('');
    });

    it('CSRFトークンに特殊文字が含まれる場合も正しく取得', () => {
      const specialToken = 'abc-123_456.789';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `csrf_token=${specialToken}`,
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe(specialToken);
    });

    it('Base64URLエンコードされたトークンを正しく取得', () => {
      const base64Token = 'abcDEF123-_456';
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `other=value; csrf_token=${base64Token}; another=test`,
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe(base64Token);
    });

    it('Cookieの値に=が含まれる場合は最初の=で分割', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf_token=abc=def=ghi',
      });

      const token = getCSRFTokenFromCookie();

      // split('=')[1] なので、最初の=の後だけ取得される
      expect(token).toBe('abc');
    });

    it('空白を含むCookieでも正しく分割', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf_token=token123; session=xyz; user=admin',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe('token123');
    });

    it('Cookie名が部分一致する場合は正確に判定', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'my_csrf_token=wrong; csrf_token=correct; csrf_token_backup=also_wrong',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe('correct');
    });

    it('サーバーサイドレンダリング環境（documentがundefined）ではnullを返す', () => {
      const originalDocument = global.document;
      
      // @ts-expect-error - Testing document undefined case
      delete global.document;

      const token = getCSRFTokenFromCookie();

      expect(token).toBeNull();

      // 復元
      global.document = originalDocument;
    });
  });

  describe('エッジケース', () => {
    it('Cookieが"csrf_token"のみの場合（値なし）', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf_token',
      });

      const token = getCSRFTokenFromCookie();

      // startsWith("csrf_token=")にマッチしないのでnull
      expect(token).toBeNull();
    });

    it('非常に長いトークンでも正しく取得', () => {
      const longToken = 'a'.repeat(1000);
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `csrf_token=${longToken}`,
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBe(longToken);
      expect(token?.length).toBe(1000);
    });

    it('Cookieが空文字の場合はnullを返す', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBeNull();
    });

    it('セミコロンのみのCookieの場合', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: ';;;',
      });

      const token = getCSRFTokenFromCookie();

      expect(token).toBeNull();
    });
  });
});
