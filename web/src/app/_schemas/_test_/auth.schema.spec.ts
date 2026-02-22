import { loginSchema } from '../auth.schema';
import { ERROR_MESSAGES } from '../../_constants/error-messages';
import { AuthValidationRules } from '../../_validations/auth.validation';

describe('auth.schema', () => {
  describe('loginSchema', () => {
    describe('valid data', () => {
      it('有効なログインデータをバリデーションする', async () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
        };

        await expect(loginSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('最小文字数のusernameとpasswordを受け入れる', async () => {
        const validData = {
          username: 'abc', // minLength: 3
          password: 'a'.repeat(AuthValidationRules.password.minLength), // minLength: 8
        };

        await expect(loginSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('最大文字数のusernameを受け入れる', async () => {
        const validData = {
          username: 'a'.repeat(AuthValidationRules.username.maxLength),
          password: 'password123',
        };

        await expect(loginSchema.validate(validData)).resolves.toBeDefined();
      });

      it('アンダースコアを含むusernameを受け入れる', async () => {
        const validData = {
          username: 'test_user',
          password: 'password123',
        };

        await expect(loginSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('ハイフンを含むusernameを受け入れる', async () => {
        const validData = {
          username: 'test-user',
          password: 'password123',
        };

        await expect(loginSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });
    });

    describe('invalid data', () => {
      it('usernameが空の場合はエラーを返す', async () => {
        const invalidData = {
          username: '',
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          ERROR_MESSAGES.AUTH.LOGIN_FAILED
        );
      });

      it('passwordが空の場合はエラーを返す', async () => {
        const invalidData = {
          username: 'testuser',
          password: '',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          ERROR_MESSAGES.AUTH.LOGIN_FAILED
        );
      });

      it('usernameが最小文字数未満の場合はエラーを返す', async () => {
        const invalidData = {
          username: 'ab', // minLength: 3
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          `ユーザー名は${AuthValidationRules.username.minLength}文字以上で入力してください`
        );
      });

      it('usernameが最大文字数を超える場合はエラーを返す', async () => {
        const invalidData = {
          username: 'a'.repeat(AuthValidationRules.username.maxLength + 1),
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          `ユーザー名は${AuthValidationRules.username.maxLength}文字以内で入力してください`
        );
      });

      it('usernameに日本語が含まれる場合はエラーを返す', async () => {
        const invalidData = {
          username: 'ユーザー名',
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('usernameにスペースが含まれる場合はエラーを返す', async () => {
        const invalidData = {
          username: 'test user',
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('usernameに特殊文字が含まれる場合はエラーを返す', async () => {
        const invalidData = {
          username: 'test@user',
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('passwordが最小文字数未満の場合はエラーを返す', async () => {
        const invalidData = {
          username: 'testuser',
          password: 'a'.repeat(AuthValidationRules.password.minLength - 1),
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow(
          `パスワードは${AuthValidationRules.password.minLength}文字以上で入力してください`
        );
      });

      it('usernameが未定義の場合はエラーを返す', async () => {
        const invalidData = {
          password: 'password123',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow();
      });

      it('passwordが未定義の場合はエラーを返す', async () => {
        const invalidData = {
          username: 'testuser',
        };

        await expect(loginSchema.validate(invalidData)).rejects.toThrow();
      });
    });
  });
});
