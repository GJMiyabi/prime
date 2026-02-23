import * as argon2 from 'argon2';
import {
  AccountCommandRepository,
  AccountQueryRepository,
} from '../account.repository';
import { Account } from 'src/domains/entities/account';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('argon2');
jest.mock('src/interface-adapters/shared/prisma-client');

describe('AccountCommandRepository', () => {
  let repository: AccountCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      account: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new AccountCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいAccountを作成できる', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'plain-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        const hashedPassword = 'hashed-password';
        (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
        mockPrismaClient.account.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: hashedPassword,
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'testuser',
          isActive: true,
        });

        // Act
        const result = await repository.create(account);

        // Assert
        expect(argon2.hash).toHaveBeenCalledWith('plain-password');
        expect(mockPrismaClient.account.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            password: hashedPassword,
            principalId: '123e4567-e89b-12d3-a456-426614174004',
            username: 'testuser',
            isActive: true,
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174003');
        expect(result.getUsername()).toBe('testuser');
        expect(result.getPrincipalId()).toBe(
          '123e4567-e89b-12d3-a456-426614174004',
        );
        expect(result.getIsActive()).toBe(true);
      });

      it('パスワードがハッシュ化されてDBに保存される', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'my-secret-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$...';
        (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
        mockPrismaClient.account.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: hashedPassword,
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'testuser',
          isActive: true,
        });

        // Act
        await repository.create(account);

        // Assert
        expect(argon2.hash).toHaveBeenCalledWith('my-secret-password');
        expect(mockPrismaClient.account.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              password: hashedPassword,
            }),
          }),
        );
      });
    });

    describe('異常系', () => {
      it('パスワードハッシュ化に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'plain-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        (argon2.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

        // Act & Assert
        await expect(repository.create(account)).rejects.toThrow('Hash failed');
        expect(mockPrismaClient.account.create).not.toHaveBeenCalled();
      });

      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'plain-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
        mockPrismaClient.account.create.mockRejectedValue(
          new Error('Unique constraint violation'),
        );

        // Act & Assert
        await expect(repository.create(account)).rejects.toThrow(
          'Unique constraint violation',
        );
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('既存のAccountを更新できる', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'new-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'updateduser',
          isActive: false,
        });
        const hashedPassword = 'hashed-new-password';
        (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
        mockPrismaClient.account.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: hashedPassword,
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'updateduser',
          isActive: false,
        });

        // Act
        const result = await repository.update(account);

        // Assert
        expect(argon2.hash).toHaveBeenCalledWith('new-password');
        expect(mockPrismaClient.account.update).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174003' },
          data: {
            password: hashedPassword,
            username: 'updateduser',
            principalId: '123e4567-e89b-12d3-a456-426614174004',
            isActive: false,
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174003');
        expect(result.getUsername()).toBe('updateduser');
        expect(result.getIsActive()).toBe(false);
      });

      it('更新時にもパスワードがハッシュ化される', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'updated-secret',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$...';
        (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
        mockPrismaClient.account.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: hashedPassword,
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'testuser',
          isActive: true,
        });

        // Act
        await repository.update(account);

        // Assert
        expect(argon2.hash).toHaveBeenCalledWith('updated-secret');
        expect(mockPrismaClient.account.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              password: hashedPassword,
            }),
          }),
        );
      });
    });

    describe('異常系', () => {
      it('パスワードハッシュ化に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'new-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        (argon2.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

        // Act & Assert
        await expect(repository.update(account)).rejects.toThrow('Hash failed');
        expect(mockPrismaClient.account.update).not.toHaveBeenCalled();
      });

      it('DB更新に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const account = new Account({
          id: new Id('123e4567-e89b-12d3-a456-426614174003'),
          password: 'new-password',
          principalId: new Id('123e4567-e89b-12d3-a456-426614174004'),
          username: 'testuser',
          isActive: true,
        });
        (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
        mockPrismaClient.account.update.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.update(account)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('指定されたprincipalIdでAccountを削除できる', async () => {
        // Arrange
        const principalId = new Id('123e4567-e89b-12d3-a456-426614174004');
        mockPrismaClient.account.delete.mockResolvedValue({});

        // Act
        await repository.delete(principalId);

        // Assert
        expect(mockPrismaClient.account.delete).toHaveBeenCalledWith({
          where: { principalId: '123e4567-e89b-12d3-a456-426614174004' },
        });
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const principalId = new Id('123e4567-e89b-12d3-a456-426614174004');
        mockPrismaClient.account.delete.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.delete(principalId)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });
});

describe('AccountQueryRepository', () => {
  let repository: AccountQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      account: {
        findUnique: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new AccountQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByPrincipalId', () => {
    describe('正常系', () => {
      it('principalIdでAccountを検索できる', async () => {
        // Arrange
        const principalId = '123e4567-e89b-12d3-a456-426614174004';
        mockPrismaClient.account.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: 'hashed-password',
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'testuser',
          isActive: true,
        });

        // Act
        const result = await repository.findByPrincipalId(principalId);

        // Assert
        expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
          where: { principalId },
        });
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174003');
        expect(result?.getUsername()).toBe('testuser');
        expect(result?.getPrincipalId()).toBe(
          '123e4567-e89b-12d3-a456-426614174004',
        );
        expect(result?.getIsActive()).toBe(true);
      });

      it('Accountが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const principalId = '999e4567-e89b-12d3-a456-426614174999';
        mockPrismaClient.account.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.findByPrincipalId(principalId);

        // Assert
        expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
          where: { principalId },
        });
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const principalId = '123e4567-e89b-12d3-a456-426614174004';
        mockPrismaClient.account.findUnique.mockRejectedValue(
          new Error('Database connection failed'),
        );

        // Act & Assert
        await expect(repository.findByPrincipalId(principalId)).rejects.toThrow(
          'Database connection failed',
        );
      });
    });
  });

  describe('findByUsername', () => {
    describe('正常系', () => {
      it('usernameでAccountを検索できる', async () => {
        // Arrange
        const username = 'testuser';
        mockPrismaClient.account.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174003',
          password: 'hashed-password',
          principalId: '123e4567-e89b-12d3-a456-426614174004',
          username: 'testuser',
          isActive: true,
        });

        // Act
        const result = await repository.findByUsername(username);

        // Assert
        expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
          where: { username },
        });
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174003');
        expect(result?.getUsername()).toBe('testuser');
      });

      it('Accountが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const username = 'nonexistentuser';
        mockPrismaClient.account.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.findByUsername(username);

        // Assert
        expect(mockPrismaClient.account.findUnique).toHaveBeenCalledWith({
          where: { username },
        });
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const username = 'testuser';
        mockPrismaClient.account.findUnique.mockRejectedValue(
          new Error('Query timeout'),
        );

        // Act & Assert
        await expect(repository.findByUsername(username)).rejects.toThrow(
          'Query timeout',
        );
      });
    });
  });
});
