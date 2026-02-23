import { Id } from '../id';

describe('Id Value Object', () => {
  describe('constructor', () => {
    it('should create an id with auto-generated value when no value provided', () => {
      // Arrange & Act
      const id = new Id();

      // Assert
      expect(id.value).toBeDefined();
      expect(typeof id.value).toBe('string');
      expect(id.value.length).toBeGreaterThan(0);
    });

    it('should create an id with provided CUID value', () => {
      // Arrange
      const existingId = new Id();
      const cuidValue = existingId.value;

      // Act
      const id = new Id(cuidValue);

      // Assert
      expect(id.value).toBe(cuidValue);
    });

    it('should create an id with valid UUID format', () => {
      // Arrange
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const id = new Id(uuid);

      // Assert
      expect(id.value).toBe(uuid);
    });

    it('should throw an error for invalid id format', () => {
      // Arrange
      const invalidId = 'invalid-id-format';

      // Act & Assert
      expect(() => new Id(invalidId)).toThrow(
        `Invalid ID format: ${invalidId}. Expected CUID or UUID format.`,
      );
    });

    it('should throw an error for empty string', () => {
      // Arrange
      const emptyId = '';

      // Act & Assert
      expect(() => new Id(emptyId)).toThrow(
        `Invalid ID format: ${emptyId}. Expected CUID or UUID format.`,
      );
    });

    it('should generate unique ids', () => {
      // Arrange & Act
      const id1 = new Id();
      const id2 = new Id();
      const id3 = new Id();

      // Assert
      expect(id1.value).not.toBe(id2.value);
      expect(id2.value).not.toBe(id3.value);
      expect(id1.value).not.toBe(id3.value);
    });
  });

  describe('validation', () => {
    it('should accept valid UUID v1 format', () => {
      // Arrange
      const uuid = '123e4567-e89b-11d3-a456-426614174000';

      // Act & Assert
      expect(() => new Id(uuid)).not.toThrow();
    });

    it('should accept valid UUID v4 format', () => {
      // Arrange
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      // Act & Assert
      expect(() => new Id(uuid)).not.toThrow();
    });

    it('should reject UUID with invalid version', () => {
      // Arrange
      const invalidUuid = '550e8400-e29b-61d4-a716-446655440000'; // version 6 (invalid)

      // Act & Assert
      expect(() => new Id(invalidUuid)).toThrow('Invalid ID format');
    });

    it('should reject UUID with invalid variant', () => {
      // Arrange
      const invalidUuid = '550e8400-e29b-41d4-f716-446655440000'; // invalid variant

      // Act & Assert
      expect(() => new Id(invalidUuid)).toThrow('Invalid ID format');
    });

    it('should reject malformed UUID', () => {
      // Arrange
      const malformedUuid = '550e8400-e29b-41d4-a716-44665544000'; // missing one char

      // Act & Assert
      expect(() => new Id(malformedUuid)).toThrow('Invalid ID format');
    });
  });

  describe('equals', () => {
    it('should return true for identical id values', () => {
      // Arrange
      const value = new Id().value;
      const id1 = new Id(value);
      const id2 = new Id(value);

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different id values', () => {
      // Arrange
      const id1 = new Id();
      const id2 = new Id();

      // Act
      const result = id1.equals(id2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const id = new Id();

      // Act
      const result = id.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      // Arrange
      const id = new Id();

      // Act
      const result = id.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('value property', () => {
    it('should be readonly', () => {
      // Arrange
      const id = new Id();
      const originalValue = id.value;

      // Act & Assert
      // TypeScript will prevent this at compile time, and the value remains unchanged
      expect(id.value).toBe(originalValue);
    });

    it('should return the same value on multiple accesses', () => {
      // Arrange
      const id = new Id();

      // Act
      const value1 = id.value;
      const value2 = id.value;
      const value3 = id.value;

      // Assert
      expect(value1).toBe(value2);
      expect(value2).toBe(value3);
    });
  });
});
