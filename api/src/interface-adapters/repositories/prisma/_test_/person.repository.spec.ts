import {
  PersonCommandRepository,
  PersonQueryRepository,
} from '../person.repository';
import { Person } from 'src/domains/entities/person';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('src/interface-adapters/shared/prisma-client');

describe('PersonCommandRepository', () => {
  let repository: PersonCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      person: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      contactAddress: {
        deleteMany: jest.fn(),
      },
      principal: {
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      account: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new PersonCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいPersonを作成できる', async () => {
        // Arrange
        const person = new Person({
          id: new Id('123e4567-e89b-12d3-a456-426614174001'),
          name: 'John Doe',
        });
        mockPrismaClient.person.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
        });

        // Act
        const result = await repository.create(person);

        // Assert
        expect(mockPrismaClient.person.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'John Doe',
          },
        });
        expect(result.getId().value).toBe(
          '123e4567-e89b-12d3-a456-426614174001',
        );
        expect(result.getName()).toBe('John Doe');
      });
    });

    describe('異常系', () => {
      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const person = new Person({
          id: new Id('123e4567-e89b-12d3-a456-426614174001'),
          name: 'John Doe',
        });
        mockPrismaClient.person.create.mockRejectedValue(
          new Error('Unique constraint violation'),
        );

        // Act & Assert
        await expect(repository.create(person)).rejects.toThrow(
          'Unique constraint violation',
        );
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('既存のPersonを更新できる', async () => {
        // Arrange
        const person = new Person({
          id: new Id('123e4567-e89b-12d3-a456-426614174001'),
          name: 'Updated Name',
        });
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
          const tx = {
            person: {
              update: jest.fn().mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Updated Name',
                organizationId: null,
                isActive: true,
              }),
            },
          };
          return await callback(tx);
        });

        // Act
        const result = await repository.update(person);

        // Assert
        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
        expect(result.getName()).toBe('Updated Name');
      });
    });

    describe('異常系', () => {
      it('DB更新に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const person = new Person({
          id: new Id('123e4567-e89b-12d3-a456-426614174001'),
          name: 'Updated Name',
        });
        mockPrismaClient.$transaction.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.update(person)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('Personとその関連データを削除できる（principalあり）', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
          const tx = {
            contactAddress: {
              deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
            principal: {
              findUnique: jest.fn().mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174004',
              }),
              delete: jest.fn().mockResolvedValue({}),
            },
            account: {
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            person: {
              delete: jest.fn().mockResolvedValue({}),
            },
          };
          return await callback(tx);
        });

        // Act
        await repository.delete(id);

        // Assert
        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      });

      it('Personとその関連データを削除できる（principalなし）', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
          const tx = {
            contactAddress: {
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            principal: {
              findUnique: jest.fn().mockResolvedValue(null),
              delete: jest.fn(),
            },
            account: {
              deleteMany: jest.fn(),
            },
            person: {
              delete: jest.fn().mockResolvedValue({}),
            },
          };
          return await callback(tx);
        });

        // Act
        await repository.delete(id);

        // Assert
        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.$transaction.mockRejectedValue(
          new Error('Transaction failed'),
        );

        // Act & Assert
        await expect(repository.delete(id)).rejects.toThrow(
          'Transaction failed',
        );
      });
    });
  });
});

