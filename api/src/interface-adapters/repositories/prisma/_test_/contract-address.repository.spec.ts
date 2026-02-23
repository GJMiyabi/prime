import {
  ContactAddressCommandRepository,
  ContactAddressQueryRepository,
} from '../contract-address.repository';
import { ContactAddress } from 'src/domains/entities/contact-address';
import { ContactType } from 'src/domains/type/contact';
import { ContactType as PrismaContactType } from '@prisma/client';
import { Id } from 'src/domains/value-object/id';
import { PrismaClientSingleton } from 'src/interface-adapters/shared/prisma-client';

jest.mock('src/interface-adapters/shared/prisma-client');

describe('ContactAddressCommandRepository', () => {
  let repository: ContactAddressCommandRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      contactAddress: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new ContactAddressCommandRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('正常系', () => {
      it('新しいContactAddressを作成できる（personId指定）', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.EMAIL,
          value: 'test@example.com',
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          facilityId: undefined,
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.EMAIL,
          value: 'test@example.com',
          personId: '123e4567-e89b-12d3-a456-426614174001',
          facilityId: null,
          organizationId: null,
        });

        // Act
        const result = await repository.create(contactAddress);

        // Assert
        expect(mockPrismaClient.contactAddress.create).toHaveBeenCalledWith({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174005',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: undefined,
            organizationId: undefined,
            type: ContactType.EMAIL,
            value: 'test@example.com',
          },
        });
        expect(result.getId()).toBe('123e4567-e89b-12d3-a456-426614174005');
        expect(result.getType()).toBe(ContactType.EMAIL);
        expect(result.getValue()).toBe('test@example.com');
        expect(result.getPersonId()).toBe('123e4567-e89b-12d3-a456-426614174001');
      });

      it('新しいContactAddressを作成できる（facilityId指定）', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.PHONE,
          value: '090-1234-5678',
          personId: undefined,
          facilityId: new Id('123e4567-e89b-12d3-a456-426614174006'),
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.PHONE,
          value: '090-1234-5678',
          personId: null,
          facilityId: '123e4567-e89b-12d3-a456-426614174006',
          organizationId: null,
        });

        // Act
        const result = await repository.create(contactAddress);

        // Assert
        expect(result.getFacilityId()).toBe('123e4567-e89b-12d3-a456-426614174006');
        expect(result.getType()).toBe(ContactType.PHONE);
      });

      it('新しいContactAddressを作成できる（organizationId指定）', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.ADDRESS,
          value: 'Tokyo, Japan',
          personId: undefined,
          facilityId: undefined,
          organizationId: new Id('123e4567-e89b-12d3-a456-426614174007'),
        });
        mockPrismaClient.contactAddress.create.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.ADDRESS,
          value: 'Tokyo, Japan',
          personId: null,
          facilityId: null,
          organizationId: '123e4567-e89b-12d3-a456-426614174007',
        });

        // Act
        const result = await repository.create(contactAddress);

        // Assert
        expect(result.getOrganizationId()).toBe('123e4567-e89b-12d3-a456-426614174007');
        expect(result.getType()).toBe(ContactType.ADDRESS);
      });
    });

    describe('異常系', () => {
      it('DB作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.EMAIL,
          value: 'test@example.com',
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          facilityId: undefined,
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.create.mockRejectedValue(
          new Error('Foreign key constraint failed'),
        );

        // Act & Assert
        await expect(repository.create(contactAddress)).rejects.toThrow(
          'Foreign key constraint failed',
        );
      });
    });
  });

  describe('update', () => {
    describe('正常系', () => {
      it('既存のContactAddressを更新できる', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.EMAIL,
          value: 'updated@example.com',
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          facilityId: undefined,
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.EMAIL,
          value: 'updated@example.com',
          personId: '123e4567-e89b-12d3-a456-426614174001',
          facilityId: null,
          organizationId: null,
        });

        // Act
        const result = await repository.update(contactAddress);

        // Assert
        expect(mockPrismaClient.contactAddress.update).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174005' },
          data: {
            type: ContactType.EMAIL,
            value: 'updated@example.com',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: undefined,
            organizationId: undefined,
          },
        });
        expect(result.getValue()).toBe('updated@example.com');
      });

      it('ContactTypeを変更できる', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.PHONE,
          value: '090-9999-8888',
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          facilityId: undefined,
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.update.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.PHONE,
          value: '090-9999-8888',
          personId: '123e4567-e89b-12d3-a456-426614174001',
          facilityId: null,
          organizationId: null,
        });

        // Act
        const result = await repository.update(contactAddress);

        // Assert
        expect(result.getType()).toBe(ContactType.PHONE);
      });
    });

    describe('異常系', () => {
      it('DB更新に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const contactAddress = new ContactAddress({
          id: new Id('123e4567-e89b-12d3-a456-426614174005'),
          type: ContactType.EMAIL,
          value: 'updated@example.com',
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          facilityId: undefined,
          organizationId: undefined,
        });
        mockPrismaClient.contactAddress.update.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.update(contactAddress)).rejects.toThrow(
          'Record not found',
        );
      });
    });
  });

  describe('delete', () => {
    describe('正常系', () => {
      it('指定されたIDでContactAddressを削除できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.delete.mockResolvedValue({});

        // Act
        await repository.delete(id);

        // Assert
        expect(mockPrismaClient.contactAddress.delete).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174005' },
        });
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.delete.mockRejectedValue(
          new Error('Record not found'),
        );

        // Act & Assert
        await expect(repository.delete(id)).rejects.toThrow('Record not found');
      });
    });
  });

  describe('deleteByPersonId', () => {
    describe('正常系', () => {
      it('指定されたpersonIdの全ContactAddressを削除できる', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.deleteMany.mockResolvedValue({
          count: 3,
        });

        // Act
        await repository.deleteByPersonId(personId);

        // Assert
        expect(mockPrismaClient.contactAddress.deleteMany).toHaveBeenCalledWith(
          {
            where: { personId: '123e4567-e89b-12d3-a456-426614174001' },
          },
        );
      });
    });

    describe('異常系', () => {
      it('削除に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.deleteMany.mockRejectedValue(
          new Error('Delete failed'),
        );

        // Act & Assert
        await expect(repository.deleteByPersonId(personId)).rejects.toThrow(
          'Delete failed',
        );
      });
    });
  });

  describe('bulkCreate', () => {
    describe('正常系', () => {
      it('複数のContactAddressを一括作成できる', async () => {
        // Arrange
        const contacts = [
          new ContactAddress({
            id: new Id('323e4567-e89b-12d3-a456-426614174001'),
            type: ContactType.EMAIL,
            value: 'email1@example.com',
            personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
            facilityId: undefined,
            organizationId: undefined,
          }),
          new ContactAddress({
            id: new Id('323e4567-e89b-12d3-a456-426614174002'),
            type: ContactType.PHONE,
            value: '090-1234-5678',
            personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
            facilityId: undefined,
            organizationId: undefined,
          }),
        ];
        mockPrismaClient.contactAddress.createMany.mockResolvedValue({
          count: 2,
        });
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([
          {
            id: '323e4567-e89b-12d3-a456-426614174001',
            type: PrismaContactType.EMAIL,
            value: 'email1@example.com',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
          {
            id: '323e4567-e89b-12d3-a456-426614174002',
            type: PrismaContactType.PHONE,
            value: '090-1234-5678',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
        ]);

        // Act
        const result = await repository.bulkCreate(contacts);

        // Assert
        expect(mockPrismaClient.contactAddress.createMany).toHaveBeenCalledWith(
          {
            data: [
              {
                id: '323e4567-e89b-12d3-a456-426614174001',
                personId: '123e4567-e89b-12d3-a456-426614174001',
                facilityId: undefined,
                organizationId: undefined,
                type: ContactType.EMAIL,
                value: 'email1@example.com',
              },
              {
                id: '323e4567-e89b-12d3-a456-426614174002',
                personId: '123e4567-e89b-12d3-a456-426614174001',
                facilityId: undefined,
                organizationId: undefined,
                type: ContactType.PHONE,
                value: '090-1234-5678',
              },
            ],
          },
        );
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: {
            id: {
              in: ['323e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174002'],
            },
          },
        });
        expect(result).toHaveLength(2);
        expect(result[0].getId()).toBe('323e4567-e89b-12d3-a456-426614174001');
        expect(result[1].getId()).toBe('323e4567-e89b-12d3-a456-426614174002');
      });

      it('空配列を渡した場合、空配列を返す', async () => {
        // Arrange
        const contacts: ContactAddress[] = [];
        mockPrismaClient.contactAddress.createMany.mockResolvedValue({
          count: 0,
        });
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        const result = await repository.bulkCreate(contacts);

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('一括作成に失敗した場合、エラーをスローする', async () => {
        // Arrange
        const contacts = [
          new ContactAddress({
            id: new Id('323e4567-e89b-12d3-a456-426614174001'),
            type: ContactType.EMAIL,
            value: 'email1@example.com',
            personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
            facilityId: undefined,
            organizationId: undefined,
          }),
        ];
        mockPrismaClient.contactAddress.createMany.mockRejectedValue(
          new Error('Bulk insert failed'),
        );

        // Act & Assert
        await expect(repository.bulkCreate(contacts)).rejects.toThrow(
          'Bulk insert failed',
        );
      });
    });
  });
});

