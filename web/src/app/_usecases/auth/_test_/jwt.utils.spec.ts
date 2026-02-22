import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodeTokenToUser } from '../jwt.utils';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock logger
vi.mock('../../_lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('jwt.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decodeTokenToUser', () => {
    it('有効なトークンをデコードしてユーザー情報を返す', () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        accountId: 'account-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'STUDENT',
        sub: 'principal-123',
      };

      vi.mocked(jwtDecode).mockReturnValue(mockPayload);

      // Act
      const result = decodeTokenToUser(mockToken);

      // Assert
      expect(result).toEqual({
        id: 'account-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'STUDENT',
        principalId: 'principal-123',
      });
      expect(jwtDecode).toHaveBeenCalledWith(mockToken);
    });

    it('emailがnullの場合はデフォルトメールアドレスを使用', () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        accountId: 'account-123',
        username: 'testuser',
        email: null,
        role: 'TEACHER',
        sub: 'principal-123',
      };

      vi.mocked(jwtDecode).mockReturnValue(mockPayload);

      // Act
      const result = decodeTokenToUser(mockToken);

      // Assert
      expect(result.email).toBe('testuser@example.com');
    });

    it('emailがundefinedの場合もデフォルトメールアドレスを使用', () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        accountId: 'account-123',
        username: 'admin',
        role: 'ADMIN',
        sub: 'principal-123',
      };

      vi.mocked(jwtDecode).mockReturnValue(mockPayload);

      // Act
      const result = decodeTokenToUser(mockToken);

      // Assert
      expect(result.email).toBe('admin@example.com');
    });

    it('デコードエラー時はエラーをスロー', () => {
      // Arrange
      const invalidToken = 'invalid-token';
      vi.mocked(jwtDecode).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => decodeTokenToUser(invalidToken)).toThrow(
        '認証情報の処理に問題が発生しました。'
      );
    });

    it('空文字列のトークンの場合はエラーをスロー', () => {
      // Arrange
      vi.mocked(jwtDecode).mockImplementation(() => {
        throw new Error('Token is empty');
      });

      // Act & Assert
      expect(() => decodeTokenToUser('')).toThrow(
        '認証情報の処理に問題が発生しました。'
      );
    });

    it('各ロールタイプが正しく処理される', () => {
      // Arrange
      const roles = ['STUDENT', 'TEACHER', 'ADMIN', 'GUARDIAN'];

      roles.forEach((role, index) => {
        const mockToken = `token-${index}`;
        const mockPayload = {
          accountId: `account-${index}`,
          username: `user${index}`,
          email: `user${index}@example.com`,
          role,
          sub: `principal-${index}`,
        };

        vi.mocked(jwtDecode).mockReturnValue(mockPayload);

        // Act
        const result = decodeTokenToUser(mockToken);

        // Assert
        expect(result.role).toBe(role);
      });
    });
  });
});
