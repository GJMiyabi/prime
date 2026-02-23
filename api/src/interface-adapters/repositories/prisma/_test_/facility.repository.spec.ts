import {
  FacilityCommandRepository,
  FacilityQueryRepository,
} from '../facility.repository';
import { Facility } from 'src/domains/entities/facility';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('src/interface-adapters/shared/prisma-client');

describe('FacilityCommandRepository', () => {
  let repository: FacilityCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      facility: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new FacilityCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいFacilityを作成できる', async () => {
        // Arrange
        const facility = new Facility({
          id: new Id('123e4567-e89b-12d3-a456-426614174006'),
          idNumber: 'FAC-001',
          name: 'Test Facility',
        });
        mockPrismaClient.facility.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174006',
          IDNumber: 'FAC-001',
          name: 'Test Facility',
          organizationId: null,
          isActive: true,
        });

        // Act
        const result = await repository.create(facility);

        // Assert
        expect(mockPrismaClient.facility.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174006',
            IDNumber: 'FAC-001',
            name: 'Test Facility',
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174006');
        expect(result.getIDNumber()).toBe('FAC-001');
        expect(result.getName()).toBe('Test Facility');
      });
    });

    describe('異常系', () => {
      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const facility = new Facility({
          id: new Id('123e4567-e89b-12d3-a456-426614174006'),
          idNumber: 'FAC-001',
          name: 'Test Facility',
        });
        mockPrismaClient.facility.create.mockRejectedValue(
          new Error('Unique constraint violation'),
        );

        // Act & Assert
        await expect(repository.create(facility)).rejects.toThrow(
          'Unique constraint violation',
        );
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('既存のFacilityを更新できる', async () => {
        // Arrange
        const facility = new Facility({
          id: new Id('123e4567-e89b-12d3-a456-426614174006'),
          idNumber: 'FAC-002',
          name: 'Updated Facility',
        });
        mockPrismaClient.facility.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174006',
          IDNumber: 'FAC-002',
          name: 'Updated Facility',
          organizationId: '123e4567-e89b-12d3-a456-426614174007',
          isActive: true,
        });

        // Act
        const result = await repository.update(facility);

        // Assert
        expect(mockPrismaClient.facility.update).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174006' },
          data: {
            IDNumber: 'FAC-002',
            name: 'Updated Facility',
            organizationId: undefined,
          },
        });
        expect(result.getName()).toBe('Updated Facility');
        expect(result.getIDNumber()).toBe('FAC-002');
      });
    });

    describe('異常系', () => {
      it('DB更新に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const facility = new Facility({
          id: new Id('123e4567-e89b-12d3-a456-426614174006'),
          idNumber: 'FAC-002',
          name: 'Updated Facility',
        });
        mockPrismaClient.facility.update.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.update(facility)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('指定されたIDでFacilityを削除できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.delete.mockResolvedValue({});

        // Act
        await repository.delete(id);

        // Assert
        expect(mockPrismaClient.facility.delete).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174006' },
        });
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.delete.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.delete(id)).rejects.toThrow('Record not found');
      });
    });
  });
});