describe('ContactAddressQueryRepository', () => {
  let repository: ContactAddressQueryRepository;
  let mockPrismaClient: any;

  beforeAll(() => {
    mockPrismaClient = {
      contactAddress: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    (PrismaClientSingleton as any).instance = mockPrismaClient;
    repository = new ContactAddressQueryRepository(mockPrismaClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    describe('正常系', () => {
      it('IDでContactAddressを検索できる', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.findUnique.mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          type: PrismaContactType.EMAIL,
          value: 'test@example.com',
          personId: '123e4567-e89b-12d3-a456-426614174001',
          facilityId: null,
          organizationId: null,
        });

        // Act
        const result = await repository.find(id);

        // Assert
        expect(mockPrismaClient.contactAddress.findUnique).toHaveBeenCalledWith(
          {
            where: { id: '123e4567-e89b-12d3-a456-426614174005' },
          },
        );
        expect(result).toBeDefined();
        expect(result?.getId()).toBe('123e4567-e89b-12d3-a456-426614174005');
        expect(result?.getType()).toBe(ContactType.EMAIL);
      });

      it('ContactAddressが見つからない場合、undefinedを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.contactAddress.findUnique.mockResolvedValue(null);

        // Act
        const result = await repository.find(id);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.findUnique.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(repository.find(id)).rejects.toThrow('Query failed');
      });
    });
  });

  describe('findByPersonId', () => {
    describe('正常系', () => {
      it('personIdで全ContactAddressを検索できる', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([
          {
            id: '323e4567-e89b-12d3-a456-426614174001',
            type: PrismaContactType.EMAIL,
            value: 'email@example.com',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
          {
            id: '323e4567-e89b-12d3-a456-426614174002',
            type: PrismaContactType.PHONE,
            value: '090-1234-5678',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
        ]);

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { personId: '123e4567-e89b-12d3-a456-426614174001' },
          orderBy: { id: 'asc' },
        });
        expect(result).toHaveLength(2);
        expect(result[0].getId()).toBe('323e4567-e89b-12d3-a456-426614174001');
        expect(result[1].getId()).toBe('323e4567-e89b-12d3-a456-426614174002');
      });

      it('該当するContactAddressがない場合、空配列を返す', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        const result = await repository.findByPersonId(personId);

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.findMany.mockRejectedValue(
          new Error('Query timeout'),
        );

        // Act & Assert
        await expect(repository.findByPersonId(personId)).rejects.toThrow(
          'Query timeout',
        );
      });
    });
  });

  describe('findByContactType', () => {
    describe('正常系', () => {
      it('ContactTypeで全ContactAddressを検索できる', async () => {
        // Arrange
        const contactType = ContactType.EMAIL;
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([
          {
            id: '323e4567-e89b-12d3-a456-426614174001',
            type: PrismaContactType.EMAIL,
            value: 'email1@example.com',
            personId: '223e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
          {
            id: '323e4567-e89b-12d3-a456-426614174002',
            type: PrismaContactType.EMAIL,
            value: 'email2@example.com',
            personId: '223e4567-e89b-12d3-a456-426614174002',
            facilityId: null,
            organizationId: null,
          },
        ]);

        // Act
        const result = await repository.findByContactType(contactType);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { type: ContactType.EMAIL },
          orderBy: { id: 'asc' },
        });
        expect(result).toHaveLength(2);
      });

      it('ContactTypeとpersonIdで検索できる', async () => {
        // Arrange
        const contactType = ContactType.EMAIL;
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([
          {
            id: '323e4567-e89b-12d3-a456-426614174001',
            type: PrismaContactType.EMAIL,
            value: 'email@example.com',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
        ]);

        // Act
        const result = await repository.findByContactType(contactType, personId);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { type: ContactType.EMAIL, personId: '123e4567-e89b-12d3-a456-426614174001' },
          orderBy: { id: 'asc' },
        });
        expect(result).toHaveLength(1);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const contactType = ContactType.EMAIL;
        mockPrismaClient.contactAddress.findMany.mockRejectedValue(
          new Error('Query failed'),
        );

        // Act & Assert
        await expect(
          repository.findByContactType(contactType),
        ).rejects.toThrow('Query failed');
      });
    });
  });

  describe('list', () => {
    describe('正常系', () => {
      it('フィルタなしで全ContactAddressを取得できる', async () => {
        // Arrange
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([
          {
            id: '323e4567-e89b-12d3-a456-426614174001',
            type: PrismaContactType.EMAIL,
            value: 'email@example.com',
            personId: '123e4567-e89b-12d3-a456-426614174001',
            facilityId: null,
            organizationId: null,
          },
        ]);

        // Act
        const result = await repository.list();

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: {},
          orderBy: { id: 'asc' },
        });
        expect(result).toHaveLength(1);
      });

      it('personIdでフィルタできる', async () => {
        // Arrange
        const filters = { personId: new Id('123e4567-e89b-12d3-a456-426614174001') };
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { personId: '123e4567-e89b-12d3-a456-426614174001' },
          orderBy: { id: 'asc' },
        });
      });

      it('contactTypeでフィルタできる', async () => {
        // Arrange
        const filters = { contactType: ContactType.EMAIL };
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { type: ContactType.EMAIL },
          orderBy: { id: 'asc' },
        });
      });

      it('valueでフィルタできる（部分一致）', async () => {
        // Arrange
        const filters = { value: 'example.com' };
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: { value: { contains: 'example.com' } },
          orderBy: { id: 'asc' },
        });
      });

      it('複数フィルタを組み合わせて検索できる', async () => {
        // Arrange
        const filters = {
          personId: new Id('123e4567-e89b-12d3-a456-426614174001'),
          contactType: ContactType.EMAIL,
          value: '@example.com',
        };
        mockPrismaClient.contactAddress.findMany.mockResolvedValue([]);

        // Act
        await repository.list(filters);

        // Assert
        expect(mockPrismaClient.contactAddress.findMany).toHaveBeenCalledWith({
          where: {
            personId: '123e4567-e89b-12d3-a456-426614174001',
            type: ContactType.EMAIL,
            value: { contains: '@example.com' },
          },
          orderBy: { id: 'asc' },
        });
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        mockPrismaClient.contactAddress.findMany.mockRejectedValue(
          new Error('Database error'),
        );

        // Act & Assert
        await expect(repository.list()).rejects.toThrow('Database error');
      });
    });
  });

  describe('exists', () => {
    describe('正常系', () => {
      it('ContactAddressが存在する場合、trueを返す', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.count.mockResolvedValue(1);

        // Act
        const result = await repository.exists(id);

        // Assert
        expect(mockPrismaClient.contactAddress.count).toHaveBeenCalledWith({
          where: { id: '123e4567-e89b-12d3-a456-426614174005' },
        });
        expect(result).toBe(true);
      });

      it('ContactAddressが存在しない場合、falseを返す', async () => {
        // Arrange
        const id = new Id('999e4567-e89b-12d3-a456-426614174999');
        mockPrismaClient.contactAddress.count.mockResolvedValue(0);

        // Act
        const result = await repository.exists(id);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const id = new Id('123e4567-e89b-12d3-a456-426614174005');
        mockPrismaClient.contactAddress.count.mockRejectedValue(
          new Error('Count failed'),
        );

        // Act & Assert
        await expect(repository.exists(id)).rejects.toThrow('Count failed');
      });
    });
  });

  describe('existsByPersonIdAndType', () => {
    describe('正常系', () => {
      it('指定されたpersonIdとContactTypeのContactAddressが存在する場合、trueを返す', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        const contactType = ContactType.EMAIL;
        mockPrismaClient.contactAddress.count.mockResolvedValue(1);

        // Act
        const result = await repository.existsByPersonIdAndType(
          personId,
          contactType,
        );

        // Assert
        expect(mockPrismaClient.contactAddress.count).toHaveBeenCalledWith({
          where: {
            personId: '123e4567-e89b-12d3-a456-426614174001',
            type: ContactType.EMAIL,
          },
        });
        expect(result).toBe(true);
      });

      it('指定されたpersonIdとContactTypeのContactAddressが存在しない場合、falseを返す', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        const contactType = ContactType.PHONE;
        mockPrismaClient.contactAddress.count.mockResolvedValue(0);

        // Act
        const result = await repository.existsByPersonIdAndType(
          personId,
          contactType,
        );

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーをスローする', async () => {
        // Arrange
        const personId = new Id('123e4567-e89b-12d3-a456-426614174001');
        const contactType = ContactType.EMAIL;
        mockPrismaClient.contactAddress.count.mockRejectedValue(
          new Error('Count failed'),
        );

        // Act & Assert
        await expect(
          repository.existsByPersonIdAndType(personId, contactType),
        ).rejects.toThrow('Count failed');
      });
    });
  });
});
