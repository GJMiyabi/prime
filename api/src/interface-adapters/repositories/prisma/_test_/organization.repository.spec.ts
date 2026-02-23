import {
  OrganizationCommandRepository,
  OrganizationQueryRepository,
} from '../organization.repository';
import { Organization } from 'src/domains/entities/organization';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('src/interface-adapters/shared/prisma-client');

describe('OrganizationCommandRepository', () => {
  let repository: OrganizationCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      organization: {
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new OrganizationCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいOrganizationを作成できる', async () => {
        // Arrange
        const organization = new Organization({
          id: new Id('123e4567-e89b-12d3-a456-426614174007'),
          idNumber: 'ORG-001',
          name: 'Test Organization',
        });
        mockPrismaClient.organization.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174007',
          IDNumber: 'ORG-001',
          name: 'Test Organization',
          isActive: true,
        });

        // Act
        const result = await repository.create(organization);

        // Assert
        expect(mockPrismaClient.organization.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            IDNumber: 'ORG-001',
            name: 'Test Organization',
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174007');
        expect(result.getIDNumber()).toBe('ORG-001');
        expect(result.getName()).toBe('Test Organization');
      });
    });

    describe('異常系', () => {
      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const organization = new Organization({
          id: new Id('123e4567-e89b-12d3-a456-426614174007'),
          idNumber: 'ORG-001',
          name: 'Test Organization',
        });
        mockPrismaClient.organization.create.mockRejectedValue(
          new Error('Unique constraint violation'),
        );

        // Act & Assert
        await expect(repository.create(organization)).rejects.toThrow(
          'Unique constraint violation',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('指定されたIDでOrganizationを削除できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.organization.delete.mockResolvedValue({});

        // Act
        await repository.delete(id);

        // Assert
        expect(mockPrismaClient.organization.delete).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174007' },
        });
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.organization.delete.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.delete(id)).rejects.toThrow('Record not found');
      });
    });
  });
});

describe('OrganizationQueryRepository', () => {
  let repository: OrganizationQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      organization: {
        findUnique: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new OrganizationQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    describe('正常系', () => {
      it('IDでOrganizationを検索できる（includeなし）', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.organization.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174007',
          IDNumber: 'ORG-001',
          name: 'Test Organization',
          isActive: true,
        });

        // Act
        const result = await repository.find(id);

        // Assert
        expect(mockPrismaClient.organization.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174007' },
          include: undefined,
        });
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174007');
        expect(result?.getName()).toBe('Test Organization');
        expect(result?.getIDNumber()).toBe('ORG-001');
      });

      it('includeを指定してOrganizationを検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        const include = {
          contactAddresses: true,
          persons: true,
          facilities: true,
        };
        mockPrismaClient.organization.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174007',
          IDNumber: 'ORG-001',
          name: 'Test Organization',
          isActive: true,
          contactAddresses: [],
          persons: [],
          facilities: [],
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.organization.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174007' },
          include: {
            contactAddresses: true,
            persons: true,
            facilities: true,
          },
        });
        expect(result).toBeDefined();
      });

      it('Organizationが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.organization.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.find(id);

        // Assert
        expect(result).toBeUndefined();
      });

      it('一部のincludeオプションだけ指定できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        const include = {
          persons: true,
        };
        mockPrismaClient.organization.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174007',
          IDNumber: 'ORG-001',
          name: 'Test Organization',
          isActive: true,
          persons: [],
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.organization.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174007' },
          include: {
            persons: true,
          },
        });
        expect(result).toBeDefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.organization.findUnique.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.find(id)).rejects.toThrow('Query failed');
      });
    });
  });
});
