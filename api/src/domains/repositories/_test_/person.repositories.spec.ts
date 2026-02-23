/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  IPersonCommandRepository,
  IPersonQueryRepository,
} from '../person.repositories';
import { Person } from '../../entities/person';
import { Id } from '../../value-object/id';

// Mock implementation for testing
class MockPersonCommandRepository extends IPersonCommandRepository {
  async create(person: Person): Promise<Person> {
    return person;
  }

  async update(person: Person): Promise<Person> {
    return person;
  }

  async delete(id: Id): Promise<void> {
    return;
  }
}

class MockPersonQueryRepository extends IPersonQueryRepository {
  async find(
    id: Id,
    include?: {
      contacts?: boolean;
      principal?: { include?: { account?: boolean } };
      facilities?: boolean;
      organization?: boolean;
    },
  ): Promise<Person | undefined> {
    return new Person({ id, name: 'Test Person' });
  }

  async list(): Promise<Person[]> {
    return [];
  }
}

describe('IPersonCommandRepository', () => {
  let repository: IPersonCommandRepository;

  beforeEach(() => {
    repository = new MockPersonCommandRepository();
  });

  describe('create', () => {
    it('should create a person and return it', async () => {
      // Arrange
      const person = new Person({
        id: new Id(),
        name: 'John Doe',
      });

      // Act
      const result = await repository.create(person);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Person);
      expect(result.getName()).toBe('John Doe');
    });

    it('should accept person with all fields', async () => {
      // Arrange
      const person = new Person({
        id: new Id(),
        name: 'Jane Smith',
        contacts: [],
        facilities: [],
      });

      // Act
      const result = await repository.create(person);

      // Assert
      expect(result).toBeDefined();
      expect(result.getName()).toBe('Jane Smith');
    });
  });

  describe('update', () => {
    it('should update a person and return it', async () => {
      // Arrange
      const person = new Person({
        id: new Id(),
        name: 'Updated Name',
      });

      // Act
      const result = await repository.update(person);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Person);
      expect(result.getName()).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a person by id', async () => {
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

describe('IPersonQueryRepository', () => {
  let repository: IPersonQueryRepository;

  beforeEach(() => {
    repository = new MockPersonQueryRepository();
  });

  describe('find', () => {
    it('should find a person by id', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Person);
      expect(result?.getId()).toEqual(id);
    });

    it('should accept include options for contacts', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, { contacts: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept include options for principal with account', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, {
        principal: { include: { account: true } },
      });

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

    it('should accept include options for organization', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, { organization: true });

      // Assert
      expect(result).toBeDefined();
    });

    it('should accept multiple include options', async () => {
      // Arrange
      const id = new Id();

      // Act
      const result = await repository.find(id, {
        contacts: true,
        principal: { include: { account: true } },
        facilities: true,
        organization: true,
      });

      // Assert
      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent person', async () => {
      // Arrange
      const repository = new (class extends IPersonQueryRepository {
        async find(
          _id: Id,
          _include?: {
            contacts?: boolean;
            principal?: { include?: { account?: boolean } };
            facilities?: boolean;
            organization?: boolean;
          },
        ): Promise<Person | undefined> {
          return undefined;
        }
        async list(): Promise<Person[]> {
          return [];
        }
      })();
      const id = new Id();

      // Act
      const result = await repository.find(id);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return list of persons', async () => {
      // Act
      const result = await repository.list();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no persons exist', async () => {
      // Act
      const result = await repository.list();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return array of Person instances', async () => {
      // Arrange
      const repository = new (class extends IPersonQueryRepository {
        async find(
          _id: Id,
          _include?: {
            contacts?: boolean;
            principal?: { include?: { account?: boolean } };
            facilities?: boolean;
            organization?: boolean;
          },
        ): Promise<Person | undefined> {
          return undefined;
        }
        async list(): Promise<Person[]> {
          return [
            new Person({ id: new Id(), name: 'Person 1' }),
            new Person({ id: new Id(), name: 'Person 2' }),
          ];
        }
      })();

      // Act
      const result = await repository.list();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Person);
      expect(result[1]).toBeInstanceOf(Person);
    });
  });
});
