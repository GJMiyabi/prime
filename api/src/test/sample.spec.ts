/**
 * Sample Test - Backend Service
 * テスト環境の動作確認用サンプル
 */

describe('Sample Service', () => {
  describe('add function', () => {
    it('should add two numbers correctly', () => {
      // Arrange
      const a = 2;
      const b = 3;

      // Act
      const result = a + b;

      // Assert
      expect(result).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(-5 + 3).toBe(-2);
    });

    it('should handle zero', () => {
      expect(0 + 0).toBe(0);
    });
  });

  describe('string operations', () => {
    it('should concatenate strings', () => {
      const result = 'Hello' + ' ' + 'World';
      expect(result).toBe('Hello World');
    });

    it('should convert to uppercase', () => {
      const result = 'hello'.toUpperCase();
      expect(result).toBe('HELLO');
    });
  });

  describe('array operations', () => {
    it('should filter array', () => {
      const numbers = [1, 2, 3, 4, 5];
      const even = numbers.filter((n) => n % 2 === 0);
      expect(even).toEqual([2, 4]);
    });

    it('should map array', () => {
      const numbers = [1, 2, 3];
      const doubled = numbers.map((n) => n * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });
  });
});
