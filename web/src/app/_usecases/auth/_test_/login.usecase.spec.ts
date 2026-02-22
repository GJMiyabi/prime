import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../login.usecase';
import { IAuthRepository } from '../../../_repositories/auth.repository';
import { LoginInput } from '../../../_types/auth';
import { ERROR_MESSAGES } from '../../../_constants/error-messages';
import * as jwtUtils from '../jwt.utils';

// Mock jwt.utils
vi.mock('../jwt.utils', () => ({
  decodeTokenToUser: vi.fn(),
}));

// Mock logger
vi.mock('../../../_lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthRepository: {
    login: ReturnType<typeof vi.fn<(input: LoginInput) => Promise<string | null>>>;
  };

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn<(input: LoginInput) => Promise<string | null>>(),
    };

    useCase = new LoginUseCase(mockAuthRepository as IAuthRepository);
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('正常なログイン処理', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: 'password123',
      };

      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: 'account-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'STUDENT',
        principalId: 'principal-id',
      };

      mockAuthRepository.login.mockResolvedValue(mockToken);
      vi.mocked(jwtUtils.decodeTokenToUser).mockReturnValue(mockUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: true,
        accessToken: mockToken,
        user: mockUser,
      });
      expect(mockAuthRepository.login).toHaveBeenCalledWith(input);
      expect(jwtUtils.decodeTokenToUser).toHaveBeenCalledWith(mockToken);
    });

    it('トークンがnullの場合はログイン失敗', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthRepository.login.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      });
      expect(jwtUtils.decodeTokenToUser).not.toHaveBeenCalled();
    });

    it('リポジトリエラー時は失敗を返す', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: 'password123',
      };

      const errorMessage = 'ネットワークエラー';
      mockAuthRepository.login.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
    });

    it('非Error型のエラーの場合はデフォルトエラーメッセージ', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: 'password123',
      };

      mockAuthRepository.login.mockRejectedValue('Unknown error');

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      });
    });

    it('JWTデコードエラーの場合は失敗を返す', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: 'password123',
      };

      const mockToken = 'invalid-token';
      mockAuthRepository.login.mockResolvedValue(mockToken);
      vi.mocked(jwtUtils.decodeTokenToUser).mockImplementation(() => {
        throw new Error('認証情報の処理に問題が発生しました。');
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '認証情報の処理に問題が発生しました。',
      });
    });

    it('空のユーザー名でログイン試行', async () => {
      // Arrange
      const input: LoginInput = {
        username: '',
        password: 'password123',
      };

      mockAuthRepository.login.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      });
    });

    it('空のパスワードでログイン試行', async () => {
      // Arrange
      const input: LoginInput = {
        username: 'testuser',
        password: '',
      };

      mockAuthRepository.login.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        success: false,
        error: ERROR_MESSAGES.AUTH.LOGIN_FAILED,
      });
    });
  });
});