describe('FacilityQueryRepository', () => {
  let repository: FacilityQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      facility: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new FacilityQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    describe('正常系', () => {
      it('IDでFacilityを検索できる（includeなし）', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174006',
          IDNumber: 'FAC-001',
          name: 'Test Facility',
          organizationId: null,
          isActive: true,
        });

        // Act
        const result = await repository.find(id);

        // Assert
        expect(mockPrismaClient.facility.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174006' },
          include: undefined,
        });
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174006');
        expect(result?.getName()).toBe('Test Facility');
      });

      it('includeを指定してFacilityを検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        const include = {
          contactAddress: true,
          persons: true,
          organization: true,
        };
        mockPrismaClient.facility.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174006',
          IDNumber: 'FAC-001',
          name: 'Test Facility',
          organizationId: '123e4567-e89b-12d3-a456-426614174007',
          isActive: true,
          contactAddress: [],
          persons: [],
          organization: {
            id: '123e4567-e89b-12d3-a456-426614174007',
            name: 'Org',
          },
        });

        // Act
        const result = await repository.find(id, include);

        // Assert
        expect(mockPrismaClient.facility.findUnique).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174006' },
          include: {
            contactAddress: true,
            persons: true,
            organization: true,
          },
        });
        expect(result).toBeDefined();
      });

      it('Facilityが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.facility.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.find(id);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.findUnique.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.find(id)).rejects.toThrow('Query failed');
      });
    });
  });

  describe('list', () => {
    describe('正常系', () => {
      it('フィルタなしで全Facilityを取得できる', async () => {
        // Arrange
        mockPrismaClient.facility.findMany.mockResolvedValue([
          {
            id: '423e4567-e89b-12d3-a456-426614174001',
            IDNumber: 'FAC-001',
            name: 'Facility 1',
            organizationId: null,
            isActive: true,
          },
          {
            id: '423e4567-e89b-12d3-a456-426614174002',
            IDNumber: 'FAC-002',
            name: 'Facility 2',
            organizationId: null,
            isActive: true,
          },
        ]);

        // Act
        const result = await repository.list();

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {},
          include: undefined,
        });
        expect(result).toHaveLength(2);
        expect(result[0].getId()).toBe('423e4567-e89b-12d3-a456-426614174001');
        expect(result[1].getId()).toBe('423e4567-e89b-12d3-a456-426614174002');
      });

      it('organizationIdでフィルタできる', async () => {
        // Arrange
        const filters = {
          organizationId: new Id('123e4567-e89b-12d3-a456-426614174007'),
        };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: { organizationId: '123e4567-e89b-12d3-a456-426614174007' },
          include: undefined,
        });
      });

      it('nameでフィルタできる（部分一致）', async () => {
        // Arrange
        const filters = { name: 'Test' };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: { name: { contains: 'Test' } },
          include: undefined,
        });
      });

      it('isActiveでフィルタできる', async () => {
        // Arrange
        const filters = { isActive: true };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
          include: undefined,
        });
      });

      it('personIdsでフィルタできる', async () => {
        // Arrange
        const filters = {
          personIds: [
            new Id('223e4567-e89b-12d3-a456-426614174001'),
            new Id('223e4567-e89b-12d3-a456-426614174002'),
          ],
        };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {
            persons: {
              some: {
                id: {
                  in: [
                    '223e4567-e89b-12d3-a456-426614174001',
                    '223e4567-e89b-12d3-a456-426614174002',
                  ],
                },
              },
            },
          },
          include: undefined,
        });
      });

      it('空のpersonIds配列を渡した場合、personIdsフィルタをスキップする', async () => {
        // Arrange
        const filters = { personIds: [] };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {},
          include: undefined,
        });
      });

      it('includeを指定できる', async () => {
        // Arrange
        const include = { contactAddress: true, persons: true };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(undefined, include);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {},
          include: {
            contactAddress: true,
            persons: true,
            organization: undefined,
          },
        });
      });

      it('複数フィルタとincludeを組み合わせて検索できる', async () => {
        // Arrange
        const filters = {
          organizationId: new Id('123e4567-e89b-12d3-a456-426614174007'),
          name: 'Test',
          isActive: true,
        };
        const include = { contactAddress: true };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters, include);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {
            organizationId: '123e4567-e89b-12d3-a456-426614174007',
            name: { contains: 'Test' },
            isActive: true,
          },
          include: {
            contactAddress: true,
            persons: undefined,
            organization: undefined,
          },
        });
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        mockPrismaClient.facility.findMany.mockRejectedValue(
          new Error('Database error'),
        );

        // Act & Assert
        await expect(repository.list()).rejects.toThrow('Database error');
      });
    });
  });

  describe('findByOrganization', () => {
    describe('正常系', () => {
      it('organizationIdで全Facilityを検索できる', async () => {
        // Arrange
        const organizationId = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.facility.findMany.mockResolvedValue([
          {
            id: '423e4567-e89b-12d3-a456-426614174001',
            IDNumber: 'FAC-001',
            name: 'Facility 1',
            organizationId: '123e4567-e89b-12d3-a456-426614174007',
            isActive: true,
          },
        ]);

        // Act
        const result = await repository.findByOrganization(organizationId);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: { organizationId: '123e4567-e89b-12d3-a456-426614174007' },
          include: undefined,
        });
        expect(result).toHaveLength(1);
        expect(result[0].getId()).toBe('423e4567-e89b-12d3-a456-426614174001');
      });

      it('includeを指定してorganizationIdで検索できる', async () => {
        // Arrange
        const organizationId = new Id('123e4567-e89b-12d3-a456-426614174007');
        const include = { persons: true };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.findByOrganization(organizationId, include);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: { organizationId: '123e4567-e89b-12d3-a456-426614174007' },
          include: {
            contactAddress: undefined,
            persons: true,
            organization: undefined,
          },
        });
      });

      it('該当するFacilityがない場合、空配列を返す', async () => {
        // Arrange
        const organizationId = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        const result = await repository.findByOrganization(organizationId);

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const organizationId = new Id('123e4567-e89b-12d3-a456-426614174007');
        mockPrismaClient.facility.findMany.mockRejectedValue(
          new Error('Query timeout'),
        );

        // Act & Assert
        await expect(
          repository.findByOrganization(organizationId),
        ).rejects.toThrow('Query timeout');
      });
    });
  });

  describe('findByPerson', () => {
    describe('正常系', () => {
      it('personIdで全Facilityを検索できる', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.facility.findMany.mockResolvedValue([
          {
            id: '423e4567-e89b-12d3-a456-426614174001',
            IDNumber: 'FAC-001',
            name: 'Facility 1',
            organizationId: null,
            isActive: true,
          },
        ]);

        // Act
        const result = await repository.findByPerson(personId);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {
            persons: {
              some: {
                id: '123e4567-e89b-12d3-a456-426614174001',
              },
            },
          },
          include: undefined,
        });
        expect(result).toHaveLength(1);
      });

      it('includeを指定してpersonIdで検索できる', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        const include = { organization: true };
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        await repository.findByPerson(personId, include);

        // Assert
        expect(mockPrismaClient.facility.findMany).toHaveBeenCalledWith({
          where: {
            persons: {
              some: {
                id: '123e4567-e89b-12d3-a456-426614174001',
              },
            },
          },
          include: {
            contactAddress: undefined,
            persons: undefined,
            organization: true,
          },
        });
      });

      it('該当するFacilityがない場合、空配列を返す', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.facility.findMany.mockResolvedValue([]);

        // Act
        const result = await repository.findByPerson(personId);

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.facility.findMany.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.findByPerson(personId)).rejects.toThrow(
          'Query failed',
        );
      });
    });
  });

  describe('exists', () => {
    describe('正常系', () => {
      it('Facilityが存在する場合、trueを返す', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.count.mockResolvedValue(1);

        // Act
        const result = await repository.exists(id);

        // Assert
        expect(mockPrismaClient.facility.count).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174006' },
        });
        expect(result).toBe(true);
      });

      it('Facilityが存在しない場合、falseを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.facility.count.mockResolvedValue(0);

        // Act
        const result = await repository.exists(id);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174006');
        mockPrismaClient.facility.count.mockRejectedValue(
          new Error('Count failed'),
        );

        // Act & Assert
        await expect(repository.exists(id)).rejects.toThrow('Count failed');
      });
    });
  });
});
