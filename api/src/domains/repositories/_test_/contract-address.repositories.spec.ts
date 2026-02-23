/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  IContactAddressCommandRepository,
  IContactAddressQueryRepository,
  ContactAddressQueryFilters,
} from '../contract-address.repositories';
import { ContactAddress } from '../../entities/contact-address';
import { Id } from '../../value-object/id';
import { ContactType } from '../../type/contact';

// Mock implementations for testing
class MockContactAddressCommandRepository extends IContactAddressCommandRepository {
  async create(contactAddress: ContactAddress): Promise<ContactAddress> {
    return contactAddress;
  }

  async update(contactAddress: ContactAddress): Promise<ContactAddress> {
    return contactAddress;
  }

  async delete(id: Id): Promise<void> {
    return;
  }

  async deleteByPersonId(personId: Id): Promise<void> {
    return;
  }

  async bulkCreate(
    contactAddresses: ContactAddress[],
  ): Promise<ContactAddress[]> {
    return contactAddresses;
  }
}

class MockContactAddressQueryRepository extends IContactAddressQueryRepository {
  async find(id: Id): Promise<ContactAddress | undefined> {
    return new ContactAddress({
      id,
      value: 'test@example.com',
      type: ContactType.EMAIL,
    });
  }

  async findByPersonId(personId: Id): Promise<ContactAddress[]> {
    return [];
  }

  async findByContactType(
    contactType: ContactType,
    personId?: Id,
  ): Promise<ContactAddress[]> {
    return [];
  }

  async list(filters?: ContactAddressQueryFilters): Promise<ContactAddress[]> {
    return [];
  }

  async exists(id: Id): Promise<boolean> {
    return true;
  }

  async existsByPersonIdAndType(
    personId: Id,
    contactType: ContactType,
  ): Promise<boolean> {
    return true;
  }
}

