import { PersonInteractor } from './interactor';
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from '../../domains/repositories/person.repositories';
import { IPrincipalCommandRepository } from '../../domains/repositories/principal.repositories';
import { IAccountCommandRepository } from '../../domains/repositories/account.repositories';
import { IContactAddressCommandRepository } from '../../domains/repositories/contract-address.repositories';
import { Person } from '../../domains/entities/person';
import { ContactAddress } from '../../domains/entities/contact-address';
import { Id } from '../../domains/value-object/id';
import { PrincipalKind } from '../../domains/type/principal-kind';
import { ContactType } from '../../domains/type/contact';
import { AdminPersonCreateDto, PersonCreateDto } from './input-port';

describe('PersonInteractor', () => {
  let interactor: PersonInteractor;
  let personCommandRepository: jest.Mocked<IPersonCommandRepository>;
  let personQueryRepository: jest.Mocked<IPersonQueryRepository>;
  let principalCommandRepository: jest.Mocked<IPrincipalCommandRepository>;
  let accountCommandRepository: jest.Mocked<IAccountCommandRepository>;
  let contactAddressCommandRepository: jest.Mocked<IContactAddressCommandRepository>;

  beforeEach(() => {
    personCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    personQueryRepository = {
      find: jest.fn(),
      findAll: jest.fn(),
    } as any;

    principalCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    accountCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    contactAddressCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    interactor = new PersonInteractor(
      personCommandRepository,
      personQueryRepository,
      principalCommandRepository,
      accountCommandRepository,
      contactAddressCommandRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('管理者を正常に作成', async () => {
      // Arrange
      const input: AdminPersonCreateDto = {
        name: 'Admin User',
        contactType: ContactType.EMAIL,
        contactValue: 'admin@example.com',
      };

      const mockPersonId = '550e8400-e29b-41d4-a716-446655440000';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440001';

      const mockPerson = new Person({
        id: new Id(mockPersonId),
        name: input.name,
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        personId: new Id(mockPersonId),
        value: input.contactValue,
      });

      personCommandRepository.create.mockResolvedValue(mockPerson);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );
      principalCommandRepository.create.mockResolvedValue(undefined as any);
      accountCommandRepository.create.mockResolvedValue(undefined as any);

      // Act
      const result = await interactor.createAdmin(input);

      // Assert
      expect(result).toEqual({
        id: mockPersonId,
        name: 'Admin User',
        contacts: [
          {
            id: mockContactId,
            type: ContactType.EMAIL,
            value: 'admin@example.com',
          },
        ],
        principal: expect.objectContaining({
          kind: PrincipalKind.ADMIN,
        }),
      });

      expect(personCommandRepository.create).toHaveBeenCalledTimes(1);
      expect(contactAddressCommandRepository.create).toHaveBeenCalledTimes(1);
      expect(principalCommandRepository.create).toHaveBeenCalledTimes(1);
      expect(accountCommandRepository.create).toHaveBeenCalledTimes(1);
    });

    it('データベースエラー時はエラーをスロー', async () => {
      // Arrange
      const input: AdminPersonCreateDto = {
        name: 'Admin User',
        contactType: ContactType.EMAIL,
        contactValue: 'admin@example.com',
      };

      personCommandRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(interactor.createAdmin(input)).rejects.toThrow(
        'Failed to create admin: Database error',
      );
    });
  });

  describe('createPerson', () => {
    it('一般ユーザーを正常に作成', async () => {
      // Arrange
      const input: PersonCreateDto = {
        name: 'John Doe',
        contactType: ContactType.EMAIL,
        contactValue: 'john@example.com',
      };

      const mockPersonId = '550e8400-e29b-41d4-a716-446655440002';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440003';

      const mockPerson = new Person({
        id: new Id(mockPersonId),
        name: input.name,
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        personId: new Id(mockPersonId),
        value: input.contactValue,
      });

      personCommandRepository.create.mockResolvedValue(mockPerson);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      const result = await interactor.createPerson(input);

      // Assert
      expect(result).toEqual({
        id: mockPersonId,
        name: 'John Doe',
        contacts: [
          {
            id: mockContactId,
            type: ContactType.EMAIL,
            value: 'john@example.com',
          },
        ],
      });

      expect(personCommandRepository.create).toHaveBeenCalledTimes(1);
      expect(contactAddressCommandRepository.create).toHaveBeenCalledTimes(1);
    });

    it('contactTypeが指定されていない場合はデフォルトでEMAIL', async () => {
      // Arrange
      const input: PersonCreateDto = {
        name: 'Jane Doe',
        contactValue: 'jane@example.com',
      };

      const mockPersonId = '550e8400-e29b-41d4-a716-446655440004';
      const mockContactId = '550e8400-e29b-41d4-a716-446655440005';

      const mockPerson = new Person({
        id: new Id(mockPersonId),
        name: input.name,
      });

      const mockContactAddress = new ContactAddress({
        id: new Id(mockContactId),
        type: ContactType.EMAIL,
        personId: new Id(mockPersonId),
        value: input.contactValue,
      });

      personCommandRepository.create.mockResolvedValue(mockPerson);
      contactAddressCommandRepository.create.mockResolvedValue(
        mockContactAddress,
      );

      // Act
      await interactor.createPerson(input);

      // Assert
      expect(contactAddressCommandRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ContactType.EMAIL,
        }),
      );
    });

    it('作成エラー時はエラーをスロー', async () => {
      // Arrange
      const input: PersonCreateDto = {
        name: 'John Doe',
        contactValue: 'john@example.com',
      };

      personCommandRepository.create.mockRejectedValue(
        new Error('Create failed'),
      );

      // Act & Assert
      await expect(interactor.createPerson(input)).rejects.toThrow(
        'Failed to create person: Create failed',
      );
    });
  });

  describe('find', () => {
    it('IDでユーザーを検索', async () => {
      // Arrange
      const personId = '550e8400-e29b-41d4-a716-446655440006';
      const mockPerson = new Person({
        id: new Id(personId),
        name: 'Test User',
      });

      personQueryRepository.find.mockResolvedValue(mockPerson);

      // Act
      const result = await interactor.find(personId);

      // Assert
      expect(result).toEqual({
        id: personId,
        name: 'Test User',
      });
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId }),
        undefined,
      );
    });

    it('存在しないIDの場合はundefinedを返す', async () => {
      // Arrange
      const invalidId = '550e8400-e29b-41d4-a716-446655440999';
      personQueryRepository.find.mockResolvedValue(undefined);

      // Act
      const result = await interactor.find(invalidId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('includeオプション付きで検索', async () => {
      // Arrange
      const personId = '550e8400-e29b-41d4-a716-446655440007';
      const mockPerson = new Person({
        id: new Id(personId),
        name: 'Test User',
      });

      const includeOptions = {
        contacts: true,
        principal: { include: { account: true } },
      };

      personQueryRepository.find.mockResolvedValue(mockPerson);

      // Act
      await interactor.find(personId, includeOptions);

      // Assert
      expect(personQueryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId }),
        includeOptions,
      );
    });

    it('検索エラー時はエラーをスロー', async () => {
      // Arrange
      const validId = '550e8400-e29b-41d4-a716-446655440008';
      personQueryRepository.find.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(interactor.find(validId)).rejects.toThrow(
        'Failed to find person: Query failed',
      );
    });
  });

  describe('delete', () => {
    it('ユーザーを正常に削除', async () => {
      // Arrange
      const personId = '550e8400-e29b-41d4-a716-446655440009';
      personCommandRepository.delete.mockResolvedValue(undefined);

      // Act
      await interactor.delete(personId);

      // Assert
      expect(personCommandRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: personId }),
      );
    });

    it('削除エラー時はエラーをスロー', async () => {
      // Arrange
      const personId = '550e8400-e29b-41d4-a716-446655440010';
      personCommandRepository.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      // Act & Assert
      await expect(interactor.delete(personId)).rejects.toThrow(
        'Failed to delete person: Delete failed',
      );
    });
  });
});
