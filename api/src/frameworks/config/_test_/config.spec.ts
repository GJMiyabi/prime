import {
  environment,
  getEnvironmentVariable,
  getEnvironmentVariableAllowUndefined,
} from '../config';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 各テスト前に環境変数をリセット
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // すべてのテスト後に環境変数を復元
    process.env = originalEnv;
  });

  describe('environment', () => {
    it('should return NODE_ENV when defined', () => {
      // Arrange & Act
      // environment は既に読み込まれているため、現在の NODE_ENV を返す
      // Assert
      expect(typeof environment).toBe('string');
    });
  });

  describe('getEnvironmentVariableAllowUndefined', () => {
    it('should return string value', () => {
      // Arrange
      process.env.TEST_VAR = 'test-value';

      // Act
      const result = getEnvironmentVariableAllowUndefined('TEST_VAR');

      // Assert
      expect(result).toBe('test-value');
    });

    it('should return boolean true', () => {
      // Arrange
      process.env.TEST_BOOL = 'true';

      // Act
      const result = getEnvironmentVariableAllowUndefined<boolean>('TEST_BOOL');

      // Assert
      expect(result).toBe(true);
    });

    it('should return boolean false', () => {
      // Arrange
      process.env.TEST_BOOL = 'false';

      // Act
      const result = getEnvironmentVariableAllowUndefined<boolean>('TEST_BOOL');

      // Assert
      expect(result).toBe(false);
    });

    it('should return number value', () => {
      // Arrange
      process.env.TEST_NUM = '123';

      // Act
      const result = getEnvironmentVariableAllowUndefined<number>('TEST_NUM');

      // Assert
      expect(result).toBe(123);
    });

    it('should return float number', () => {
      // Arrange
      process.env.TEST_FLOAT = '123.45';

      // Act
      const result = getEnvironmentVariableAllowUndefined<number>('TEST_FLOAT');

      // Assert
      expect(result).toBe(123.45);
    });

    it('should return zero', () => {
      // Arrange
      process.env.TEST_ZERO = '0';

      // Act
      const result = getEnvironmentVariableAllowUndefined<number>('TEST_ZERO');

      // Assert
      expect(result).toBe(0);
    });

    it('should return undefined when variable is not defined', () => {
      // Act
      const result = getEnvironmentVariableAllowUndefined('NON_EXISTENT_VAR');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return default value when variable is not defined', () => {
      // Arrange
      const defaultValue = 'default';

      // Act
      const result = getEnvironmentVariableAllowUndefined(
        'NON_EXISTENT_VAR',
        defaultValue,
      );

      // Assert
      expect(result).toBe(defaultValue);
    });

    it('should return default value of number type', () => {
      // Arrange
      const defaultValue = 100;

      // Act
      const result = getEnvironmentVariableAllowUndefined<number>(
        'NON_EXISTENT_VAR',
        defaultValue,
      );

      // Assert
      expect(result).toBe(100);
    });

    it('should return empty string value', () => {
      // Arrange
      process.env.TEST_EMPTY = '';

      // Act
      const result = getEnvironmentVariableAllowUndefined('TEST_EMPTY');

      // Assert
      expect(result).toBe('');
    });
  });

  describe('getEnvironmentVariable', () => {
    it('should return string value', () => {
      // Arrange
      process.env.TEST_VAR = 'required-value';

      // Act
      const result = getEnvironmentVariable('TEST_VAR');

      // Assert
      expect(result).toBe('required-value');
    });

    it('should return boolean value', () => {
      // Arrange
      process.env.TEST_BOOL = 'true';

      // Act
      const result = getEnvironmentVariable<boolean>('TEST_BOOL');

      // Assert
      expect(result).toBe(true);
    });

    it('should return number value', () => {
      // Arrange
      process.env.TEST_NUM = '456';

      // Act
      const result = getEnvironmentVariable<number>('TEST_NUM');

      // Assert
      expect(result).toBe(456);
    });

    it('should throw exception when variable is not defined', () => {
      // Act & Assert
      expect(() => {
        getEnvironmentVariable('REQUIRED_NON_EXISTENT_VAR');
      }).toThrow(
        'Environment variable REQUIRED_NON_EXISTENT_VAR is not defined',
      );
    });

    it('should throw exception with correct error message', () => {
      // Act & Assert
      expect(() => {
        getEnvironmentVariable('MISSING_VAR');
      }).toThrow('Environment variable MISSING_VAR is not defined');
    });

    it('should return default value if provided', () => {
      // Arrange
      const defaultValue = 'provided-default';

      // Act
      const result = getEnvironmentVariable(
        'NON_EXISTENT_WITH_DEFAULT',
        defaultValue,
      );

      // Assert
      expect(result).toBe(defaultValue);
    });

    it('should return environment value even when default is provided', () => {
      // Arrange
      process.env.TEST_WITH_DEFAULT = 'actual-value';
      const defaultValue = 'default-value';

      // Act
      const result = getEnvironmentVariable('TEST_WITH_DEFAULT', defaultValue);

      // Assert
      expect(result).toBe('actual-value');
    });

    it('should handle complex string values', () => {
      // Arrange
      process.env.TEST_COMPLEX = 'value:with:colons';

      // Act
      const result = getEnvironmentVariable('TEST_COMPLEX');

      // Assert
      expect(result).toBe('value:with:colons');
    });

    it('should handle URL values', () => {
      // Arrange
      process.env.TEST_URL = 'https://example.com/path?query=value';

      // Act
      const result = getEnvironmentVariable('TEST_URL');

      // Assert
      expect(result).toBe('https://example.com/path?query=value');
    });
  });
});
