import { FacilityInteractor } from './interactor';
import {
  IFacilityCommandRepository,
  IFacilityQueryRepository,
} from '../../domains/repositories/facility.repositories';
import {
  IContactAddressCommandRepository,
  IContactAddressQueryRepository,
} from '../../domains/repositories/contract-address.repositories';
import { IPersonQueryRepository } from '../../domains/repositories/person.repositories';
import { Facility } from '../../domains/entities/facility';
import { ContactAddress } from '../../domains/entities/contact-address';
import { Person } from '../../domains/entities/person';
import { Id } from '../../domains/value-object/id';
import { ContactType } from '../../domains/type/contact';
import { FacilityCreateDto, FacilityUpdateDto } from './input-port';

describe('FacilityInteractor', () => {
  let interactor: FacilityInteractor;
  let facilityCommandRepository: jest.Mocked<IFacilityCommandRepository>;
  let facilityQueryRepository: jest.Mocked<IFacilityQueryRepository>;
  let contactAddressCommandRepository: jest.Mocked<IContactAddressCommandRepository>;
  let contactAddressQueryRepository: jest.Mocked<IContactAddressQueryRepository>;
  let personQueryRepository: jest.Mocked<IPersonQueryRepository>;

  beforeEach(() => {
    facilityCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    facilityQueryRepository = {
      find: jest.fn(),
      findAll: jest.fn(),
    } as any;

    contactAddressCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkCreate: jest.fn(),
      bulkDelete: jest.fn(),
    } as any;

    contactAddressQueryRepository = {
      find: jest.fn(),
      findMany: jest.fn(),
      findByFacilityId: jest.fn(),
    } as any;

    personQueryRepository = {
      find: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
    } as any;

    interactor = new FacilityInteractor(
      facilityCommandRepository,
      facilityQueryRepository,
      contactAddressCommandRepository,
      contactAddressQueryRepository,
      personQueryRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('施設を正常に作成', async () => {
      // Arrange
      const input: FacilityCreateDto = {
        name: 'Test Facility',
        idNumber: 'FAC001',
        contactValue: 'facility@example.com',
      };

      const mockFacilityId = '550e8400-e29b-41d4-a716-446655440000';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440001';

      const mockFacility = new Facility({
        id: new Id(mockFacilityId),
        name: input.name,
        idNumber: input.idNumber,
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        facilityId: new Id(mockFacilityId),
        value: input.contactValue,
      });

      facilityCommandRepository.create.mockResolvedValue(mockFacility);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      const result = await interactor.create(input);

      // Assert
      expect(result).toEqual({
        id: mockFacilityId,
        name: 'Test Facility',
        idNumber: 'FAC001',
        contactAddresses: [
          {
            id: mockContactId,
            type: ContactType.EMAIL,
            value: 'facility@example.com',
          },
        ],
        persons: [],
        organizationId: undefined,
      });

      expect(facilityCommandRepository.create).toHaveBeenCalledTimes(1);
      expect(contactAddressCommandRepository.create).toHaveBeenCalledTimes(1);
    });

    it('contactTypeを指定して施設を作成', async () => {
      // Arrange
      const input: FacilityCreateDto = {
        name: 'Test Facility',
        idNumber: 'FAC002',
        contactValue: '03-1234-5678',
        contactType: ContactType.PHONE,
      };

      const mockFacilityId = '550e8400-e29b-41d4-a716-446655440002';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440003';

      const mockFacility = new Facility({
        id: new Id(mockFacilityId),
        name: input.name,
        idNumber: input.idNumber,
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.PHONE,
        facilityId: new Id(mockFacilityId),
        value: input.contactValue,
      });

      facilityCommandRepository.create.mockResolvedValue(mockFacility);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      const result = await interactor.create(input);

      // Assert
      expect(result.contactAddresses).toBeDefined();
      expect(result.contactAddresses![0].type).toBe(ContactType.PHONE);
      expect(contactAddressCommandRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ContactType.PHONE,
        }),
      );
    });

    it('personIdを指定して施設を作成', async () => {
      // Arrange
      const personId = '550e8400-e29b-41d4-a716-446655440004';
      const input: FacilityCreateDto = {
        name: 'Test Facility',
        idNumber: 'FAC003',
        contactValue: 'facility@example.com',
        personId,
      };

      const mockFacilityId = '550e8400-e29b-41d4-a716-446655440005';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440006';

      const mockPerson = new Person({
        id: new Id(personId),
        name: 'Test Person',
      });

      const mockFacility = new Facility({
        id: new Id(mockFacilityId),
        name: input.name,
        idNumber: input.idNumber,
        persons: [mockPerson],
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        facilityId: new Id(mockFacilityId),
        value: input.contactValue,
      });

      personQueryRepository.find.mockResolvedValue(mockPerson);
      facilityCommandRepository.create.mockResolvedValue(mockFacility);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      const result = await interactor.create(input);

      // Assert
      expect(result.persons).toEqual([personId]);
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId }),
      );
    });

    it('personIdが存在しない場合は空のpersonsで施設を作成', async () => {
      // Arrange
      const input: FacilityCreateDto = {
        name: 'Test Facility',
        idNumber: 'FAC004',
        contactValue: 'facility@example.com',
        personId: '550e8400-e29b-41d4-a716-446655440007',
      };

      const mockFacilityId = '550e8400-e29b-41d4-a716-446655440008';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440009';

      const mockFacility = new Facility({
        id: new Id(mockFacilityId),
        name: input.name,
        idNumber: input.idNumber,
        persons: [],
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        facilityId: new Id(mockFacilityId),
        value: input.contactValue,
      });

      personQueryRepository.find.mockResolvedValue(undefined);
      facilityCommandRepository.create.mockResolvedValue(mockFacility);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      const result = await interactor.create(input);

      // Assert
      expect(result.persons).toEqual([]);
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '550e8400-e29b-41d4-a716-446655440007',
        }),
      );
    });

    it('作成エラー時はエラーをスロー', async () => {
      // Arrange
      const input: FacilityCreateDto = {
        name: 'Test Facility',
        idNumber: 'FAC005',
        contactValue: 'facility@example.com',
      };

      facilityCommandRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(interactor.create(input)).rejects.toThrow(
        'Failed to create facility: Database error',
      );
    });
  });

  describe('update', () => {
    it('施設名を更新', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440008';
      const input: FacilityUpdateDto = {
        id: facilityId,
        name: 'Updated Facility Name',
      };

      const mockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Old Facility Name',
        idNumber: 'FAC006',
      });

      const updatedMockFacility = new Facility({
        id: new Id(facilityId),
        name: input.name!,
        idNumber: 'FAC006',
      });

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      facilityCommandRepository.update.mockResolvedValue(updatedMockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe('Updated Facility Name');
      expect(facilityCommandRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Facility Name',
        }),
      );
    });

    it('施設番号を更新', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440009';
      const input: FacilityUpdateDto = {
        id: facilityId,
        idNumber: 'NEW-FAC007',
      };

      const mockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: 'OLD-FAC007',
      });

      const updatedMockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: input.idNumber!,
      });

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      facilityCommandRepository.update.mockResolvedValue(updatedMockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data!.idNumber).toBe('NEW-FAC007');
    });

    it('organizationIdを更新', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440010';
      const organizationId = '550e8400-e29b-41d4-a716-446655440011';
      const input: FacilityUpdateDto = {
        id: facilityId,
        organizationId,
      };

      const mockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: 'FAC008',
      });

      const updatedMockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: 'FAC008',
        organizationId,
      });

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      facilityCommandRepository.update.mockResolvedValue(updatedMockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data!.organizationId).toBe(organizationId);
    });

    it('personsを更新（IDのリストを渡す）', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440012';
      const personId1 = '550e8400-e29b-41d4-a716-446655440013';
      const personId2 = '550e8400-e29b-41d4-a716-446655440014';
      const input: FacilityUpdateDto = {
        id: facilityId,
        persons: [personId1, personId2],
      };

      const mockPerson1 = new Person({
        id: new Id(personId1),
        name: 'Person 1',
      });

      const mockPerson2 = new Person({
        id: new Id(personId2),
        name: 'Person 2',
      });

      const mockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: 'FAC009',
      });

      const updatedMockFacility = new Facility({
        id: new Id(facilityId),
        name: 'Test Facility',
        idNumber: 'FAC009',
        persons: [mockPerson1, mockPerson2],
      });

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      personQueryRepository.find
        .mockResolvedValueOnce(mockPerson1)
        .mockResolvedValueOnce(mockPerson2);
      facilityCommandRepository.update.mockResolvedValue(updatedMockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data!.persons).toEqual([personId1, personId2]);
      expect(personQueryRepository.find).toHaveBeenCalledTimes(2);
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId1 }),
      );
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId2 }),
      );
    });

    it('contactAddressesを追加', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440015';
      const input: FacilityUpdateDto = {
        id: facilityId,
        contactAddresses: [
          {
            value: 'new@example.com',
            type: ContactType.EMAIL,
          },
        ],
      };

      const mockFacility = Object.assign(
        new Facility({
          id: new Id(facilityId),
          name: 'Test Facility',
          idNumber: 'FAC010',
        }),
        {
          getContactAddresses: jest.fn().mockReturnValue([]),
        },
      );

      const mockContactAddress = new ContactAddress({
        id: new Id('550e8400-e29b-41d4-a716-446655440016'),
        type: ContactType.EMAIL,
        facilityId: new Id(facilityId),
        value: 'new@example.com',
      });

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );
      facilityCommandRepository.update.mockResolvedValue(mockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(contactAddressCommandRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ContactType.EMAIL,
          value: 'new@example.com',
        }),
      );
      expect(result.data).toBeDefined();
    });

    it('contactAddressesを更新（IDあり）', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440017';
      const contactId = '550e8400-e29b-41d4-a716-446655440018';
      const input: FacilityUpdateDto = {
        id: facilityId,
        contactAddresses: [
          {
            id: contactId,
            value: 'updated@example.com',
            type: ContactType.EMAIL,
          },
        ],
      };

      const existingContactAddress = new ContactAddress({
        id: new Id(contactId),
        type: ContactType.EMAIL,
        facilityId: new Id(facilityId),
        value: 'old@example.com',
      });

      const mockFacility = Object.assign(
        new Facility({
          id: new Id(facilityId),
          name: 'Test Facility',
          idNumber: 'FAC011',
        }),
        {
          getContactAddresses: jest
            .fn()
            .mockReturnValue([existingContactAddress]),
        },
      );

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      contactAddressQueryRepository.find.mockResolvedValue(
        existingContactAddress,
      );
      facilityCommandRepository.update.mockResolvedValue(mockFacility);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(contactAddressQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: contactId }),
      );
      expect(result.data).toBeDefined();
    });

    it('施設が存在しない場合は失敗レスポンスを返す', async () => {
      // Arrange
      const input: FacilityUpdateDto = {
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'Updated Name',
      };

      facilityQueryRepository.find.mockResolvedValue(undefined);

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.result).toBe(false);
      expect(result.message).toBe('該当するデータがありません');
    });

    it('更新エラー時は失敗レスポンスを返す', async () => {
      // Arrange
      const facilityId = '550e8400-e29b-41d4-a716-446655440022';
      const input: FacilityUpdateDto = {
        id: facilityId,
        name: 'Updated Name',
      };

      const mockFacility = Object.assign(
        new Facility({
          id: new Id(facilityId),
          name: 'Old Name',
          idNumber: 'FAC013',
        }),
        {
          getContactAddresses: jest.fn().mockReturnValue([]),
        },
      );

      facilityQueryRepository.find.mockResolvedValue(mockFacility);
      facilityCommandRepository.update.mockRejectedValue(
        new Error('Update failed'),
      );

      // Act
      const result = await interactor.update(input);

      // Assert
      expect(result.result).toBe(false);
      expect(result.message).toContain('Update failed');
    });
  });
});
