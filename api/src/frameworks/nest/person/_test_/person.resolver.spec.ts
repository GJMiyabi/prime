import { Test } from '@nestjs/testing';
import {
  PersonMutationResolver,
  PersonQueryResolver,
} from '../person.resolver';
import { IPersonInputPort } from 'src/usecases/person/input-port';
import { ContactType } from 'src/domains/type/contact';
import { PrincipalKind } from 'src/domains/type/principal-kind';

describe('PersonMutationResolver', () => {
  let mutationResolver: PersonMutationResolver;
  const mockPersonInputPort = {
    createAdmin: jest.fn(),
    createPerson: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  beforeAll(() => {
    mutationResolver = new PersonMutationResolver(
      mockPersonInputPort as unknown as IPersonInputPort,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveAdminPerson', () => {
    describe('正常系', () => {
      it('名前・メールアドレス・タイプを指定してAdmin Personを作成できる', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        const mockAdmin = {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Admin User',
          contacts: [{ value: 'admin@example.com', type: ContactType.EMAIL }],
        };
        mockPersonInputPort.createAdmin.mockResolvedValue(mockAdmin);

        // Act
        const result = await mutationResolver.saveAdminPerson(input);

        // Assert
        expect(result).toEqual({
          __type: 'AdminPerson',
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Admin User',
          value: 'admin@example.com',
          type: ContactType.EMAIL,
        });
        expect(mockPersonInputPort.createAdmin).toHaveBeenCalledWith({
          id: undefined,
          name: 'Admin User',
          contactValue: 'admin@example.com',
          contactType: ContactType.EMAIL,
        });
      });

      it('ID付きでAdmin Personを作成できる', async () => {
        // Arrange
        const input = {
          id: '123e4567-e89b-12d3-a456-426614174008',
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        const mockAdmin = {
          id: '123e4567-e89b-12d3-a456-426614174008',
          name: 'Admin User',
          contacts: [{ value: 'admin@example.com', type: ContactType.EMAIL }],
        };
        mockPersonInputPort.createAdmin.mockResolvedValue(mockAdmin);

        // Act
        const result = await mutationResolver.saveAdminPerson(input);

        // Assert
        expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174008');
        expect(mockPersonInputPort.createAdmin).toHaveBeenCalledWith({
          id: '123e4567-e89b-12d3-a456-426614174008',
          name: 'Admin User',
          contactValue: 'admin@example.com',
          contactType: ContactType.EMAIL,
        });
      });

      it('contactsが空でもデフォルト値でAdmin Personを返す', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        const mockAdmin = {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Admin User',
          contacts: [],
        };
        mockPersonInputPort.createAdmin.mockResolvedValue(mockAdmin);

        // Act
        const result = await mutationResolver.saveAdminPerson(input);

        // Assert
        expect(result.value).toBe('');
        expect(result.type).toBe('EMAIL');
      });

      it('contactsがundefinedでもデフォルト値でAdmin Personを返す', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        const mockAdmin = {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Admin User',
          contacts: undefined,
        };
        mockPersonInputPort.createAdmin.mockResolvedValue(mockAdmin);

        // Act
        const result = await mutationResolver.saveAdminPerson(input);

        // Assert
        expect(result.value).toBe('');
        expect(result.type).toBe('EMAIL');
      });
    });

    describe('異常系', () => {
      it('nameが存在しない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          value: 'admin@example.com',
          type: 'EMAIL',
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('name field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('nameが文字列でない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 123,
          value: 'admin@example.com',
          type: 'EMAIL',
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('name field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('valueが存在しない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          type: 'EMAIL',
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('value field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('valueが文字列でない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 123,
          type: 'EMAIL',
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('value field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('typeが存在しない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('type field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('typeが文字列でない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 123,
        };

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('type field is required and must be a string');
        expect(mockPersonInputPort.createAdmin).not.toHaveBeenCalled();
      });

      it('createAdminでエラーが発生した場合、エラーメッセージをラップしてスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        const originalError = new Error('Database connection failed');
        mockPersonInputPort.createAdmin.mockRejectedValue(originalError);

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow(
          'Failed to create admin person: Database connection failed',
        );
        expect(mockPersonInputPort.createAdmin).toHaveBeenCalled();
      });

      it('createAdminで不明なエラーが発生した場合、デフォルトメッセージでスローする', async () => {
        // Arrange
        const input = {
          name: 'Admin User',
          value: 'admin@example.com',
          type: 'EMAIL',
        };
        mockPersonInputPort.createAdmin.mockRejectedValue('String error');

        // Act & Assert
        await expect(
          mutationResolver.saveAdminPerson(input),
        ).rejects.toThrow('Failed to create admin person: Unknown error');
        expect(mockPersonInputPort.createAdmin).toHaveBeenCalled();
      });
    });
  });

  describe('createSinglePerson', () => {
    describe('正常系', () => {
      it('名前・メールアドレスを指定してSingle Personを作成できる', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 'john@example.com',
        };
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          contacts: [{ value: 'john@example.com', type: ContactType.EMAIL }],
        };
        mockPersonInputPort.createPerson.mockResolvedValue(mockPerson);

        // Act
        const result = await mutationResolver.createSinglePerson(input);

        // Assert
        expect(result).toEqual({
          __type: 'SinglePerson',
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          value: 'john@example.com',
        });
        expect(mockPersonInputPort.createPerson).toHaveBeenCalledWith({
          name: 'John Doe',
          contactValue: 'john@example.com',
          contactType: ContactType.EMAIL,
        });
      });

      it('contactsが空の場合、デフォルト値でSingle Personを返す', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 'john@example.com',
        };
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          contacts: [],
        };
        mockPersonInputPort.createPerson.mockResolvedValue(mockPerson);

        // Act
        const result = await mutationResolver.createSinglePerson(input);

        // Assert
        expect(result.value).toBe('');
      });

      it('contactsがundefinedの場合、デフォルト値でSingle Personを返す', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 'john@example.com',
        };
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          contacts: undefined,
        };
        mockPersonInputPort.createPerson.mockResolvedValue(mockPerson);

        // Act
        const result = await mutationResolver.createSinglePerson(input);

        // Assert
        expect(result.value).toBe('');
      });
    });

    describe('異常系', () => {
      it('nameが存在しない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          value: 'john@example.com',
        };

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('name field is required and must be a string');
        expect(mockPersonInputPort.createPerson).not.toHaveBeenCalled();
      });

      it('nameが文字列でない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 123,
          value: 'john@example.com',
        };

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('name field is required and must be a string');
        expect(mockPersonInputPort.createPerson).not.toHaveBeenCalled();
      });

      it('valueが存在しない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
        };

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('value field is required and must be a string');
        expect(mockPersonInputPort.createPerson).not.toHaveBeenCalled();
      });

      it('valueが文字列でない場合、エラーをスローする', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 123,
        };

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('value field is required and must be a string');
        expect(mockPersonInputPort.createPerson).not.toHaveBeenCalled();
      });

      it('createPersonでエラーが発生した場合、エラーメッセージをラップしてスローする', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 'john@example.com',
        };
        const originalError = new Error('Validation failed');
        mockPersonInputPort.createPerson.mockRejectedValue(originalError);

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('Failed to create person: Validation failed');
        expect(mockPersonInputPort.createPerson).toHaveBeenCalled();
      });

      it('createPersonで不明なエラーが発生した場合、デフォルトメッセージでスローする', async () => {
        // Arrange
        const input = {
          name: 'John Doe',
          value: 'john@example.com',
        };
        mockPersonInputPort.createPerson.mockRejectedValue('String error');

        // Act & Assert
        await expect(
          mutationResolver.createSinglePerson(input),
        ).rejects.toThrow('Failed to create person: Unknown error');
        expect(mockPersonInputPort.createPerson).toHaveBeenCalled();
      });
    });
  });

  describe('deletePerson', () => {
    describe('正常系', () => {
      it('指定されたIDのPersonを削除できる', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        mockPersonInputPort.delete.mockResolvedValue(undefined);

        // Act
        const result = await mutationResolver.deletePerson(id);

        // Assert
        expect(result).toBe(true);
        expect(mockPersonInputPort.delete).toHaveBeenCalledWith(id);
      });
    });

    describe('異常系', () => {
      it('削除処理でエラーが発生した場合、エラーメッセージをラップしてスローする', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const originalError = new Error('Person not found');
        mockPersonInputPort.delete.mockRejectedValue(originalError);

        // Act & Assert
        await expect(mutationResolver.deletePerson(id)).rejects.toThrow(
          'Failed to delete person: Person not found',
        );
        expect(mockPersonInputPort.delete).toHaveBeenCalledWith(id);
      });

      it('削除処理で不明なエラーが発生した場合、デフォルトメッセージでスローする', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        mockPersonInputPort.delete.mockRejectedValue(
          'Unknown deletion error',
        );

        // Act & Assert
        await expect(mutationResolver.deletePerson(id)).rejects.toThrow(
          'Failed to delete person: Unknown error',
        );
        expect(mockPersonInputPort.delete).toHaveBeenCalledWith(id);
      });
    });
  });
});

