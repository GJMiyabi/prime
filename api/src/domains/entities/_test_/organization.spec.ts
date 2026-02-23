import { Organization } from '../organization';
import { Id } from '../../value-object/id';

describe('Organization Entity', () => {
  describe('constructor', () => {
    it('should create an organization with required fields', () => {
      // Arrange
      const id = new Id();
      const name = 'Test Organization';
      const idNumber = 'ORG-001';

      // Act
      const organization = new Organization({ id, name, idNumber });

      // Assert
      expect(organization.getId()).toBe(id.value);
      expect(organization.getName()).toBe(name);
      expect(organization.getIDNumber()).toBe(idNumber);
      expect(organization.getPersons()).toEqual([]);
      expect(organization.getFacilities()).toEqual([]);
      expect(organization.getContactAddresses()).toEqual([]);
    });

    it('should create an organization with all optional fields', () => {
      // Arrange
      const id = new Id();
      const name = 'Test Organization';
      const idNumber = 'ORG-002';
      const persons = [];
      const facilities = [];
      const contactAddress = [];

      // Act
      const organization = new Organization({
        id,
        name,
        idNumber,
        persons,
        facilities,
        contactAddress,
      });

      // Assert
      expect(organization.getPersons()).toEqual(persons);
      expect(organization.getFacilities()).toEqual(facilities);
      expect(organization.getContactAddresses()).toEqual(contactAddress);
    });
  });

  describe('getId and getIdVO', () => {
    it('should return id as string', () => {
      // Arrange
      const id = new Id();
      const organization = new Organization({
        id,
        name: 'Test',
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getId();

      // Assert
      expect(result).toBe(id.value);
      expect(typeof result).toBe('string');
    });

    it('should return id as Id value object', () => {
      // Arrange
      const id = new Id();
      const organization = new Organization({
        id,
        name: 'Test',
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getIdVO();

      // Assert
      expect(result).toEqual(id);
      expect(result).toBeInstanceOf(Id);
    });
  });

  describe('getName', () => {
    it('should return the organization name', () => {
      // Arrange
      const name = 'Test Organization';
      const organization = new Organization({
        id: new Id(),
        name,
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getName();

      // Assert
      expect(result).toBe(name);
    });
  });

  describe('getIDNumber', () => {
    it('should return the organization ID number', () => {
      // Arrange
      const idNumber = 'ORG-123';
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber,
      });

      // Act
      const result = organization.getIDNumber();

      // Assert
      expect(result).toBe(idNumber);
    });
  });

  describe('rename', () => {
    it('should update the organization name', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Old Name',
        idNumber: 'ORG-001',
      });
      const newName = 'New Name';

      // Act
      organization.rename(newName);

      // Assert
      expect(organization.getName()).toBe(newName);
    });
  });

  describe('setIDNumber', () => {
    it('should update the organization ID number', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });
      const newIdNumber = 'ORG-999';

      // Act
      organization.setIDNumber(newIdNumber);

      // Assert
      expect(organization.getIDNumber()).toBe(newIdNumber);
    });
  });

  describe('attachPersons', () => {
    it('should attach persons to organization', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });
      const persons = [];

      // Act
      organization.attachPersons(persons);

      // Assert
      expect(organization.getPersons()).toEqual(persons);
    });
  });

  describe('attachFacilities', () => {
    it('should attach facilities to organization', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });
      const facilities = [];

      // Act
      organization.attachFacilities(facilities);

      // Assert
      expect(organization.getFacilities()).toEqual(facilities);
    });
  });

  describe('attachContactAddress', () => {
    it('should attach contact addresses to organization', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });
      const contactAddress = [];

      // Act
      organization.attachContactAddress(contactAddress);

      // Assert
      expect(organization.getContactAddresses()).toEqual(contactAddress);
    });
  });

  describe('getPersons', () => {
    it('should return empty array when no persons', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getPersons();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getFacilities', () => {
    it('should return empty array when no facilities', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getFacilities();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getContactAddresses', () => {
    it('should return empty array when no contact addresses', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test',
        idNumber: 'ORG-001',
      });

      // Act
      const result = organization.getContactAddresses();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
