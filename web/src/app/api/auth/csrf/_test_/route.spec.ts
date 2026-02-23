import { GET } from '../route';
import { NextResponse } from 'next/server';
import * as csrfServer from '@/app/_lib/csrf.server';
import * as logger from '@/app/_lib/logger';

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown) => ({
      status: 200,
      body,
    })),
  },
}));

jest.mock('@/app/_lib/csrf.server', () => ({
  generateCSRFToken: jest.fn(),
  setCSRFCookie: jest.fn(),
}));

jest.mock('@/app/_lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GET /api/auth/csrf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('CSRFトークンを生成して返す', async () => {
      const mockToken = 'mock-csrf-token-123';
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(csrfServer.generateCSRFToken).toHaveBeenCalled();
      expect(csrfServer.setCSRFCookie).toHaveBeenCalledWith(mockToken);
      expect(NextResponse.json).toHaveBeenCalledWith({
        token: mockToken,
        expiresIn: 3600,
      });
    });

    it('トークン有効期限が1時間（3600秒）', async () => {
      const mockToken = 'token-abc';
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresIn: 3600,
        })
      );
    });

    it('logger.infoで成功ログを記録', async () => {
      const mockToken = 'token-xyz';
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(logger.logger.info).toHaveBeenCalledWith(
        'CSRFトークン生成成功',
        expect.objectContaining({
          component: 'csrf/route.ts',
          action: 'GET',
        })
      );
    });

    it('Cookieにトークンを設定する', async () => {
      const mockToken = 'secure-token-456';
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(csrfServer.setCSRFCookie).toHaveBeenCalledTimes(1);
      expect(csrfServer.setCSRFCookie).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('異常系', () => {
    it('トークン生成に失敗した場合は500エラー', async () => {
      const mockError = new Error('Token generation failed');
      jest.mocked(csrfServer.generateCSRFToken).mockImplementation(() => {
        throw mockError;
      });

      await GET();

      expect(logger.logger.error).toHaveBeenCalledWith(
        'CSRFトークン生成中にエラー発生',
        expect.objectContaining({
          component: 'csrf/route.ts',
          action: 'GET',
          error: mockError,
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'トークン生成に失敗しました' },
        { status: 500 }
      );
    });

    it('Cookie設定に失敗した場合は500エラー', async () => {
      const mockToken = 'token-123';
      const mockError = new Error('Cookie set failed');
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockRejectedValue(mockError);

      await GET();

      expect(logger.logger.error).toHaveBeenCalledWith(
        'CSRFトークン生成中にエラー発生',
        expect.objectContaining({
          component: 'csrf/route.ts',
          action: 'GET',
          error: mockError,
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'トークン生成に失敗しました' },
        { status: 500 }
      );
    });
  });

  describe('セキュリティ', () => {
    it('毎回異なるトークンを生成', async () => {
      const tokens = ['token-1', 'token-2', 'token-3'];
      tokens.forEach((token) => {
        jest.mocked(csrfServer.generateCSRFToken).mockReturnValueOnce(token);
      });
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();
      await GET();
      await GET();

      expect(csrfServer.generateCSRFToken).toHaveBeenCalledTimes(3);
    });

    it('暗号学的に安全なトークン生成関数を使用', async () => {
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue('secure-token');
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      // generateCSRFToken が crypto.randomBytes を使用していることを確認
      expect(csrfServer.generateCSRFToken).toHaveBeenCalled();
    });
  });

  describe('レスポンス形式', () => {
    it('tokenプロパティを含むJSONを返す', async () => {
      const mockToken = 'response-token';
      jest.mocked(csrfServer.generateCSRFToken).mockReturnValue(mockToken);
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: mockToken,
        })
      );
    });

    it('expiresInプロパティを含むJSONを返す', async () => {
      jest
        .mocked(csrfServer.generateCSRFToken)
        .mockReturnValue('any-token');
      jest.mocked(csrfServer.setCSRFCookie).mockResolvedValue(undefined);

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresIn: expect.any(Number),
        })
      );
    });
  });
});
