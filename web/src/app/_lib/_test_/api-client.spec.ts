import { apiClient } from '../api-client';
import * as csrfClient from '../csrf.client';
import * as logger from '../logger';

// Mock fetch
global.fetch = jest.fn();

// Mock CSRF client
jest.mock('../csrf.client', () => ({
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  getCSRFTokenFromCookie: jest.fn(),
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('apiClient', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('GETリクエストを正しく実行する', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get('/api/test');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('レスポンスがokでない場合はエラーをスロー', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(apiClient.get('/api/test')).rejects.toThrow(
        'GET /api/test failed with status 404'
      );
    });

    it('カスタムヘッダーを含めることができる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.get('/api/test', {
        headers: { 'X-Custom': 'value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('post', () => {
    it('POSTリクエストを正しく実行する', async () => {
      const mockToken = 'test-csrf-token';
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(mockToken);

      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const body = { name: 'Test' };
      const result = await apiClient.post('/api/test', body);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          credentials: 'include',
        })
      );
    });

    it('CSRFトークンがCookieにない場合はサーバーから取得する', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(null);

      // CSRF取得エンドポイントのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'server-csrf-token' }),
      } as Response);

      // 実際のPOSTリクエストのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await apiClient.post('/api/test', { name: 'Test' });

      // CSRF取得とPOSTリクエストの2回呼ばれる
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/csrf', {
        method: 'GET',
        credentials: 'include',
      });
    });

    it('CSRFトークン取得に失敗した場合は警告を出す', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(null);

      // CSRF取得エンドポイントが失敗
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      // 実際のPOSTリクエストのモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await apiClient.post('/api/test', { name: 'Test' });

      expect(logger.logger.error).toHaveBeenCalledWith(
        'CSRFトークン取得失敗',
        expect.objectContaining({
          component: 'api-client.ts',
          action: 'fetchCSRFToken',
        })
      );

      expect(logger.logger.warn).toHaveBeenCalledWith(
        'CSRFトークンが取得できませんでした',
        expect.any(Object)
      );
    });

    it('レスポンスがokでない場合はエラーをスロー', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue('token');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      } as Response);

      await expect(apiClient.post('/api/test', {})).rejects.toThrow(
        'POST /api/test failed with status 400'
      );
    });

    it('bodyがundefinedの場合は空のbodyを送信する', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue('token');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.post('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('put', () => {
    it('PUTリクエストを正しく実行する', async () => {
      const mockToken = 'test-csrf-token';
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(mockToken);

      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const body = { name: 'Updated' };
      const result = await apiClient.put('/api/test/1', body);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
          credentials: 'include',
        })
      );
    });

    it('レスポンスがokでない場合はエラーをスロー', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue('token');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(apiClient.put('/api/test/1', {})).rejects.toThrow(
        'PUT /api/test/1 failed with status 404'
      );
    });
  });

  describe('delete', () => {
    it('DELETEリクエストを正しく実行する', async () => {
      const mockToken = 'test-csrf-token';
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(mockToken);

      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.delete('/api/test/1');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
    });

    it('レスポンスがokでない場合はエラーをスロー', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue('token');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      await expect(apiClient.delete('/api/test/1')).rejects.toThrow(
        'DELETE /api/test/1 failed with status 403'
      );
    });
  });

  describe('patch', () => {
    it('PATCHリクエストを正しく実行する', async () => {
      const mockToken = 'test-csrf-token';
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue(mockToken);

      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const body = { name: 'Patched' };
      const result = await apiClient.patch('/api/test/1', body);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
          credentials: 'include',
        })
      );
    });

    it('レスポンスがokでない場合はエラーをスロー', async () => {
      jest.mocked(csrfClient.getCSRFTokenFromCookie).mockReturnValue('token');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(apiClient.patch('/api/test/1', {})).rejects.toThrow(
        'PATCH /api/test/1 failed with status 500'
      );
    });
  });
});
