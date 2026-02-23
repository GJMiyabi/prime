import { ContactAddress } from '../contact-address';
import { Id } from '../../value-object/id';
import { ContactType } from '../../type/contact';

describe('ContactAddress Entity', () => {
  describe('constructor', () => {
    it('should create a contact address with required fields', () => {
      // Arrange
      const value = 'test@example.com';
      const type = ContactType.EMAIL;

      // Act
      const contactAddress = new ContactAddress({ value, type });

      // Assert
      expect(contactAddress.getValue()).toBe(value);
      expect(contactAddress.getType()).toBe(type);
      expect(contactAddress.getId()).toBeDefined();
      expect(contactAddress.getPersonId()).toBeUndefined();
      expect(contactAddress.getOrganizationId()).toBeUndefined();
      expect(contactAddress.getFacilityId()).toBeUndefined();
    });

    it('should create a contact address with all fields', () => {
      // Arrange
      const id = new Id();
      const personId = new Id();
      const organizationId = new Id();
      const facilityId = new Id();
      const value = '123-456-7890';
      const type = ContactType.PHONE;

      // Act
      const contactAddress = new ContactAddress({
        id,
        personId,
        organizationId,
        facilityId,
        value,
        type,
      });

      // Assert
      expect(contactAddress.getId()).toBe(id.value);
      expect(contactAddress.getPersonId()).toBe(personId.value);
      expect(contactAddress.getOrganizationId()).toBe(organizationId.value);
      expect(contactAddress.getFacilityId()).toBe(facilityId.value);
      expect(contactAddress.getValue()).toBe(value);
      expect(contactAddress.getType()).toBe(type);
    });

    it('should generate an id if not provided', () => {
      // Arrange & Act
      const contactAddress = new ContactAddress({
        value: 'test@example.com',
        type: ContactType.EMAIL,
      });

      // Assert
      expect(contactAddress.getId()).toBeDefined();
      expect(typeof contactAddress.getId()).toBe('string');
    });
  });

  describe('getId', () => {
    it('should return the contact address id as string', () => {
      // Arrange
      const id = new Id();
      const contactAddress = new ContactAddress({
        id,
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getId();

      // Assert
      expect(result).toBe(id.value);
    });
  });

  describe('getPersonId', () => {
    it('should return undefined when no personId', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getPersonId();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the person id as string', () => {
      // Arrange
      const personId = new Id();
      const contactAddress = new ContactAddress({
        personId,
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getPersonId();

      // Assert
      expect(result).toBe(personId.value);
    });
  });

  describe('getOrganizationId', () => {
    it('should return undefined when no organizationId', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getOrganizationId();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the organization id as string', () => {
      // Arrange
      const organizationId = new Id();
      const contactAddress = new ContactAddress({
        organizationId,
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getOrganizationId();

      // Assert
      expect(result).toBe(organizationId.value);
    });
  });

  describe('getFacilityId', () => {
    it('should return undefined when no facilityId', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getFacilityId();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the facility id as string', () => {
      // Arrange
      const facilityId = new Id();
      const contactAddress = new ContactAddress({
        facilityId,
        value: 'test',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getFacilityId();

      // Assert
      expect(result).toBe(facilityId.value);
    });
  });

  describe('getValue', () => {
    it('should return the contact value', () => {
      // Arrange
      const value = 'test@example.com';
      const contactAddress = new ContactAddress({
        value,
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getValue();

      // Assert
      expect(result).toBe(value);
    });
  });

  describe('getType', () => {
    it('should return EMAIL type', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: 'test@example.com',
        type: ContactType.EMAIL,
      });

      // Act
      const result = contactAddress.getType();

      // Assert
      expect(result).toBe(ContactType.EMAIL);
    });

    it('should return PHONE type', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: '123-456-7890',
        type: ContactType.PHONE,
      });

      // Act
      const result = contactAddress.getType();

      // Assert
      expect(result).toBe(ContactType.PHONE);
    });

    it('should return ADDRESS type', () => {
      // Arrange
      const contactAddress = new ContactAddress({
        value: '123 Main St',
        type: ContactType.ADDRESS,
      });

      // Act
      const result = contactAddress.getType();

      // Assert
      expect(result).toBe(ContactType.ADDRESS);
    });
  });
});
