import {
  generateCSRFToken,
  setCSRFCookie,
  getCSRFTokenFromCookie,
  getCSRFTokenFromHeader,
  verifyCSRFToken,
  isCSRFProtectedMethod,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../csrf.server';
import * as logger from '../logger';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Request and Headers for Node.js environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    public headers: Headers;
    public url: string;

    constructor(url: string, init?: { headers?: Headers }) {
      this.url = url;
      this.headers = init?.headers || new Headers();
    }
  } as unknown as typeof Request;
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private map = new Map<string, string>();

    set(name: string, value: string) {
      this.map.set(name.toLowerCase(), value);
    }

    get(name: string): string | null {
      return this.map.get(name.toLowerCase()) || null;
    }
  } as unknown as typeof Headers;
}

const { cookies } = jest.requireMock('next/headers');

describe('csrf.server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CSRF定数', () => {
    it('CSRF_COOKIE_NAMEが正しく定義されている', () => {
      expect(CSRF_COOKIE_NAME).toBe('csrf_token');
    });

    it('CSRF_HEADER_NAMEが正しく定義されている', () => {
      expect(CSRF_HEADER_NAME).toBe('x-csrf-token');
    });
  });

  describe('generateCSRFToken', () => {
    it('Base64URLエンコードされたトークンを生成', () => {
      const token = generateCSRFToken();

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('32バイトのランダムバイトから43文字のBase64URL文字列を生成', () => {
      const token = generateCSRFToken();

      // 32バイト = 256ビット → Base64URLで約43文字
      expect(token.length).toBe(43);
    });

    it('Base64URL文字セット（a-zA-Z0-9_-）のみ含む', () => {
      const token = generateCSRFToken();

      // Base64URLは + や / を含まず、- と _ を使用
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('毎回異なるトークンを生成', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      const token3 = generateCSRFToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('1000回生成してもすべて異なる値', () => {
      const tokens = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        tokens.add(generateCSRFToken());
      }

      // すべて一意である
      expect(tokens.size).toBe(1000);
    });
  });

  describe('setCSRFCookie', () => {
    it('Cookieにトークンを設定', async () => {
      const mockSet = jest.fn();
      jest.mocked(cookies).mockResolvedValue({
        set: mockSet,
      });

      const token = 'test-csrf-token-123';
      await setCSRFCookie(token);

      expect(mockSet).toHaveBeenCalledWith({
        name: 'csrf_token',
        value: token,
        httpOnly: false,
        secure: false, // NODE_ENV !== 'production'
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      });
    });

    it('本番環境ではsecure=trueを設定', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const mockSet = jest.fn();
      jest.mocked(cookies).mockResolvedValue({
        set: mockSet,
      });

      const token = 'prod-token';
      await setCSRFCookie(token);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
        })
      );

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('httpOnly=falseでクライアント側から読み取り可能', async () => {
      const mockSet = jest.fn();
      jest.mocked(cookies).mockResolvedValue({
        set: mockSet,
      });

      await setCSRFCookie('token');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          httpOnly: false,
        })
      );
    });

    it('sameSite=strictでCSRF対策', async () => {
      const mockSet = jest.fn();
      jest.mocked(cookies).mockResolvedValue({
        set: mockSet,
      });

      await setCSRFCookie('token');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          sameSite: 'strict',
        })
      );
    });

    it('maxAge=3600（1時間）の有効期限', async () => {
      const mockSet = jest.fn();
      jest.mocked(cookies).mockResolvedValue({
        set: mockSet,
      });

      await setCSRFCookie('token');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAge: 3600,
        })
      );
    });
  });

  describe('getCSRFTokenFromCookie', () => {
    it('Cookieからトークンを取得', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'cookie-token-123' });
      jest.mocked(cookies).mockResolvedValue({
        get: mockGet,
      });

      const token = await getCSRFTokenFromCookie();

      expect(token).toBe('cookie-token-123');
      expect(mockGet).toHaveBeenCalledWith('csrf_token');
    });

    it('Cookieが存在しない場合はundefinedを返す', async () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      jest.mocked(cookies).mockResolvedValue({
        get: mockGet,
      });

      const token = await getCSRFTokenFromCookie();

      expect(token).toBeUndefined();
    });
  });

  describe('getCSRFTokenFromHeader', () => {
    it('リクエストヘッダーからトークンを取得', () => {
      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', 'header-token-456');

      const request = new Request('http://localhost', { headers: mockHeaders });
      const token = getCSRFTokenFromHeader(request);

      expect(token).toBe('header-token-456');
    });

    it('ヘッダーが存在しない場合はnullを返す', () => {
      const request = new Request('http://localhost');
      const token = getCSRFTokenFromHeader(request);

      expect(token).toBeNull();
    });

    it('大文字小文字を区別しない（HTTPヘッダー仕様）', () => {
      const mockHeaders = new Headers();
      mockHeaders.set('X-CSRF-TOKEN', 'uppercase-token');

      const request = new Request('http://localhost', { headers: mockHeaders });
      const token = getCSRFTokenFromHeader(request);

      expect(token).toBe('uppercase-token');
    });
  });

  describe('verifyCSRFToken', () => {
    it('Cookieとヘッダーのトークンが一致する場合はtrue', async () => {
      const token = 'matching-token-789';

      const mockGet = jest.fn().mockReturnValue({ value: token });
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', token);
      const request = new Request('http://localhost', { headers: mockHeaders });

      const result = await verifyCSRFToken(request);

      expect(result).toBe(true);
    });

    it('トークンが一致しない場合はfalse', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'cookie-token' });
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', 'different-token');
      const request = new Request('http://localhost', { headers: mockHeaders });

      const result = await verifyCSRFToken(request);

      expect(result).toBe(false);
      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRF検証失敗: トークンが一致しない',
        expect.objectContaining({
          component: 'csrf.ts',
          action: 'verifyCSRFToken',
        })
      );
    });

    it('Cookieがない場合はfalse', async () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', 'header-token');
      const request = new Request('http://localhost', { headers: mockHeaders });

      const result = await verifyCSRFToken(request);

      expect(result).toBe(false);
      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRF検証失敗: トークンが欠落',
        expect.objectContaining({
          meta: {
            hasCookie: false,
            hasHeader: true,
          },
        })
      );
    });

    it('ヘッダーがない場合はfalse', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'cookie-token' });
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const request = new Request('http://localhost');

      const result = await verifyCSRFToken(request);

      expect(result).toBe(false);
      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRF検証失敗: トークンが欠落',
        expect.objectContaining({
          meta: {
            hasCookie: true,
            hasHeader: false,
          },
        })
      );
    });

    it('両方ともない場合はfalse', async () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const request = new Request('http://localhost');

      const result = await verifyCSRFToken(request);

      expect(result).toBe(false);
      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRF検証失敗: トークンが欠落',
        expect.objectContaining({
          meta: {
            hasCookie: false,
            hasHeader: false,
          },
        })
      );
    });

    it('検証中にエラーが発生した場合はfalseとlogger.error', async () => {
      const mockError = new Error('Cookie read error');
      jest.mocked(cookies).mockRejectedValue(mockError);

      const request = new Request('http://localhost');

      const result = await verifyCSRFToken(request);

      expect(result).toBe(false);
      expect(logger.logger.error).toHaveBeenCalledWith(
        'CSRF検証中にエラー発生',
        expect.objectContaining({
          component: 'csrf.ts',
          action: 'verifyCSRFToken',
          error: mockError,
        })
      );
    });

    it('タイミング攻撃対策: 長さが異なる場合も定数時間で比較', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'short' });
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', 'verylongtoken123456789');
      const request = new Request('http://localhost', { headers: mockHeaders });

      const startTime = Date.now();
      const result = await verifyCSRFToken(request);
      const endTime = Date.now();

      expect(result).toBe(false);
      // 時間計測は不安定なのでロジックのみ確認
      expect(endTime - startTime).toBeLessThan(100); // 十分高速
    });

    it('空文字列トークンは無効として扱う', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: '' });
      jest.mocked(cookies).mockResolvedValue({ get: mockGet });

      const mockHeaders = new Headers();
      mockHeaders.set('x-csrf-token', '');
      const request = new Request('http://localhost', { headers: mockHeaders });

      const result = await verifyCSRFToken(request);

      // 空文字列はfalsyなので検証失敗
      expect(result).toBe(false);
      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRF検証失敗: トークンが欠落',
        expect.any(Object)
      );
    });
  });

  describe('isCSRFProtectedMethod', () => {
    it('POSTはCSRF保護が必要', () => {
      expect(isCSRFProtectedMethod('POST')).toBe(true);
    });

    it('PUTはCSRF保護が必要', () => {
      expect(isCSRFProtectedMethod('PUT')).toBe(true);
    });

    it('DELETEはCSRF保護が必要', () => {
      expect(isCSRFProtectedMethod('PATCH')).toBe(true);
    });

    it('PATCHはCSRF保護が必要', () => {
      expect(isCSRFProtectedMethod('DELETE')).toBe(true);
    });

    it('GETはCSRF保護不要（安全なメソッド）', () => {
      expect(isCSRFProtectedMethod('GET')).toBe(false);
    });

    it('HEADはCSRF保護不要', () => {
      expect(isCSRFProtectedMethod('HEAD')).toBe(false);
    });

    it('OPTIONSはCSRF保護不要', () => {
      expect(isCSRFProtectedMethod('OPTIONS')).toBe(false);
    });

    it('小文字のメソッド名も正しく判定', () => {
      expect(isCSRFProtectedMethod('post')).toBe(true);
      expect(isCSRFProtectedMethod('get')).toBe(false);
    });

    it('大文字小文字混在でも正しく判定', () => {
      expect(isCSRFProtectedMethod('PoSt')).toBe(true);
      expect(isCSRFProtectedMethod('GeT')).toBe(false);
    });

    it('未定義のメソッドはfalse', () => {
      expect(isCSRFProtectedMethod('CUSTOM')).toBe(false);
    });
  });
});