describe('PersonQueryRepository', () => {
  let repository: PersonQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      person: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new PersonQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    describe('正常系', () => {
      it('全Personを取得できる', async () => {
        // Arrange
        mockPrismaClient.person.findMany.mockResolvedValue([
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            name: 'Person 1',
            organizationId: null,
            isActive: true,
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174002',
            name: 'Person 2',
            organizationId: null,
            isActive: true,
          },
        ]);

        // Act
        const result = await repository.list();

        // Assert
        expect(mockPrismaClient.person.findMany).toHaveBeenCalledWith();
        expect(result).toHaveLength(2);
        expect(result[0].getId().value).toBe(
          '223e4567-e89b-12d3-a456-426614174001',
        );
        expect(result[1].getId().value).toBe(
          '223e4567-e89b-12d3-a456-426614174002',
        );
      });

      it('Personがいない場合、空配列を返す', async () => {
        // Arrange
        mockPrismaClient.person.findMany.mockResolvedValue([]);

        // Act
        const result = await repository.list();

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        mockPrismaClient.person.findMany.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.list()).rejects.toThrow('Query failed');
      });
    });
  });

  describe('find', () => {
    describe('正常系', () => {
      it('IDでPersonを検索できる（includeなし）', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
        });

        // Act
        const result = await repository.find(id);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: undefined,
        });
        expect(result).toBeDefined();
        expect(result?.getId().value).toBe(
          '123e4567-e89b-12d3-a456-426614174001',
        );
        expect(result?.getName()).toBe('John Doe');
      });

      it('contactsを含めて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { contacts: true };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
          contacts: [
            {
              id: '323e4567-e89b-12d3-a456-426614174001',
              type: 'EMAIL',
              value: 'john@example.com',
              personId: '123e4567-e89b-12d3-a456-426614174001',
              facilityId: null,
              organizationId: null,
            },
          ],
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: true,
            facilities: undefined,
            organization: undefined,
            principal: undefined,
          },
        });
        expect(result).toBeDefined();
      });

      it('principalを含めて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { principal: {} };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
          principal: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            kind: 'ADMIN',
            personId: '123e4567-e89b-12d3-a456-426614174001',
          },
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: undefined,
            facilities: undefined,
            organization: undefined,
            principal: true,
          },
        });
        expect(result).toBeDefined();
      });

      it('principal.accountを含めて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { principal: { include: { account: true } } };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
          principal: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            kind: 'ADMIN',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            account: {
              id: '123e4567-e89b-12d3-a456-426614174003',
              username: 'johndoe',
              password: 'hashed-password',
              principalId: '123e4567-e89b-12d3-a456-426614174004',
              isActive: true,
            },
          },
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: undefined,
            facilities: undefined,
            organization: undefined,
            principal: { include: { account: true } },
          },
        });
        expect(result).toBeDefined();
      });

      it('facilitiesを含めて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { facilities: true };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: null,
          isActive: true,
          facilities: [
            {
              id: '423e4567-e89b-12d3-a456-426614174001',
              IDNumber: 'FAC-001',
              name: 'Facility A',
              organizationId: null,
              isActive: true,
            },
          ],
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: undefined,
            facilities: true,
            organization: undefined,
            principal: undefined,
          },
        });
        expect(result).toBeDefined();
      });

      it('organizationを含めて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { organization: true };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: '123e4567-e89b-12d3-a456-426614174007',
          isActive: true,
          organization: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            IDNumber: 'ORG-001',
            name: 'Organization A',
            isActive: true,
          },
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: undefined,
            facilities: undefined,
            organization: true,
            principal: undefined,
          },
        });
        expect(result).toBeDefined();
      });

      it('複数のincludeを組み合わせて検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = {
          contacts: true,
          principal: { include: { account: true } },
          facilities: true,
          organization: true,
        };
        mockPrismaClient.person.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          organizationId: '123e4567-e89b-12d3-a456-426614174007',
          isActive: true,
          contacts: [],
          principal: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            kind: 'ADMIN',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            account: {
              id: '123e4567-e89b-12d3-a456-426614174003',
              username: 'johndoe',
              password: 'hashed-password',
              principalId: '123e4567-e89b-12d3-a456-426614174004',
              isActive: true,
            },
          },
          facilities: [],
          organization: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            IDNumber: 'ORG-001',
            name: 'Organization A',
            isActive: true,
          },
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.person.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174001' },
          include: {
            contacts: true,
            facilities: true,
            organization: true,
            principal: { include: { account: true } },
          },
        });
        expect(result).toBeDefined();
      });

      it('Personが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.person.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.find(id);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.person.findUnique.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.find(id)).rejects.toThrow('Query failed');
      });
    });
  });
});
