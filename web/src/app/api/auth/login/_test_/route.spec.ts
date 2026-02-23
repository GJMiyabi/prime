import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import * as logger from '@/app/_lib/logger';

// Mock dependencies
jest.mock('next/server');
jest.mock('@/app/_lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('POST /api/auth/login', () => {
  const mockBackendUrl = 'http://localhost:4000/graphql';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = mockBackendUrl;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      configurable: true,
    });
  });

  const mockRequest = (body: unknown) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      cookies: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;
  };

  const mockNextResponse = (status: number, body: unknown) => {
    const response = {
      status,
      body,
      cookies: {
        set: jest.fn(),
      },
    };
    jest.mocked(NextResponse.json).mockReturnValue(response as unknown as NextResponse);
    return response;
  };

  describe('正常系', () => {
    it('正しいユーザー名とパスワードでログイン成功', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'mock-jwt-token',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        mockBackendUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        user: mockLoginResponse.data.login.user,
      });
    });

    it('JWTトークンをhttpOnly Cookieに設定', async () => {
      const mockToken = 'secure-jwt-token-123';
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: mockToken,
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const mockResp = mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(mockResp.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'access_token',
          value: mockToken,
          httpOnly: true,
        })
      );
    });

    it('本番環境ではsecure=trueを設定', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const mockResp = mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(mockResp.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
        })
      );
    });

    it('sameSite=laxを設定してCSRF対策', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const mockResp = mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(mockResp.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          sameSite: 'lax',
        })
      );
    });

    it('path=/を設定', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const mockResp = mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(mockResp.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/',
        })
      );
    });

    it('Cookie有効期限を24時間に設定', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      const mockResp = mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(mockResp.cookies.set).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAge: 60 * 60 * 24, // 24 hours
        })
      );
    });
  });

  describe('バリデーション', () => {
    it('ユーザー名が空の場合は400エラー', async () => {
      mockNextResponse(400, { error: 'ユーザー名とパスワードは必須です' });

      const request = mockRequest({
        username: '',
        password: 'password123',
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    });

    it('パスワードが空の場合は400エラー', async () => {
      mockNextResponse(400, { error: 'ユーザー名とパスワードは必須です' });

      const request = mockRequest({
        username: 'testuser',
        password: '',
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    });

    it('ユーザー名がnullの場合は400エラー', async () => {
      mockNextResponse(400, { error: 'ユーザー名とパスワードは必須です' });

      const request = mockRequest({
        username: null,
        password: 'password123',
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    });

    it('パスワードがundefinedの場合は400エラー', async () => {
      mockNextResponse(400, { error: 'ユーザー名とパスワードは必須です' });

      const request = mockRequest({
        username: 'testuser',
        password: undefined,
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    });
  });

  describe('異常系', () => {
    it('バックエンドAPIがエラーを返した場合は401エラー', async () => {
      const mockErrorResponse = {
        errors: [
          {
            message: 'ユーザー名またはパスワードが間違っています',
          },
        ],
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      } as unknown as Response);

      mockNextResponse(401, {
        error: 'ユーザー名またはパスワードが間違っています',
      });

      const request = mockRequest({
        username: 'wronguser',
        password: 'wrongpassword',
      });

      await POST(request);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'バックエンドログインエラー',
        expect.objectContaining({
          component: 'LoginAPI',
          action: 'POST',
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ユーザー名またはパスワードが間違っています' },
        { status: 401 }
      );
    });

    it('accessTokenが返されない場合は401エラー', async () => {
      const mockResponse = {
        data: {
          login: {
            accessToken: null,
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      mockNextResponse(401, { error: 'ログイン情報の取得に失敗しました' });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ログイン情報の取得に失敗しました' },
        { status: 401 }
      );
    });

    it('userが返されない場合は401エラー', async () => {
      const mockResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: null,
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      mockNextResponse(401, { error: 'ログイン情報の取得に失敗しました' });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'ログイン情報の取得に失敗しました' },
        { status: 401 }
      );
    });

    it('ネットワークエラーの場合は500エラー', async () => {
      const mockError = new Error('Network error');
      jest.mocked(global.fetch).mockRejectedValueOnce(mockError);

      mockNextResponse(500, { error: 'サーバーエラーが発生しました' });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'ログインAPIでエラーが発生',
        expect.objectContaining({
          component: 'LoginAPI',
          action: 'POST',
          error: mockError,
        })
      );

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    });
  });

  describe('GraphQLリクエスト', () => {
    it('正しいGraphQL mutationを送信', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        mockBackendUrl,
        expect.objectContaining({
          body: expect.stringContaining('mutation Login'),
        })
      );
    });

    it('変数に正しいusernameとpasswordを設定', async () => {
      const mockLoginResponse = {
        data: {
          login: {
            accessToken: 'token-123',
            user: {
              id: 'user-1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER',
              principalId: 'principal-1',
            },
          },
        },
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      } as unknown as Response);

      mockNextResponse(200, {
        success: true,
        user: mockLoginResponse.data.login.user,
      });

      const request = mockRequest({
        username: 'testuser',
        password: 'password123',
      });

      await POST(request);

      const fetchCall = jest.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.variables).toEqual({
        username: 'testuser',
        password: 'password123',
      });
    });
  });
});
