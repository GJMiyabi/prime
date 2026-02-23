/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  IAccountCommandRepository,
  IAccountQueryRepository,
} from '../account.repositories';
import { Account } from '../../entities/account';
import { Id } from '../../value-object/id';

// Mock implementations for testing
class MockAccountCommandRepository extends IAccountCommandRepository {
  async create(data: Account): Promise<Account> {
    return data;
  }

  async update(data: Account): Promise<Account> {
    return data;
  }

  async delete(principalId: Id): Promise<void> {
    return;
  }
}

class MockAccountQueryRepository extends IAccountQueryRepository {
  async findByPrincipalId(principalId: string): Promise<Account | undefined> {
    return new Account({
      principalId: new Id(principalId),
      username: 'testuser',
      password: 'hashedpass',
    });
  }

  async findByUsername(username: string): Promise<Account | undefined> {
    return new Account({
      principalId: new Id(),
      username,
      password: 'hashedpass',
    });
  }
}

describe('IAccountCommandRepository', () => {
  let repository: IAccountCommandRepository;

  beforeEach(() => {
    repository = new MockAccountCommandRepository();
  });

  describe('create', () => {
    it('should create an account and return it', async () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'newuser',
        password: 'hashedpassword',
      });

      // Act
      const result = await repository.create(account);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result.getUsername()).toBe('newuser');
    });

    it('should accept account with all optional fields', async () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'fulluser',
        password: 'hashedpass',
        email: 'full@example.com',
        provider: 'google',
        isActive: true,
      });

      // Act
      const result = await repository.create(account);

      // Assert
      expect(result).toBeDefined();
      expect(result.getEmail()).toBe('full@example.com');
      expect(result.getProvider()).toBe('google');
    });
  });

  describe('update', () => {
    it('should update an account and return it', async () => {
      // Arrange
      const account = new Account({
        id: new Id(),
        principalId: new Id(),
        username: 'updateduser',
        password: 'newhashedpass',
      });

      // Act
      const result = await repository.update(account);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result.getUsername()).toBe('updateduser');
    });
  });

  describe('delete', () => {
    it('should delete an account by principal id', async () => {
      // Arrange
      const principalId = new Id();

      // Act & Assert
      await expect(repository.delete(principalId)).resolves.toBeUndefined();
    });

    it('should accept Id value object', async () => {
      // Arrange
      const principalId = new Id();

      // Act
      const result = await repository.delete(principalId);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});

describe('IAccountQueryRepository', () => {
  let repository: IAccountQueryRepository;

  beforeEach(() => {
    repository = new MockAccountQueryRepository();
  });

  describe('findByPrincipalId', () => {
    it('should find an account by principal id', async () => {
      // Arrange
      const principalId = new Id().value;

      // Act
      const result = await repository.findByPrincipalId(principalId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result?.getPrincipalId()).toBe(principalId);
    });

    it('should accept string principal id', async () => {
      // Arrange
      const principalId = new Id().value;

      // Act
      const result = await repository.findByPrincipalId(principalId);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result?.getPrincipalId()).toBe('string');
    });

    it('should return undefined for non-existent principal', async () => {
      // Arrange
      const repository = new (class extends IAccountQueryRepository {
        async findByPrincipalId(
          _principalId: string,
        ): Promise<Account | undefined> {
          return undefined;
        }
        async findByUsername(_username: string): Promise<Account | undefined> {
          return undefined;
        }
      })();
      const principalId = new Id().value;

      // Act
      const result = await repository.findByPrincipalId(principalId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    it('should find an account by username', async () => {
      // Arrange
      const username = 'testuser123';

      // Act
      const result = await repository.findByUsername(username);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Account);
      expect(result?.getUsername()).toBe(username);
    });

    it('should accept any string as username', async () => {
      // Arrange
      const username = 'user@example.com';

      // Act
      const result = await repository.findByUsername(username);

      // Assert
      expect(result).toBeDefined();
      expect(result?.getUsername()).toBe(username);
    });

    it('should return undefined for non-existent username', async () => {
      // Arrange
      const repository = new (class extends IAccountQueryRepository {
        async findByPrincipalId(
          _principalId: string,
        ): Promise<Account | undefined> {
          return undefined;
        }
        async findByUsername(_username: string): Promise<Account | undefined> {
          return undefined;
        }
      })();
      const username = 'nonexistent';

      // Act
      const result = await repository.findByUsername(username);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle special characters in username', async () => {
      // Arrange
      const username = 'user+tag@example.com';

      // Act
      const result = await repository.findByUsername(username);

      // Assert
      expect(result).toBeDefined();
      expect(result?.getUsername()).toBe(username);
    });
  });
});
