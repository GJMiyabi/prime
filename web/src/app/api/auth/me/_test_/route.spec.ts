import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import * as logger from '@/app/_lib/logger';

// Mock dependencies
jest.mock('next/server');
jest.mock('jwt-decode');
jest.mock('@/app/_lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (token?: string) => {
    return {
      cookies: {
        get: jest.fn((name: string) => {
          if (name === 'access_token' && token) {
            return { value: token };
          }
          return undefined;
        }),
      },
    } as unknown as NextRequest;
  };

  const mockNextResponse = (status: number, body: unknown) => {
    const response = { status, body };
    jest.mocked(NextResponse.json).mockReturnValue(response as unknown as NextResponse);
    return response;
  };

  describe('正常系', () => {
    it('有効なトークンでユーザー情報を返す', async () => {
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: mockDecodedToken.accountId,
          username: mockDecodedToken.username,
          email: mockDecodedToken.email,
          role: mockDecodedToken.role,
          principalId: mockDecodedToken.sub,
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(jwtDecode).toHaveBeenCalledWith('valid-jwt-token');
      expect(NextResponse.json).toHaveBeenCalledWith({
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });
    });

    it('emailがない場合はusernameからデフォルトメールを生成', async () => {
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: undefined,
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'testuser@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: 'testuser@example.com',
        }),
      });
    });

    it('ユーザーIDをaccountIdから取得', async () => {
      const mockDecodedToken = {
        accountId: 'unique-account-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'unique-account-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'unique-account-id',
        }),
      });
    });

    it('principalIdをsubから取得', async () => {
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'unique-principal-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'unique-principal-id',
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          principalId: 'unique-principal-id',
        }),
      });
    });
  });

  describe('認証エラー', () => {
    it('トークンがない場合は401エラー', async () => {
      mockNextResponse(401, { error: '認証されていません' });

      const request = mockRequest();

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '認証されていません' },
        { status: 401 }
      );
    });

    it('トークンが空文字列の場合は401エラー', async () => {
      mockNextResponse(401, { error: '認証されていません' });

      const request = mockRequest('');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '認証されていません' },
        { status: 401 }
      );
    });

    it('トークンの有効期限が切れている場合は401エラー', async () => {
      const mockExpiredToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      };

      jest.mocked(jwtDecode).mockReturnValue(mockExpiredToken);

      mockNextResponse(401, { error: 'トークンの有効期限が切れています' });

      const request = mockRequest('expired-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'トークンの有効期限が切れています' },
        { status: 401 }
      );
    });

    it('無効なトークンの場合は401エラー', async () => {
      jest.mocked(jwtDecode).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockNextResponse(401, { error: '無効なトークンです' });

      const request = mockRequest('invalid-jwt-token');

      await GET(request);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'JWTデコードエラー',
        expect.objectContaining({
          component: 'MeAPI',
          action: 'GET',
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '無効なトークンです' },
        { status: 401 }
      );
    });

    it('トークンフォーマットが不正な場合は401エラー', async () => {
      jest.mocked(jwtDecode).mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      mockNextResponse(401, { error: '無効なトークンです' });

      const request = mockRequest('malformed.token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '無効なトークンです' },
        { status: 401 }
      );
    });
  });

  describe('トークン有効期限チェック', () => {
    it('有効期限が現在時刻より後の場合は成功', async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: now,
        exp: now + 3600, // 1 hour from now
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('有効期限が現在時刻と同じ場合は成功（境界値）', async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: now - 3600,
        exp: now, // exactly now (still valid because check is exp < now)
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
        })
      );
    });
  });

  describe('レスポンス形式', () => {
    it('userオブジェクトを含むレスポンス', async () => {
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
        })
      );
    });

    it('userに必須フィールドが全て含まれる', async () => {
      const mockDecodedToken = {
        accountId: 'account-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        sub: 'principal-1',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jest.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockNextResponse(200, {
        user: {
          id: 'account-1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
          principalId: 'principal-1',
        },
      });

      const request = mockRequest('valid-jwt-token');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
          principalId: expect.any(String),
        }),
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーが発生した場合は500エラー', async () => {
      const mockError = new Error('Unexpected error');

      // request.cookies.get が throw するようにモック
      const request = {
        cookies: {
          get: jest.fn(() => {
            throw mockError;
          }),
        },
      } as unknown as NextRequest;

      mockNextResponse(500, { error: 'サーバーエラーが発生しました' });

      await GET(request);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'ユーザー情報取得APIでエラーが発生',
        expect.objectContaining({
          component: 'MeAPI',
          action: 'GET',
          error: mockError,
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    });
  });
});
