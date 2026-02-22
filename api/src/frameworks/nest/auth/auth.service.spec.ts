import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { IAccountQueryRepository } from '../../../domains/repositories/account.repositories';
import { Account } from '../../../domains/entities/account';
import { Id } from '../../../domains/value-object/id';
import { PrismaClientSingleton } from '../../../interface-adapters/shared/prisma-client';

// Mock argon2
jest.mock('argon2');
const mockedArgon2 = jest.mocked(argon2);

describe('AuthService', () => {
  let service: AuthService;
  let accountQueryRepository: jest.Mocked<IAccountQueryRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let mockPrismaClient: any;

  beforeEach(async () => {
    // Mock repository
    accountQueryRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as any;

    // Mock JWT service
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    // Mock Prisma client
    mockPrismaClient = {
      principal: {
        findUnique: jest.fn(),
      },
    };

    // Override PrismaClientSingleton
    jest
      .spyOn(PrismaClientSingleton, 'instance', 'get')
      .mockReturnValue(mockPrismaClient as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: IAccountQueryRepository,
          useValue: accountQueryRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('正しい認証情報で検証成功', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const accountId = '550e8400-e29b-41d4-a716-446655440100';
      const principalId = '550e8400-e29b-41d4-a716-446655440101';

      const mockAccount = new Account({
        id: new Id(accountId),
        username,
        password: 'hashed-password',
        principalId: new Id(principalId),
        email: 'test@example.com',
      });

      accountQueryRepository.findByUsername.mockResolvedValue(mockAccount);
      mockedArgon2.verify.mockResolvedValue(true);

      // Act
      const result = await service.validateUser(username, password);

      // Assert
      expect(result).toEqual({
        id: accountId,
        principalId: principalId,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(accountQueryRepository.findByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        'hashed-password',
        password,
      );
    });

    it('ユーザーが存在しない場合はnullを返す', async () => {
      // Arrange
      accountQueryRepository.findByUsername.mockResolvedValue(undefined);

      // Act
      const result = await service.validateUser('nonexistent', 'password');

      // Assert
      expect(result).toBeNull();
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
    });

    it('パスワードが一致しない場合はnullを返す', async () => {
      // Arrange
      const accountId = '550e8400-e29b-41d4-a716-446655440102';
      const principalId = '550e8400-e29b-41d4-a716-446655440103';

      const mockAccount = new Account({
        id: new Id(accountId),
        username: 'testuser',
        password: 'hashed-password',
        principalId: new Id(principalId),
      });

      accountQueryRepository.findByUsername.mockResolvedValue(mockAccount);
      mockedArgon2.verify.mockResolvedValue(false);

      // Act
      const result = await service.validateUser('testuser', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });

    it('無効化されたアカウントの場合はnullを返す', async () => {
      // Arrange
      const accountId = '550e8400-e29b-41d4-a716-446655440104';
      const principalId = '550e8400-e29b-41d4-a716-446655440105';

      const mockAccount = new Account({
        id: new Id(accountId),
        username: 'testuser',
        password: 'hashed-password',
        principalId: new Id(principalId),
        isActive: false,
      });

      accountQueryRepository.findByUsername.mockResolvedValue(mockAccount);

      // Act
      const result = await service.validateUser('testuser', 'password123');

      // Assert
      expect(result).toBeNull();
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
    });

    it('リポジトリエラーの場合はInternalServerErrorExceptionをスロー', async () => {
      // Arrange
      accountQueryRepository.findByUsername.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(
        service.validateUser('testuser', 'password'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('非Error型のエラーの場合は汎用エラーメッセージをスロー', async () => {
      // Arrange
      accountQueryRepository.findByUsername.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(
        service.validateUser('testuser', 'password'),
      ).rejects.toThrow(
        new InternalServerErrorException('Authentication failed'),
      );
    });
  });

  describe('login', () => {
    it('正しい認証情報でJWTトークンを返す', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const accountId = '550e8400-e29b-41d4-a716-446655440106';
      const principalId = '550e8400-e29b-41d4-a716-446655440107';

      const mockAccount = new Account({
        id: new Id(accountId),
        username,
        password: 'hashed-password',
        principalId: new Id(principalId),
        email: 'test@example.com',
      });

      accountQueryRepository.findByUsername.mockResolvedValue(mockAccount);
      mockedArgon2.verify.mockResolvedValue(true);
      mockPrismaClient.principal.findUnique.mockResolvedValue({
        id: principalId,
        kind: 'TEACHER',
      });
      jwtService.signAsync.mockResolvedValue('jwt-token');

      // Act
      const result = await service.login(username, password);

      // Assert
      expect(result).toEqual({
        accessToken: 'jwt-token',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: principalId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'TEACHER',
        accountId: accountId,
      });
    });

    it('ログイン失敗時はnullを返す', async () => {
      // Arrange
      accountQueryRepository.findByUsername.mockResolvedValue(undefined);

      // Act
      const result = await service.login('nonexistent', 'password');

      // Assert
      expect(result).toBeNull();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('Principal情報がない場合はデフォルトでSTUDENTロール', async () => {
      // Arrange
      const accountId = '550e8400-e29b-41d4-a716-446655440108';
      const principalId = '550e8400-e29b-41d4-a716-446655440109';

      const mockAccount = new Account({
        id: new Id(accountId),
        username: 'testuser',
        password: 'hashed-password',
        principalId: new Id(principalId),
      });

      accountQueryRepository.findByUsername.mockResolvedValue(mockAccount);
      mockedArgon2.verify.mockResolvedValue(true);
      mockPrismaClient.principal.findUnique.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      // Act
      const result = await service.login('testuser', 'password123');

      // Assert
      expect(result).toEqual({
        accessToken: 'jwt-token',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'STUDENT',
        }),
      );
    });
  });
});