describe('IContactAddressCommandRepository', () => {
  let repository: IContactAddressCommandRepository;

  beforeEach(() => {
    repository = new MockContactAddressCommandRepository();
  });

  describe('create', () => {
    it('should create a contact address and return it', async () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: 'test@example.com',
        type: ContactType.EMAIL,
      });

      // Act
      const result = await repository.create(contactAddress);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ContactAddress);
      expect(result.getValue()).toBe('test@example.com');
      expect(result.getType()).toBe(ContactType.EMAIL);
    });

    it('should accept contact address with person id', async () => {
      // Arrange
      const contactAddress = new ContactAddress({
        personId: new Id(),
        value: '123-456-7890',
        type: ContactType.PHONE,
      });

      // Act
      const result = await repository.create(contactAddress);

      // Assert
      expect(result).toBeDefined();
      expect(result.getPersonId()).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a contact address and return it', async () => {
      // Arrange
      const contactAddress = new ContactAddress({
        id: new Id(),
        value: 'updated@example.com',
        type: ContactType.EMAIL,
      });

      // Act
      const result = await repository.update(contactAddress);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ContactAddress);
      expect(result.getValue()).toBe('updated@example.com');
    });
  });

  describe('delete', () => {
    it('should delete a contact address by id', async () => {
      // Arrange
      const id = new Id();

      // Act & Assert
      await expect(repository.delete(id)).resolves.toBeUndefined();
    });
  });

  describe('deleteByPersonId', () => {
    it('should delete all contact addresses for a person', async () => {
      // Arrange
      const personId = new Id();

      // Act & Assert
      await expect(
        repository.deleteByPersonId(personId),
      ).resolves.toBeUndefined();
    });

    it('should accept Id value object', async () => {
      // Arrange
      const personId = new Id();

      // Act
      const result = await repository.deleteByPersonId(personId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple contact addresses', async () => {
      // Arrange
      const contactAddresses = [
        new ContactAddress({
          value: 'email1@example.com',
          type: ContactType.EMAIL,
        }),
        new ContactAddress({
          value: 'email2@example.com',
          type: ContactType.EMAIL,
        }),
        new ContactAddress({
          value: '123-456-7890',
          type: ContactType.PHONE,
        }),
      ];

      // Act
      const result = await repository.bulkCreate(contactAddresses);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should accept empty array', async () => {
      // Arrange
      const contactAddresses: ContactAddress[] = [];

      // Act
      const result = await repository.bulkCreate(contactAddresses);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

describe('IContactAddressQueryRepository', () => {
  let repository: IContactAddressQueryRepository;

  beforeEach(() => {
    repository = new MockContactAddressQueryRepository();
  });

  describe('find', () => {
    it('should find a contact address by id', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ContactAddress);
      expect(result?.getId()).toBe(id.value);
    });

    it('should return undefined for non-existent id', async () => {
      // Arrange
      const repository = new (class extends IContactAddressQueryRepository {
        async find(_id: Id): Promise<ContactAddress | undefined> {
          return undefined;
        }
        async findByPersonId(_personId: Id): Promise<ContactAddress[]> {
          return [];
        }
        async findByContactType(
          _contactType: ContactType,
          _personId?: Id,
        ): Promise<ContactAddress[]> {
          return [];
        }
        async list(
          _filters?: ContactAddressQueryFilters,
        ): Promise<ContactAddress[]> {
          return [];
        }
        async exists(_id: Id): Promise<boolean> {
          return false;
        }
        async existsByPersonIdAndType(
          _personId: Id,
          _contactType: ContactType,
        ): Promise<boolean> {
          return false;
        }
      })();
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findByPersonId', () => {
    it('should find all contact addresses for a person', async () => {
      // Arrange
      const personId = new Id();

      // Act
      const result = await repository.findByPersonId(personId);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findByContactType', () => {
    it('should find contact addresses by type', async () => {
      // Arrange
      const contactType = ContactType.EMAIL;

      // Act
      const result = await repository.findByContactType(contactType);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept optional person id', async () => {
      // Arrange
      const contactType = ContactType.PHONE;
      const personId = new Id();

      // Act
      const result = await repository.findByContactType(contactType, personId);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should work with all contact types', async () => {
      // Arrange & Act & Assert
      for (const type of Object.values(ContactType)) {
        const result = await repository.findByContactType(type);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('list', () => {
    it('should return all contact addresses', async () => {
      // Act
      const result = await repository.list();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept filter by person id', async () => {
      // Arrange
      const filters: ContactAddressQueryFilters = {
        personId: new Id(),
      };

      // Act
      const result = await repository.list(filters);

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept filter by contact type', async () => {
      // Arrange
      const filters: ContactAddressQueryFilters = {
        contactType: ContactType.EMAIL,
      };

      // Act
      const result = await repository.list(filters);

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept filter by value', async () => {
      // Arrange
      const filters: ContactAddressQueryFilters = {
        value: 'test@example.com',
      };

      // Act
      const result = await repository.list(filters);

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept filter by isActive', async () => {
      // Arrange
      const filters: ContactAddressQueryFilters = {
        isActive: true,
      };

      // Act
      const result = await repository.list(filters);

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept multiple filters', async () => {
      // Arrange
      const filters: ContactAddressQueryFilters = {
        personId: new Id(),
        contactType: ContactType.EMAIL,
        isActive: true,
      };

      // Act
      const result = await repository.list(filters);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('exists', () => {
    it('should return true when contact address exists', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.exists(id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when contact address does not exist', async () => {
      // Arrange
      const repository = new (class extends IContactAddressQueryRepository {
        async find(_id: Id): Promise<ContactAddress | undefined> {
          return undefined;
        }
        async findByPersonId(_personId: Id): Promise<ContactAddress[]> {
          return [];
        }
        async findByContactType(
          _contactType: ContactType,
          _personId?: Id,
        ): Promise<ContactAddress[]> {
          return [];
        }
        async list(
          _filters?: ContactAddressQueryFilters,
        ): Promise<ContactAddress[]> {
          return [];
        }
        async exists(_id: Id): Promise<boolean> {
          return false;
        }
        async existsByPersonIdAndType(
          _personId: Id,
          _contactType: ContactType,
        ): Promise<boolean> {
          return false;
        }
      })();
      const id = new Id();

      // Act
      const result = await repository.exists(id);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('existsByPersonIdAndType', () => {
    it('should return true when contact exists for person and type', async () => {
      // Arrange
      const personId = new Id();
      const contactType = ContactType.EMAIL;

      // Act
      const result = await repository.existsByPersonIdAndType(
        personId,
        contactType,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should work with all contact types', async () => {
      // Arrange
      const personId = new Id();

      // Act & Assert
      for (const type of Object.values(ContactType)) {
        const result = await repository.existsByPersonIdAndType(personId, type);
        expect(typeof result).toBe('boolean');
      }
    });
  });
});
