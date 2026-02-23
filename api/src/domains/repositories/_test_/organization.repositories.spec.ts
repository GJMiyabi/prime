/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  IOrganizationCommandRepository,
  IOrganizationQueryRepository,
} from '../organization.repositories';
import { Organization } from '../../entities/organization';
import { Id } from '../../value-object/id';

// Mock implementations for testing
class MockOrganizationCommandRepository extends IOrganizationCommandRepository {
  async create(o: Organization): Promise<Organization> {
    return o;
  }

  async delete(id: Id): Promise<void> {
    return;
  }
}

class MockOrganizationQueryRepository extends IOrganizationQueryRepository {
  async find(
    id: Id,
    include?: {
      contactAddresses?: boolean;
      persons?: boolean;
      facilities?: boolean;
    },
  ): Promise<Organization | undefined> {
    return new Organization({
      id,
      name: 'Test Organization',
      idNumber: 'ORG-001',
    });
  }
}

describe('IOrganizationCommandRepository', () => {
  let repository: IOrganizationCommandRepository;

  beforeEach(() => {
    repository = new MockOrganizationCommandRepository();
  });

  describe('create', () => {
    it('should create an organization and return it', async () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'New Organization',
        idNumber: 'ORG-100',
      });

      // Act
      const result = await repository.create(organization);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Organization);
      expect(result.getName()).toBe('New Organization');
      expect(result.getIDNumber()).toBe('ORG-100');
    });

    it('should accept organization with all fields', async () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Full Organization',
        idNumber: 'ORG-200',
        persons: [],
        facilities: [],
        contactAddress: [],
      });

      // Act
      const result = await repository.create(organization);

      // Assert
      expect(result).toBeDefined();
      expect(result.getPersons()).toEqual([]);
      expect(result.getFacilities()).toEqual([]);
      expect(result.getContactAddresses()).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an organization by id', async () => {
      // Arrange
      const id = new Id();

      // Act & Assert
      await expect(repository.delete(id)).resolves.toBeUndefined();
    });

    it('should accept Id value object', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});

describe('IOrganizationQueryRepository', () => {
  let repository: IOrganizationQueryRepository;

  beforeEach(() => {
    repository = new MockOrganizationQueryRepository();
  });

  describe('find', () => {
    it('should find an organization by id', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Organization);
      expect(result?.getId()).toBe(id.value);
    });

    it('should accept include options for contact addresses', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, { contactAddresses: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept include options for persons', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, { persons: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept include options for facilities', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, { facilities: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept multiple include options', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, {
        contactAddresses: true,
        persons: true,
        facilities: true,
      });

      // Assert
      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent organization', async () => {
      // Arrange
      const repository = new (class extends IOrganizationQueryRepository {
        async find(
          _id: Id,
          _include?: {
            contactAddresses?: boolean;
            persons?: boolean;
            facilities?: boolean;
          },
        ): Promise<Organization | undefined> {
          return undefined;
        }
      })();
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
