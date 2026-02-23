import { Person } from '../person';
import { Id } from '../../value-object/id';
import { ContactAddress } from '../contact-address';
import { Principal } from '../principal';
import { Facility } from '../facility';
import { Organization } from '../organization';
import { ContactType } from '../../type/contact';
import { PrincipalKind } from '../../type/principal-kind';

describe('Person Entity', () => {
  describe('constructor', () => {
    it('should create a person with required fields', () => {
      // Arrange
      const id = new Id();
      const name = 'John Doe';

      // Act
      const person = new Person({ id, name });

      // Assert
      expect(person.getId()).toEqual(id);
      expect(person.getName()).toBe(name);
      expect(person.getContacts()).toEqual([]);
      expect(person.getFacilities()).toEqual([]);
      expect(person.getPrincipal()).toBeUndefined();
      expect(person.getOrganization()).toBeUndefined();
    });

    it('should create a person with all fields', () => {
      // Arrange
      const id = new Id();
      const name = 'Jane Smith';
      const contactAddress = new ContactAddress({
        value: 'jane@example.com',
        type: ContactType.EMAIL,
      });
      const principal = new Principal({
        personId: id,
        kind: PrincipalKind.TEACHER,
      });
      const facility = new Facility({
        id: new Id(),
        name: 'Test Facility',
        idNumber: 'FAC-001',
      });
      const organization = new Organization({
        id: new Id(),
        name: 'Test Organization',
        idNumber: 'ORG-001',
      });

      // Act
      const person = new Person({
        id,
        name,
        contacts: [contactAddress],
        principal,
        facilities: [facility],
        organization,
      });

      // Assert
      expect(person.getId()).toEqual(id);
      expect(person.getName()).toBe(name);
      expect(person.getContacts()).toHaveLength(1);
      expect(person.getPrincipal()).toEqual(principal);
      expect(person.getFacilities()).toHaveLength(1);
      expect(person.getOrganization()).toEqual(organization);
    });
  });

  describe('getId', () => {
    it('should return the person id', () => {
      // Arrange
      const id = new Id();
      const person = new Person({ id, name: 'Test Person' });

      // Act
      const result = person.getId();

      // Assert
      expect(result).toEqual(id);
    });
  });

  describe('getName', () => {
    it('should return the person name', () => {
      // Arrange
      const name = 'Test Person';
      const person = new Person({ id: new Id(), name });

      // Act
      const result = person.getName();

      // Assert
      expect(result).toBe(name);
    });
  });

  describe('getContacts', () => {
    it('should return empty array when no contacts', () => {
      // Arrange
      const person = new Person({ id: new Id(), name: 'Test' });

      // Act
      const result = person.getContacts();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return all contacts', () => {
      // Arrange
      const contacts = [
        new ContactAddress({
          value: 'test@example.com',
          type: ContactType.EMAIL,
        }),
        new ContactAddress({
          value: '123-456-7890',
          type: ContactType.PHONE,
        }),
      ];
      const person = new Person({
        id: new Id(),
        name: 'Test',
        contacts,
      });

      // Act
      const result = person.getContacts();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(contacts);
    });
  });

  describe('getPrincipal', () => {
    it('should return undefined when no principal', () => {
      // Arrange
      const person = new Person({ id: new Id(), name: 'Test' });

      // Act
      const result = person.getPrincipal();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the principal', () => {
      // Arrange
      const personId = new Id();
      const principal = new Principal({
        personId,
        kind: PrincipalKind.STUDENT,
      });
      const person = new Person({
        id: personId,
        name: 'Test',
        principal,
      });

      // Act
      const result = person.getPrincipal();

      // Assert
      expect(result).toEqual(principal);
    });
  });

  describe('getFacilities', () => {
    it('should return undefined when no facilities', () => {
      // Arrange
      const person = new Person({ id: new Id(), name: 'Test' });

      // Act
      const result = person.getFacilities();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return all facilities', () => {
      // Arrange
      const facilities = [
        new Facility({
          id: new Id(),
          name: 'Facility 1',
          idNumber: 'FAC-001',
        }),
        new Facility({
          id: new Id(),
          name: 'Facility 2',
          idNumber: 'FAC-002',
        }),
      ];
      const person = new Person({
        id: new Id(),
        name: 'Test',
        facilities,
      });

      // Act
      const result = person.getFacilities();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(facilities);
    });
  });

  describe('getOrganization', () => {
    it('should return undefined when no organization', () => {
      // Arrange
      const person = new Person({ id: new Id(), name: 'Test' });

      // Act
      const result = person.getOrganization();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the organization', () => {
      // Arrange
      const organization = new Organization({
        id: new Id(),
        name: 'Test Org',
        idNumber: 'ORG-001',
      });
      const person = new Person({
        id: new Id(),
        name: 'Test',
        organization,
      });

      // Act
      const result = person.getOrganization();

      // Assert
      expect(result).toEqual(organization);
    });
  });
});
