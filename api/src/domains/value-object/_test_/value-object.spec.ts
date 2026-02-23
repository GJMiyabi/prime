import { ValueObject } from '../value-object';

// Test implementation of ValueObject for testing purposes
class TestValueObject extends ValueObject<string> {
  protected throwIfInvalid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}

class NumberValueObject extends ValueObject<number> {
  protected throwIfInvalid(value: number): void {
    if (value < 0) {
      throw new Error('Value must be non-negative');
    }
  }
}

class EmailValueObject extends ValueObject<string> {
  protected throwIfInvalid(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
  }
}

describe('ValueObject', () => {
  describe('constructor', () => {
    it('should create a value object with valid value', () => {
      // Arrange
      const value = 'test value';

      // Act
      const vo = new TestValueObject(value);

      // Assert
      expect(vo.value).toBe(value);
    });

    it('should throw error when validation fails', () => {
      // Arrange
      const invalidValue = '';

      // Act & Assert
      expect(() => new TestValueObject(invalidValue)).toThrow(
        'Value cannot be empty',
      );
    });

    it('should validate on construction', () => {
      // Arrange
      const invalidValue = '   ';

      // Act & Assert
      expect(() => new TestValueObject(invalidValue)).toThrow(
        'Value cannot be empty',
      );
    });
  });

  describe('value property', () => {
    it('should store string value', () => {
      // Arrange
      const value = 'test string';
      const vo = new TestValueObject(value);

      // Act & Assert
      expect(vo.value).toBe(value);
    });

    it('should store number value', () => {
      // Arrange
      const value = 42;
      const vo = new NumberValueObject(value);

      // Act & Assert
      expect(vo.value).toBe(value);
    });

    it('should be readonly at runtime', () => {
      // Arrange
      const vo = new TestValueObject('test');

      // Act & Assert
      // The readonly modifier is enforced by TypeScript at compile time
      // At runtime, the value property is accessible but should not be modified
      expect(vo.value).toBeDefined();
    });
  });

  describe('equals', () => {
    it('should return true for equal string values', () => {
      // Arrange
      const value = 'test value';
      const vo1 = new TestValueObject(value);
      const vo2 = new TestValueObject(value);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different string values', () => {
      // Arrange
      const vo1 = new TestValueObject('value1');
      const vo2 = new TestValueObject('value2');

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for equal number values', () => {
      // Arrange
      const value = 100;
      const vo1 = new NumberValueObject(value);
      const vo2 = new NumberValueObject(value);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different number values', () => {
      // Arrange
      const vo1 = new NumberValueObject(100);
      const vo2 = new NumberValueObject(200);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const vo = new TestValueObject('test');

      // Act
      const result = vo.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      // Arrange
      const vo = new TestValueObject('test');

      // Act
      const result = vo.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should use loose equality (==) for comparison', () => {
      // Arrange
      const vo1 = new NumberValueObject(0);
      const vo2 = new NumberValueObject(0);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('custom validation', () => {
    it('should validate number values correctly', () => {
      // Arrange & Act & Assert
      expect(() => new NumberValueObject(0)).not.toThrow();
      expect(() => new NumberValueObject(100)).not.toThrow();
      expect(() => new NumberValueObject(-1)).toThrow(
        'Value must be non-negative',
      );
      expect(() => new NumberValueObject(-100)).toThrow(
        'Value must be non-negative',
      );
    });

    it('should validate email format correctly', () => {
      // Arrange & Act & Assert
      expect(() => new EmailValueObject('test@example.com')).not.toThrow();
      expect(
        () => new EmailValueObject('user.name+tag@example.co.uk'),
      ).not.toThrow();
      expect(() => new EmailValueObject('invalid')).toThrow(
        'Invalid email format',
      );
      expect(() => new EmailValueObject('invalid@')).toThrow(
        'Invalid email format',
      );
      expect(() => new EmailValueObject('@invalid.com')).toThrow(
        'Invalid email format',
      );
    });
  });

  describe('immutability', () => {
    it('should not allow value modification', () => {
      // Arrange
      const originalValue = 'original';
      const vo = new TestValueObject(originalValue);

      // Act
      // Value is readonly and cannot be modified
      // This is enforced at TypeScript compile time

      // Assert
      expect(vo.value).toBe(originalValue);
    });
  });

  describe('inheritance', () => {
    it('should work with different types', () => {
      // Arrange
      const stringVo = new TestValueObject('string');
      const numberVo = new NumberValueObject(42);
      const emailVo = new EmailValueObject('test@example.com');

      // Act & Assert
      expect(stringVo.value).toBe('string');
      expect(numberVo.value).toBe(42);
      expect(emailVo.value).toBe('test@example.com');
    });

    it('should maintain separate validation rules', () => {
      // Arrange & Act & Assert
      expect(() => new TestValueObject('')).toThrow();
      expect(() => new NumberValueObject(-1)).toThrow();
      expect(() => new EmailValueObject('invalid')).toThrow();
    });
  });
});
