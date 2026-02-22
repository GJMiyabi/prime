import {
  validateUsername,
  validatePassword,
  AuthValidationRules,
} from '../auth.validation';

describe('auth.validation', () => {
  describe('validateUsername', () => {
    describe('成功時', () => {
      it('有効なユーザー名の場合はisValidがtrueを返す', () => {
        const result = validateUsername('john_doe');

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('英字のみのユーザー名を受け入れる', () => {
        const result = validateUsername('johnsmith');

        expect(result.isValid).toBe(true);
      });

      it('数字のみのユーザー名を受け入れる', () => {
        const result = validateUsername('123456');

        expect(result.isValid).toBe(true);
      });

      it('アンダースコアを含むユーザー名を受け入れる', () => {
        const result = validateUsername('john_doe_123');

        expect(result.isValid).toBe(true);
      });

      it('ハイフンを含むユーザー名を受け入れる', () => {
        const result = validateUsername('john-doe-123');

        expect(result.isValid).toBe(true);
      });

      it('最小文字数のユーザー名を受け入れる', () => {
        const minLengthUsername = 'abc'; // minLength: 3

        const result = validateUsername(minLengthUsername);

        expect(result.isValid).toBe(true);
      });

      it('最大文字数のユーザー名を受け入れる', () => {
        const maxLengthUsername = 'a'.repeat(
          AuthValidationRules.username.maxLength
        );

        const result = validateUsername(maxLengthUsername);

        expect(result.isValid).toBe(true);
      });

      it('前後の空白をトリムして検証する', () => {
        const result = validateUsername('  john_doe  ');

        expect(result.isValid).toBe(true);
      });
    });

    describe('エラー時', () => {
      it('空文字列の場合はエラーを返す', () => {
        const result = validateUsername('');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ユーザー名は必須です');
      });

      it('空白のみの場合はエラーを返す', () => {
        const result = validateUsername('   ');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('ユーザー名は必須です');
      });

      it('最小文字数未満の場合はエラーを返す', () => {
        const shortUsername = 'ab'; // minLength: 3

        const result = validateUsername(shortUsername);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          `ユーザー名は${AuthValidationRules.username.minLength}文字以上で入力してください`
        );
      });

      it('最大文字数を超える場合はエラーを返す', () => {
        const longUsername = 'a'.repeat(
          AuthValidationRules.username.maxLength + 1
        );

        const result = validateUsername(longUsername);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          `ユーザー名は${AuthValidationRules.username.maxLength}文字以内で入力してください`
        );
      });

      it('日本語を含む場合はエラーを返す', () => {
        const result = validateUsername('ユーザー名');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('スペースを含む場合はエラーを返す', () => {
        const result = validateUsername('john doe');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('特殊文字(@)を含む場合はエラーを返す', () => {
        const result = validateUsername('john@doe');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });

      it('特殊文字(.)を含む場合はエラーを返す', () => {
        const result = validateUsername('john.doe');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'
        );
      });
    });
  });

  describe('validatePassword', () => {
    describe('成功時', () => {
      it('有効なパスワードの場合はisValidがtrueを返す', () => {
        const result = validatePassword('password123');

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('最小文字数のパスワードを受け入れる', () => {
        const minLengthPassword = 'a'.repeat(
          AuthValidationRules.password.minLength
        ); // minLength: 8

        const result = validatePassword(minLengthPassword);

        expect(result.isValid).toBe(true);
      });

      it('長いパスワードを受け入れる', () => {
        const longPassword = 'a'.repeat(100);

        const result = validatePassword(longPassword);

        expect(result.isValid).toBe(true);
      });

      it('特殊文字を含むパスワードを受け入れる', () => {
        const result = validatePassword('P@ssw0rd!#$%');

        expect(result.isValid).toBe(true);
      });

      it('スペースを含むパスワードを受け入れる', () => {
        const result = validatePassword('pass word 123');

        expect(result.isValid).toBe(true);
      });

      it('日本語を含むパスワードを受け入れる', () => {
        const result = validatePassword('パスワード12345');

        expect(result.isValid).toBe(true);
      });
    });

    describe('エラー時', () => {
      it('空文字列の場合はエラーを返す', () => {
        const result = validatePassword('');

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('パスワードは必須です');
      });

      it('最小文字数未満の場合はエラーを返す', () => {
        const shortPassword = 'a'.repeat(
          AuthValidationRules.password.minLength - 1
        ); // minLength: 8

        const result = validatePassword(shortPassword);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
          `パスワードは${AuthValidationRules.password.minLength}文字以上で入力してください`
        );
      });
    });
  });
});