describe('PersonQueryResolver', () => {
  let queryResolver: PersonQueryResolver;
  const mockPersonInputPort = {
    createAdmin: jest.fn(),
    createPerson: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  beforeAll(() => {
    queryResolver = new PersonQueryResolver(
      mockPersonInputPort as unknown as IPersonInputPort,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findPerson', () => {
    describe('正常系', () => {
      it('IDでPersonを検索できる（includeとinfoなし）', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
        };
        mockPersonInputPort.find.mockResolvedValue(mockPerson);

        // Act
        const result = await queryResolver.findPerson(id);

        // Assert
        expect(result).toEqual({
          __type: 'Person',
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
        });
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: undefined,
          facilities: false,
          organization: false,
        });
      });

      it('includeを指定してPersonを検索できる', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const include = {
          contacts: true,
          facilities: true,
          organization: true,
        };
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          contacts: [{ value: 'john@example.com', type: ContactType.EMAIL }],
          facilities: [{ id: '423e4567-e89b-12d3-a456-426614174001', name: 'Facility A' }],
          organization: { id: 'org-1', name: 'Organization A' },
        };
        mockPersonInputPort.find.mockResolvedValue(mockPerson);

        // Act
        const result = await queryResolver.findPerson(id, include);

        // Assert
        expect(result).toBeDefined();
        expect(result!.__type).toBe('Person');
        expect(result!.contacts).toBeDefined();
        expect(result!.facilities).toBeDefined();
        expect(result!.organization).toBeDefined();
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: true,
          principal: undefined,
          facilities: true,
          organization: true,
        });
      });

      it('include.principalにaccountを含めて検索できる', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const include = {
          contacts: false,
          principal: {
            include: {
              account: true,
            },
          },
        };
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          principal: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            account: { username: 'johndoe' },
          },
        };
        mockPersonInputPort.find.mockResolvedValue(mockPerson);

        // Act
        const result = await queryResolver.findPerson(id, include);

        // Assert
        expect(result).toBeDefined();
        expect(result!.principal).toBeDefined();
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: {
            include: {
              account: true,
            },
          },
          facilities: false,
          organization: false,
        });
      });

      it.skip('GraphQLResolveInfoからselectionTreeを使ってcontactsを含める', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const info = {
          fieldNodes: [
            {
              selectionSet: {
                selections: [
                  {
                    kind: 'Field',
                    name: { value: 'contacts' },
                  },
                ],
              },
            },
          ],
        } as any;
        const mockPerson = {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
          contacts: [{ value: 'john@example.com', type: ContactType.EMAIL }],
        };
        mockPersonInputPort.find.mockResolvedValue(mockPerson);

        // Act
        const result = await queryResolver.findPerson(id, undefined, info);

        // Assert
        expect(result).toBeDefined();
        expect(result!.contacts).toBeDefined();
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(
          id,
          expect.objectContaining({
            contacts: true,
          }),
        );
      });

      it('Personが見つからない場合、nullを返す', async () => {
        // Arrange
        const id = '999e4567-e89b-12d3-a456-426614174999';
        mockPersonInputPort.find.mockResolvedValue(null);

        // Act
        const result = await queryResolver.findPerson(id);

        // Assert
        expect(result).toBeNull();
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: undefined,
          facilities: false,
          organization: false,
        });
      });

      it('Personがundefinedの場合、nullを返す', async () => {
        // Arrange
        const id = '999e4567-e89b-12d3-a456-426614174999';
        mockPersonInputPort.find.mockResolvedValue(undefined);

        // Act
        const result = await queryResolver.findPerson(id);

        // Assert
        expect(result).toBeNull();
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: undefined,
          facilities: false,
          organization: false,
        });
      });
    });

    describe('異常系', () => {
      it('検索処理でエラーが発生した場合、エラーメッセージをラップしてスローする', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        const originalError = new Error('Database query failed');
        mockPersonInputPort.find.mockRejectedValue(originalError);

        // Act & Assert
        await expect(queryResolver.findPerson(id)).rejects.toThrow(
          'Failed to find person: Database query failed',
        );
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: undefined,
          facilities: false,
          organization: false,
        });
      });

      it('検索処理で不明なエラーが発生した場合、デフォルトメッセージでスローする', async () => {
        // Arrange
        const id = '123e4567-e89b-12d3-a456-426614174001';
        mockPersonInputPort.find.mockRejectedValue('Unknown find error');

        // Act & Assert
        await expect(queryResolver.findPerson(id)).rejects.toThrow(
          'Failed to find person: Unknown error',
        );
        expect(mockPersonInputPort.find).toHaveBeenCalledWith(id, {
          contacts: false,
          principal: undefined,
          facilities: false,
          organization: false,
        });
      });
    });
  });
});
