import {
  validatePersonName,
  validatePersonValue,
  createValidatedPersonName,
  createValidatedPersonValue,
  PersonValidationRules,
} from '../person.validation';
import * as sanitize from '../../_lib/sanitize';

// Mock sanitize
jest.mock('../../_lib/sanitize', () => ({
  sanitizeInput: jest.fn((input: string) => input),
}));

describe('person.validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトでサニタイズは入力をそのまま返す
    jest.mocked(sanitize.sanitizeInput).mockImplementation((input) => input);
  });

  describe('validatePersonName', () => {
    describe('成功時', () => {
      it('有効な名前の場合はisValidがtrueを返す', () => {
        const result = validatePersonName('John Doe');

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.sanitized).toBe('John Doe');
      });

      it('最小文字数の名前を受け入れる', () => {
        const minLengthName = 'AB'; // minLength: 2

        const result = validatePersonName(minLengthName);

        expect(result.isValid).toBe(true);
      });

      it('最大文字数の名前を受け入れる', () => {
        const maxLengthName = 'A'.repeat(PersonValidationRules.name.maxLength);

        const result = validatePersonName(maxLengthName);

        expect(result.isValid).toBe(true);
      });

      it('前後の空白をトリムして検証する', () => {
        const result = validatePersonName('  John Doe  ');

        expect(result.isValid).toBe(true);
        expect(result.sanitized).toBe('  John Doe  ');
      });

      it('sanitizeInput関数を呼び出す', () => {
        validatePersonName('John Doe');

        expect(sanitize.sanitizeInput).toHaveBeenCalledWith('John Doe');
      });
    });

    describe('エラー時', () => {
      it('空文字列の場合はエラーを返す', () => {
        const result = validatePersonName('');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('名前は必須です');
      });

      it('空白のみの場合はエラーを返す', () => {
        const result = validatePersonName('   ');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('名前は必須です');
      });

      it('最小文字数未満の場合はエラーを返す', () => {
        const shortName = 'A'; // minLength: 2

        const result = validatePersonName(shortName);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          `名前は${PersonValidationRules.name.minLength}文字以上で入力してください`
        );
      });

      it('最大文字数を超える場合はエラーを返す', () => {
        const longName = 'A'.repeat(PersonValidationRules.name.maxLength + 1);

        const result = validatePersonName(longName);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          `名前は${PersonValidationRules.name.maxLength}文字以内で入力してください`
        );
      });
    });
  });

  describe('validatePersonValue', () => {
    describe('成功時', () => {
      it('有効な値の場合はisValidがtrueを返す', () => {
        const result = validatePersonValue('test@example.com');

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.sanitized).toBe('test@example.com');
      });

      it('任意の文字列を受け入れる', () => {
        const result = validatePersonValue('any string value');

        expect(result.isValid).toBe(true);
      });

      it('前後の空白をトリムして検証する', () => {
        const result = validatePersonValue('  value  ');

        expect(result.isValid).toBe(true);
        expect(result.sanitized).toBe('  value  ');
      });

      it('sanitizeInput関数を呼び出す', () => {
        validatePersonValue('test value');

        expect(sanitize.sanitizeInput).toHaveBeenCalledWith('test value');
      });
    });

    describe('エラー時', () => {
      it('空文字列の場合はエラーを返す', () => {
        const result = validatePersonValue('');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('値は必須です');
      });

      it('空白のみの場合はエラーを返す', () => {
        const result = validatePersonValue('   ');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('値は必須です');
      });
    });
  });

  describe('createValidatedPersonName', () => {
    it('有効な名前の場合はValidatedPersonNameを返す', () => {
      const name = createValidatedPersonName('John Doe');

      expect(name).toBe('John Doe');
    });

    it('無効な名前の場合はnullを返す', () => {
      const name = createValidatedPersonName('');

      expect(name).toBeNull();
    });

    it('前後の空白をトリムする', () => {
      const name = createValidatedPersonName('  John Doe  ');

      expect(name).toBe('John Doe');
    });

    it('最小文字数未満の場合はnullを返す', () => {
      const name = createValidatedPersonName('A');

      expect(name).toBeNull();
    });

    it('最大文字数を超える場合はnullを返す', () => {
      const longName = 'A'.repeat(PersonValidationRules.name.maxLength + 1);
      const name = createValidatedPersonName(longName);

      expect(name).toBeNull();
    });
  });

  describe('createValidatedPersonValue', () => {
    it('有効な値の場合はValidatedPersonValueを返す', () => {
      const value = createValidatedPersonValue('test@example.com');

      expect(value).toBe('test@example.com');
    });

    it('無効な値の場合はnullを返す', () => {
      const value = createValidatedPersonValue('');

      expect(value).toBeNull();
    });

    it('前後の空白をトリムする', () => {
      const value = createValidatedPersonValue('  test value  ');

      expect(value).toBe('test value');
    });

    it('空白のみの場合はnullを返す', () => {
      const value = createValidatedPersonValue('   ');

      expect(value).toBeNull();
    });
  });
});
