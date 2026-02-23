import { POST } from '../route';
import { NextResponse } from 'next/server';
import * as logger from '@/app/_lib/logger';

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => {
      const mockCookies = new Map<string, unknown>();
      return {
        status: init?.status || 200,
        body,
        cookies: {
          set: jest.fn((cookie: unknown) => {
            mockCookies.set('access_token', cookie);
          }),
        },
      };
    }),
  },
}));

jest.mock('@/app/_lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NODE_ENV for each test
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      configurable: true,
    });
  });

  describe('正常系', () => {
    it('ログアウト成功レスポンスを返す', async () => {
      const response = await POST();

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'ログアウトしました',
      });
      expect(response).toBeDefined();
    });

    it('access_token Cookieを削除する', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'access_token',
          value: '',
          maxAge: 0,
        })
      );
    });

    it('Cookie削除時にhttpOnly=trueを設定', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('Cookie削除時にsameSite=laxを設定', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          sameSite: 'lax',
        })
      );
    });

    it('Cookie削除時にpath=/を設定', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/',
        })
      );
    });

    it('開発環境ではsecure=falseを設定', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: false,
        })
      );
    });

    it('本番環境ではsecure=trueを設定', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
        })
      );
    });

    it('logger.infoでログアウト成功を記録', async () => {
      await POST();

      expect(logger.logger.info).toHaveBeenCalledWith(
        'ログアウト成功',
        expect.objectContaining({
          component: 'LogoutAPI',
          action: 'POST',
        })
      );
    });
  });

  describe('異常系', () => {
    it('予期しないエラーが発生した場合は500エラー', async () => {
      const mockError = new Error('Unexpected error');

      // NextResponse.json が throw するようにモック
      jest.mocked(NextResponse.json).mockImplementationOnce(() => {
        throw mockError;
      });

      const response = await POST();

      expect(logger.logger.error).toHaveBeenCalledWith(
        'ログアウトAPIでエラーが発生',
        expect.objectContaining({
          component: 'LogoutAPI',
          action: 'POST',
          error: mockError,
        })
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'ログアウトに失敗しました' });
    });
  });

  describe('Cookie設定', () => {
    it('maxAge=0で即座にCookieを削除', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAge: 0,
        })
      );
    });

    it('valueを空文字列に設定', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '',
        })
      );
    });

    it('Cookie nameがaccess_token', async () => {
      const response = await POST();

      expect(response.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'access_token',
        })
      );
    });
  });

  describe('レスポンス形式', () => {
    it('success: trueを含むレスポンス', async () => {
      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('messageを含むレスポンス', async () => {
      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it('messageが"ログアウトしました"', async () => {
      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ログアウトしました',
        })
      );
    });
  });
});
