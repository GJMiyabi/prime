import { middleware, config } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';
import * as csrfServer from '@/app/_lib/csrf.server';

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      type: 'json',
      body,
      status: init?.status || 200,
    })),
  },
}));

jest.mock('@/app/_lib/csrf.server', () => ({
  isCSRFProtectedMethod: jest.fn(),
  verifyCSRFToken: jest.fn(),
  CSRF_HEADER_NAME: 'x-csrf-token',
}));

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (url: string, method: string = 'GET') => {
    return {
      nextUrl: new URL(url, 'http://localhost:3000'),
      method,
      headers: new Headers(),
    } as NextRequest;
  };

  describe('安全なメソッド（CSRF保護不要）', () => {
    it('GETリクエストは検証せずに通過', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(false);

      const request = createRequest('/api/some-endpoint', 'GET');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('GET');
      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('HEADリクエストは検証せずに通過', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(false);

      const request = createRequest('/api/some-endpoint', 'HEAD');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('HEAD');
      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('OPTIONSリクエストは検証せずに通過', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(false);

      const request = createRequest('/api/some-endpoint', 'OPTIONS');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('OPTIONS');
      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('CSRF除外パス', () => {
    it('/api/auth/csrf はCSRF検証をスキップ', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/api/auth/csrf', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('/api/auth/login はCSRF検証をスキップ', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/api/auth/login', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('/api/auth/login/subpath もCSRF検証をスキップ（startsWithマッチ）', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/api/auth/login/subpath', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('CSRF保護が必要なリクエスト', () => {
    it('POSTリクエストはCSRF検証を実施（成功）', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/protected-endpoint', 'POST');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('POST');
      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('PUTリクエストはCSRF検証を実施（成功）', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/protected-endpoint', 'PUT');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('PUT');
      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('DELETEリクエストはCSRF検証を実施（成功）', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/protected-endpoint', 'DELETE');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('DELETE');
      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('PATCHリクエストはCSRF検証を実施（成功）', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/protected-endpoint', 'PATCH');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('PATCH');
      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('CSRF検証失敗', () => {
    it('CSRF検証失敗時は403エラーを返す', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(false);

      const request = createRequest('/api/protected-endpoint', 'POST');
      const response = await middleware(request);

      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'CSRF検証に失敗しました',
          message: 'Invalid CSRF token',
        }),
        { status: 403 }
      );
      expect(response).toEqual(
        expect.objectContaining({
          type: 'json',
          status: 403,
        })
      );
    });

    it('CSRF検証失敗時のエラーメッセージにヒントを含む', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(false);

      const request = createRequest('/api/protected-endpoint', 'POST');
      await middleware(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          hint: 'CSRFトークンを取得して x-csrf-token ヘッダーに含めてください',
        }),
        { status: 403 }
      );
    });

    it('異なるAPIエンドポイントでもCSRF検証失敗時は403', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(false);

      const request = createRequest('/api/users/create', 'POST');
      const response = await middleware(request);

      expect(response).toEqual(
        expect.objectContaining({
          status: 403,
        })
      );
    });
  });

  describe('APIエンドポイント以外', () => {
    it('非APIパス（/）はCSRF検証をスキップ', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('非APIパス（/login）はCSRF検証をスキップ', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/login', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('非APIパス（/person/123）はCSRF検証をスキップ', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/person/123', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('空のパス（/api）は検証対象外', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);

      const request = createRequest('/api', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('/api/ で終わるパスもAPIとして扱う', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/', 'POST');
      await middleware(request);

      expect(csrfServer.verifyCSRFToken).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('大文字小文字が混在したメソッドも正しく処理', async () => {
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);

      const request = createRequest('/api/test', 'PoSt');
      await middleware(request);

      expect(csrfServer.isCSRFProtectedMethod).toHaveBeenCalledWith('PoSt');
    });
  });

  describe('複数のシナリオ', () => {
    it('GET → POST → GET の順でリクエストを処理', async () => {
      // GET: 検証不要
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(false);
      const getRequest = createRequest('/api/data', 'GET');
      await middleware(getRequest);
      expect(NextResponse.next).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // POST: 検証必要（成功）
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(true);
      jest.mocked(csrfServer.verifyCSRFToken).mockResolvedValue(true);
      const postRequest = createRequest('/api/data', 'POST');
      await middleware(postRequest);
      expect(NextResponse.next).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // GET: 検証不要
      jest.mocked(csrfServer.isCSRFProtectedMethod).mockReturnValue(false);
      const getRequest2 = createRequest('/api/data', 'GET');
      await middleware(getRequest2);
      expect(NextResponse.next).toHaveBeenCalledTimes(1);
    });
  });
});

describe('middleware config', () => {
  it('matcher が正しく設定されている', () => {
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it('静的ファイルを除外するパターンが含まれる', () => {
    const pattern = config.matcher[0];
    expect(pattern).toContain('_next/static');
    expect(pattern).toContain('_next/image');
    expect(pattern).toContain('favicon.ico');
  });
});
