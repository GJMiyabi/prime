import { Principal } from '../principal';
import { Account } from '../account';
import { Id } from '../../value-object/id';
import { PrincipalKind } from '../../type/principal-kind';

describe('Principal Entity', () => {
  describe('constructor', () => {
    it('should create a principal with required fields', () => {
      // Arrange
      const personId = new Id();
      const kind = PrincipalKind.STUDENT;

      // Act
      const principal = new Principal({
        personId,
        kind,
      });

      // Assert
      expect(principal.getId()).toBeDefined();
      expect(principal.getPersonId()).toBe(personId.value);
      expect(principal.getKind()).toBe(kind);
      expect(principal.getAccount()).toBeUndefined();
    });

    it('should create a principal with all fields', () => {
      // Arrange
      const id = new Id();
      const personId = new Id();
      const kind = PrincipalKind.TEACHER;
      const account = new Account({
        principalId: id,
        username: 'testuser',
        password: 'hashedpass',
      });

      // Act
      const principal = new Principal({
        id,
        personId,
        kind,
        account,
      });

      // Assert
      expect(principal.getId()).toBe(id.value);
      expect(principal.getPersonId()).toBe(personId.value);
      expect(principal.getKind()).toBe(kind);
      expect(principal.getAccount()).toEqual(account);
    });

    it('should generate a unique id if not provided', () => {
      // Arrange & Act
      const principal1 = new Principal({
        personId: new Id(),
        kind: PrincipalKind.ADMIN,
      });
      const principal2 = new Principal({
        personId: new Id(),
        kind: PrincipalKind.STUDENT,
      });

      // Assert
      expect(principal1.getId()).toBeDefined();
      expect(principal2.getId()).toBeDefined();
      expect(principal1.getId()).not.toBe(principal2.getId());
    });
  });

  describe('getId', () => {
    it('should return the principal id as string', () => {
      // Arrange
      const id = new Id();
      const principal = new Principal({
        id,
        personId: new Id(),
        kind: PrincipalKind.STUDENT,
      });

      // Act
      const result = principal.getId();

      // Assert
      expect(result).toBe(id.value);
      expect(typeof result).toBe('string');
    });
  });

  describe('getPersonId', () => {
    it('should return the person id as string', () => {
      // Arrange
      const personId = new Id();
      const principal = new Principal({
        personId,
        kind: PrincipalKind.TEACHER,
      });

      // Act
      const result = principal.getPersonId();

      // Assert
      expect(result).toBe(personId.value);
      expect(typeof result).toBe('string');
    });
  });

  describe('getKind', () => {
    it('should return ADMIN kind', () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.ADMIN,
      });

      // Act
      const result = principal.getKind();

      // Assert
      expect(result).toBe(PrincipalKind.ADMIN);
    });

    it('should return TEACHER kind', () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.TEACHER,
      });

      // Act
      const result = principal.getKind();

      // Assert
      expect(result).toBe(PrincipalKind.TEACHER);
    });

    it('should return STUDENT kind', () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.STUDENT,
      });

      // Act
      const result = principal.getKind();

      // Assert
      expect(result).toBe(PrincipalKind.STUDENT);
    });

    it('should return STAKEHOLDER kind', () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.STAKEHOLDER,
      });

      // Act
      const result = principal.getKind();

      // Assert
      expect(result).toBe(PrincipalKind.STAKEHOLDER);
    });
  });

  describe('getAccount', () => {
    it('should return undefined when no account is associated', () => {
      // Arrange
      const principal = new Principal({
        personId: new Id(),
        kind: PrincipalKind.STUDENT,
      });

      // Act
      const result = principal.getAccount();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the associated account', () => {
      // Arrange
      const principalId = new Id();
      const account = new Account({
        principalId,
        username: 'testuser',
        password: 'hashedpass',
        email: 'test@example.com',
      });
      const principal = new Principal({
        id: principalId,
        personId: new Id(),
        kind: PrincipalKind.TEACHER,
        account,
      });

      // Act
      const result = principal.getAccount();

      // Assert
      expect(result).toEqual(account);
      expect(result?.getUsername()).toBe('testuser');
      expect(result?.getEmail()).toBe('test@example.com');
    });
  });
});
