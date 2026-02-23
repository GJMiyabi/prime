import { Facility } from '../facility';
import { Id } from '../../value-object/id';

describe('Facility Entity', () => {
  describe('constructor', () => {
    it('should create a facility with required fields using Id', () => {
      // Arrange
      const id = new Id();
      const name = 'Test Facility';
      const idNumber = 'FAC-001';

      // Act
      const facility = new Facility({ id, name, idNumber });

      // Assert
      expect(facility.getId()).toBe(id.value);
      expect(facility.getName()).toBe(name);
      expect(facility.getIDNumber()).toBe(idNumber);
      expect(facility.getOrganizationId()).toBeUndefined();
      expect(facility.getPersons()).toEqual([]);
      expect(facility.getContactAddresses()).toEqual([]);
    });

    it('should create a facility with string id', () => {
      // Arrange
      const idString = new Id().value;
      const name = 'Test Facility';
      const idNumber = 'FAC-002';

      // Act
      const facility = new Facility({ id: idString, name, idNumber });

      // Assert
      expect(facility.getId()).toBe(idString);
      expect(facility.getName()).toBe(name);
      expect(facility.getIDNumber()).toBe(idNumber);
    });

    it('should create a facility with organizationId as Id', () => {
      // Arrange
      const id = new Id();
      const organizationId = new Id();
      const name = 'Test Facility';
      const idNumber = 'FAC-003';

      // Act
      const facility = new Facility({
        id,
        name,
        idNumber,
        organizationId,
      });

      // Assert
      expect(facility.getOrganizationId()).toBe(organizationId.value);
      expect(facility.getOrganizationIdVO()).toEqual(organizationId);
    });

    it('should create a facility with organizationId as string', () => {
      // Arrange
      const id = new Id();
      const organizationIdString = new Id().value;
      const name = 'Test Facility';
      const idNumber = 'FAC-004';

      // Act
      const facility = new Facility({
        id,
        name,
        idNumber,
        organizationId: organizationIdString,
      });

      // Assert
      expect(facility.getOrganizationId()).toBe(organizationIdString);
    });

    it('should handle null organizationId', () => {
      // Arrange
      const id = new Id();
      const name = 'Test Facility';
      const idNumber = 'FAC-005';

      // Act
      const facility = new Facility({
        id,
        name,
        idNumber,
        organizationId: null,
      });

      // Assert
      expect(facility.getOrganizationId()).toBeUndefined();
    });
  });

  describe('getId and getIdVO', () => {
    it('should return id as string', () => {
      // Arrange
      const id = new Id();
      const facility = new Facility({
        id,
        name: 'Test',
        idNumber: 'FAC-001',
      });

      // Act
      const result = facility.getId();

      // Assert
      expect(result).toBe(id.value);
      expect(typeof result).toBe('string');
    });

    it('should return id as Id value object', () => {
      // Arrange
      const id = new Id();
      const facility = new Facility({
        id,
        name: 'Test',
        idNumber: 'FAC-001',
      });

      // Act
      const result = facility.getIdVO();

      // Assert
      expect(result).toEqual(id);
      expect(result).toBeInstanceOf(Id);
    });
  });

  describe('rename', () => {
    it('should update the facility name', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Old Name',
        idNumber: 'FAC-001',
      });
      const newName = 'New Name';

      // Act
      facility.rename(newName);

      // Assert
      expect(facility.getName()).toBe(newName);
    });
  });

  describe('setIDNumber', () => {
    it('should update the facility ID number', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test Facility',
        idNumber: 'FAC-001',
      });
      const newIdNumber = 'FAC-999';

      // Act
      facility.setIDNumber(newIdNumber);

      // Assert
      expect(facility.getIDNumber()).toBe(newIdNumber);
    });
  });

  describe('setOrganizationId', () => {
    it('should set organization id as Id', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test',
        idNumber: 'FAC-001',
      });
      const orgId = new Id();

      // Act
      facility.setOrganizationId(orgId);

      // Assert
      expect(facility.getOrganizationId()).toBe(orgId.value);
    });

    it('should set organization id as string', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test',
        idNumber: 'FAC-001',
      });
      const orgIdString = new Id().value;

      // Act
      facility.setOrganizationId(orgIdString);

      // Assert
      expect(facility.getOrganizationId()).toBe(orgIdString);
    });

    it('should clear organization id when set to null', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test',
        idNumber: 'FAC-001',
        organizationId: new Id(),
      });

      // Act
      facility.setOrganizationId(null);

      // Assert
      expect(facility.getOrganizationId()).toBeUndefined();
    });
  });

  describe('attachPersons', () => {
    it('should attach persons to facility', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test',
        idNumber: 'FAC-001',
      });
      const persons = [];

      // Act
      facility.attachPersons(persons);

      // Assert
      expect(facility.getPersons()).toEqual(persons);
    });
  });

  describe('attachContactAddresses', () => {
    it('should attach contact addresses to facility', () => {
      // Arrange
      const facility = new Facility({
        id: new Id(),
        name: 'Test',
        idNumber: 'FAC-001',
      });
      const contacts = [];

      // Act
      facility.attachContactAddresses(contacts);

      // Assert
      expect(facility.getContactAddresses()).toEqual(contacts);
    });
  });
});
