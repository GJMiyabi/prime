import { Account } from '../account';
import { Id } from '../../value-object/id';

describe('Account Entity', () => {
  describe('constructor', () => {
    it('should create an account with required fields and defaults', () => {
      // Arrange
      const principalId = new Id();
      const username = 'testuser';
      const password = 'hashedpassword123';

      // Act
      const account = new Account({
        principalId,
        username,
        password,
      });

      // Assert
      expect(account.getId()).toBeDefined();
      expect(account.getPrincipalId()).toBe(principalId.value);
      expect(account.getUsername()).toBe(username);
      expect(account.getPassword()).toBe(password);
      expect(account.getIsActive()).toBe(true);
      expect(account.isEnabled()).toBe(true);
      expect(account.getProvider()).toBe('auth0');
      expect(account.getProviderSub()).toBeNull();
      expect(account.getEmail()).toBeNull();
      expect(account.getLastLoginAt()).toBeNull();
    });

    it('should create an account with all fields', () => {
      // Arrange
      const id = new Id();
      const principalId = new Id();
      const username = 'testuser';
      const password = 'hashedpassword123';
      const isActive = false;
      const provider = 'google';
      const providerSub = 'google-sub-123';
      const email = 'test@example.com';
      const lastLoginAt = new Date('2024-01-01');

      // Act
      const account = new Account({
        id,
        principalId,
        username,
        password,
        isActive,
        provider,
        providerSub,
        email,
        lastLoginAt,
      });

      // Assert
      expect(account.getId()).toBe(id.value);
      expect(account.getPrincipalId()).toBe(principalId.value);
      expect(account.getUsername()).toBe(username);
      expect(account.getPassword()).toBe(password);
      expect(account.getIsActive()).toBe(isActive);
      expect(account.isEnabled()).toBe(isActive);
      expect(account.getProvider()).toBe(provider);
      expect(account.getProviderSub()).toBe(providerSub);
      expect(account.getEmail()).toBe(email);
      expect(account.getLastLoginAt()).toEqual(lastLoginAt);
    });

    it('should generate a unique id if not provided', () => {
      // Arrange & Act
      const account1 = new Account({
        principalId: new Id(),
        username: 'user1',
        password: 'pass1',
      });
      const account2 = new Account({
        principalId: new Id(),
        username: 'user2',
        password: 'pass2',
      });

      // Assert
      expect(account1.getId()).toBeDefined();
      expect(account2.getId()).toBeDefined();
      expect(account1.getId()).not.toBe(account2.getId());
    });
  });

  describe('getId', () => {
    it('should return the account id as string', () => {
      // Arrange
      const id = new Id();
      const account = new Account({
        id,
        principalId: new Id(),
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getId();

      // Assert
      expect(result).toBe(id.value);
      expect(typeof result).toBe('string');
    });
  });

  describe('getPrincipalId', () => {
    it('should return the principal id as string', () => {
      // Arrange
      const principalId = new Id();
      const account = new Account({
        principalId,
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getPrincipalId();

      // Assert
      expect(result).toBe(principalId.value);
      expect(typeof result).toBe('string');
    });
  });

  describe('getUsername', () => {
    it('should return the username', () => {
      // Arrange
      const username = 'testuser123';
      const account = new Account({
        principalId: new Id(),
        username,
        password: 'pass',
      });

      // Act
      const result = account.getUsername();

      // Assert
      expect(result).toBe(username);
    });
  });

  describe('getPassword', () => {
    it('should return the hashed password', () => {
      // Arrange
      const password = 'hashedpassword123';
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password,
      });

      // Act
      const result = account.getPassword();

      // Assert
      expect(result).toBe(password);
    });
  });

  describe('isEnabled and getIsActive', () => {
    it('should return true when account is active', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        isActive: true,
      });

      // Act & Assert
      expect(account.isEnabled()).toBe(true);
      expect(account.getIsActive()).toBe(true);
    });

    it('should return false when account is inactive', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        isActive: false,
      });

      // Act & Assert
      expect(account.isEnabled()).toBe(false);
      expect(account.getIsActive()).toBe(false);
    });
  });

  describe('getProvider', () => {
    it('should return default provider auth0', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getProvider();

      // Assert
      expect(result).toBe('auth0');
    });

    it('should return custom provider', () => {
      // Arrange
      const provider = 'google';
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        provider,
      });

      // Act
      const result = account.getProvider();

      // Assert
      expect(result).toBe(provider);
    });
  });

  describe('getProviderSub', () => {
    it('should return null when not provided', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getProviderSub();

      // Assert
      expect(result).toBeNull();
    });

    it('should return provider sub when provided', () => {
      // Arrange
      const providerSub = 'provider-sub-123';
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        providerSub,
      });

      // Act
      const result = account.getProviderSub();

      // Assert
      expect(result).toBe(providerSub);
    });
  });

  describe('getEmail', () => {
    it('should return null when not provided', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getEmail();

      // Assert
      expect(result).toBeNull();
    });

    it('should return email when provided', () => {
      // Arrange
      const email = 'test@example.com';
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        email,
      });

      // Act
      const result = account.getEmail();

      // Assert
      expect(result).toBe(email);
    });
  });

  describe('getLastLoginAt', () => {
    it('should return null when not provided', () => {
      // Arrange
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
      });

      // Act
      const result = account.getLastLoginAt();

      // Assert
      expect(result).toBeNull();
    });

    it('should return last login date when provided', () => {
      // Arrange
      const lastLoginAt = new Date('2024-01-15T10:30:00Z');
      const account = new Account({
        principalId: new Id(),
        username: 'test',
        password: 'pass',
        lastLoginAt,
      });

      // Act
      const result = account.getLastLoginAt();

      // Assert
      expect(result).toEqual(lastLoginAt);
    });
  });
});
