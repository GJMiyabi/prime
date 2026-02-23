import { ContactType } from '../contact';

describe('ContactType Enum', () => {
  describe('enum values', () => {
    it('should have EMAIL value', () => {
      // Act & Assert
      expect(ContactType.EMAIL).toBe('EMAIL');
    });

    it('should have PHONE value', () => {
      // Act & Assert
      expect(ContactType.PHONE).toBe('PHONE');
    });

    it('should have ADDRESS value', () => {
      // Act & Assert
      expect(ContactType.ADDRESS).toBe('ADDRESS');
    });
  });

  describe('enum membership', () => {
    it('should contain all expected values', () => {
      // Arrange
      const expectedValues = ['EMAIL', 'PHONE', 'ADDRESS'];

      // Act
      const actualValues = Object.values(ContactType);

      // Assert
      expect(actualValues).toEqual(expectedValues);
      expect(actualValues).toHaveLength(3);
    });

    it('should not contain unexpected values', () => {
      // Arrange
      const values = Object.values(ContactType);

      // Act & Assert
      expect(values).not.toContain('FAX');
      expect(values).not.toContain('SOCIAL_MEDIA');
      expect(values).not.toContain('WEBSITE');
    });
  });

  describe('type checking', () => {
    it('should accept valid ContactType values', () => {
      // Arrange
      const checkType = (type: ContactType): boolean => {
        return Object.values(ContactType).includes(type);
      };

      // Act & Assert
      expect(checkType(ContactType.EMAIL)).toBe(true);
      expect(checkType(ContactType.PHONE)).toBe(true);
      expect(checkType(ContactType.ADDRESS)).toBe(true);
    });

    it('should allow comparison with string literals', () => {
      // Arrange
      const emailType = ContactType.EMAIL;
      const phoneType = ContactType.PHONE;
      const addressType = ContactType.ADDRESS;

      // Act & Assert
      expect(emailType).toBe('EMAIL');
      expect(phoneType).toBe('PHONE');
      expect(addressType).toBe('ADDRESS');
    });
  });

  describe('enum keys', () => {
    it('should have correct enum keys', () => {
      // Arrange
      const expectedKeys = ['EMAIL', 'PHONE', 'ADDRESS'];

      // Act
      const actualKeys = Object.keys(ContactType);

      // Assert
      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('usage in switch statements', () => {
    it('should work correctly in switch cases', () => {
      // Arrange
      const getContactTypeLabel = (type: ContactType): string => {
        switch (type) {
          case ContactType.EMAIL:
            return 'Email Address';
          case ContactType.PHONE:
            return 'Phone Number';
          case ContactType.ADDRESS:
            return 'Physical Address';
          default:
            return 'Unknown';
        }
      };

      // Act & Assert
      expect(getContactTypeLabel(ContactType.EMAIL)).toBe('Email Address');
      expect(getContactTypeLabel(ContactType.PHONE)).toBe('Phone Number');
      expect(getContactTypeLabel(ContactType.ADDRESS)).toBe('Physical Address');
    });
  });

  describe('validation helper', () => {
    it('should validate if a string is a valid ContactType', () => {
      // Arrange
      const isValidContactType = (value: string): value is ContactType => {
        return Object.values(ContactType).includes(value as ContactType);
      };

      // Act & Assert
      expect(isValidContactType('EMAIL')).toBe(true);
      expect(isValidContactType('PHONE')).toBe(true);
      expect(isValidContactType('ADDRESS')).toBe(true);
      expect(isValidContactType('INVALID')).toBe(false);
      expect(isValidContactType('email')).toBe(false);
      expect(isValidContactType('')).toBe(false);
    });
  });
});
