import { AxiosClient } from '../axios.client';
import { HttpClient } from '../http.client';
import axios from 'axios';

// Axiosをモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  describe('abstract class', () => {
    it('should have static HEADERS constants', () => {
      // Assert
      expect(HttpClient.HEADERS.contentType.json).toEqual({
        'Content-type': 'application/json',
      });
    });
  });
});

describe('AxiosClient', () => {
  let client: AxiosClient;

  beforeEach(() => {
    client = new AxiosClient();
    jest.clearAllMocks();
  });

  describe('post', () => {
    it('should make POST request and return response', async () => {
      // Arrange
      const url = 'https://api.example.com/users';
      const data = { name: 'John', email: 'john@example.com' };
      const mockResponse = {
        status: 201,
        data: { id: 1, ...data },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await client.post(url, data);

      // Assert
      expect(result).toEqual({
        status: 201,
        data: { id: 1, ...data },
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(url, data, {
        headers: undefined,
        params: undefined,
      });
    });

    it('should make POST request with headers', async () => {
      // Arrange
      const url = 'https://api.example.com/users';
      const data = { name: 'Jane' };
      const headers = { Authorization: 'Bearer token123' };
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await client.post(url, data, headers);

      // Assert
      expect(result.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledWith(url, data, {
        headers,
        params: undefined,
      });
    });

    it('should make POST request with params', async () => {
      // Arrange
      const url = 'https://api.example.com/search';
      const data = { query: 'test' };
      const params = { page: '1', limit: '10' };
      const mockResponse = {
        status: 200,
        data: { results: [] },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await client.post(url, data, undefined, params);

      // Assert
      expect(result.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledWith(url, data, {
        headers: undefined,
        params,
      });
    });

    it('should make POST request with both headers and params', async () => {
      // Arrange
      const url = 'https://api.example.com/data';
      const data = { value: 'test' };
      const headers = { 'Content-Type': 'application/json' };
      const params = { include: 'details' };
      const mockResponse = {
        status: 200,
        data: { id: 1 },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await client.post(url, data, headers, params);

      // Assert
      expect(result).toEqual({ status: 200, data: { id: 1 } });
      expect(mockedAxios.post).toHaveBeenCalledWith(url, data, {
        headers,
        params,
      });
    });
  });

  describe('get', () => {
    it('should make GET request and return response', async () => {
      // Arrange
      const url = 'https://api.example.com/users/1';
      const mockResponse = {
        status: 200,
        data: { id: 1, name: 'John' },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await client.get(url);

      // Assert
      expect(result).toEqual({
        status: 200,
        data: { id: 1, name: 'John' },
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(url, {
        headers: undefined,
        params: undefined,
      });
    });

    it('should make GET request with headers', async () => {
      // Arrange
      const url = 'https://api.example.com/protected';
      const headers = { Authorization: 'Bearer token' };
      const mockResponse = {
        status: 200,
        data: { secret: 'data' },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await client.get(url, headers);

      // Assert
      expect(result.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(url, {
        headers,
        params: undefined,
      });
    });

    it('should make GET request with params', async () => {
      // Arrange
      const url = 'https://api.example.com/search';
      const params = { q: 'test', limit: '20' };
      const mockResponse = {
        status: 200,
        data: { results: [] },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await client.get(url, undefined, params);

      // Assert
      expect(result.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(url, {
        headers: undefined,
        params,
      });
    });

    it('should make GET request with headers and params', async () => {
      // Arrange
      const url = 'https://api.example.com/items';
      const headers = { 'X-API-Key': 'key123' };
      const params = { category: 'books' };
      const mockResponse = {
        status: 200,
        data: { items: [] },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await client.get(url, headers, params);

      // Assert
      expect(result).toEqual({ status: 200, data: { items: [] } });
      expect(mockedAxios.get).toHaveBeenCalledWith(url, { headers, params });
    });
  });

  describe('request', () => {
    it('should make GET request using generic request method', async () => {
      // Arrange
      const config = {
        method: 'GET' as const,
        url: 'https://api.example.com/data',
      };
      const mockResponse = {
        status: 200,
        data: { value: 'test' },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Act
      const result = await client.request(config);

      // Assert
      expect(result).toEqual({ status: 200, data: { value: 'test' } });
      expect(mockedAxios.request).toHaveBeenCalledWith(config);
    });

    it('should make POST request using generic request method', async () => {
      // Arrange
      const config = {
        method: 'POST' as const,
        url: 'https://api.example.com/data',
        data: { name: 'Test' },
        headers: { 'Content-Type': 'application/json' },
      };
      const mockResponse = {
        status: 201,
        data: { id: 1, name: 'Test' },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Act
      const result = await client.request(config);

      // Assert
      expect(result.status).toBe(201);
      expect(mockedAxios.request).toHaveBeenCalledWith(config);
    });

    it('should make PUT request using generic request method', async () => {
      // Arrange
      const config = {
        method: 'PUT' as const,
        url: 'https://api.example.com/data/1',
        data: { name: 'Updated' },
      };
      const mockResponse = {
        status: 200,
        data: { id: 1, name: 'Updated' },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Act
      const result = await client.request(config);

      // Assert
      expect(result.status).toBe(200);
      expect(mockedAxios.request).toHaveBeenCalledWith(config);
    });

    it('should make DELETE request using generic request method', async () => {
      // Arrange
      const config = {
        method: 'DELETE' as const,
        url: 'https://api.example.com/data/1',
      };
      const mockResponse = {
        status: 204,
        data: null,
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Act
      const result = await client.request(config);

      // Assert
      expect(result.status).toBe(204);
      expect(mockedAxios.request).toHaveBeenCalledWith(config);
    });

    it('should handle request with baseUrl', async () => {
      // Arrange
      const config = {
        baseUrl: 'https://api.example.com',
        method: 'GET' as const,
        url: '/users',
      };
      const mockResponse = {
        status: 200,
        data: { users: [] },
      };

      mockedAxios.request.mockResolvedValue(mockResponse);

      // Act
      const result = await client.request(config);

      // Assert
      expect(result).toEqual({ status: 200, data: { users: [] } });
      expect(mockedAxios.request).toHaveBeenCalledWith(config);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from axios.post', async () => {
      // Arrange
      const url = 'https://api.example.com/error';
      const error = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(error);

      // Act & Assert
      await expect(client.post(url, {})).rejects.toThrow('Network Error');
    });

    it('should propagate errors from axios.get', async () => {
      // Arrange
      const url = 'https://api.example.com/error';
      const error = new Error('Not Found');
      mockedAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(client.get(url)).rejects.toThrow('Not Found');
    });

    it('should propagate errors from axios.request', async () => {
      // Arrange
      const config = { method: 'GET' as const, url: 'https://api.example.com' };
      const error = new Error('Timeout');
      mockedAxios.request.mockRejectedValue(error);

      // Act & Assert
      await expect(client.request(config)).rejects.toThrow('Timeout');
    });
  });
});
