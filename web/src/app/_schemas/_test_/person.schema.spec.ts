import { personCreateSchema } from '../person.schema';
import { ERROR_MESSAGES } from '../../_constants/error-messages';
import { PersonValidationRules } from '../../_validations/person.validation';

describe('person.schema', () => {
  describe('personCreateSchema', () => {
    describe('valid data', () => {
      it('有効なPerson作成データをバリデーションする', async () => {
        const validData = {
          name: 'John Doe',
          value: 'john@example.com',
        };

        await expect(personCreateSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('最小文字数のnameを受け入れる', async () => {
        const validData = {
          name: 'AB', // minLength: 2
          value: 'value',
        };

        await expect(personCreateSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('最大文字数のnameを受け入れる', async () => {
        const validData = {
          name: 'A'.repeat(PersonValidationRules.name.maxLength),
          value: 'value',
        };

        await expect(
          personCreateSchema.validate(validData)
        ).resolves.toBeDefined();
      });

      it('日本語のnameを受け入れる', async () => {
        const validData = {
          name: '田中太郎',
          value: 'tanaka@example.com',
        };

        await expect(personCreateSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });

      it('特殊文字を含むvalueを受け入れる', async () => {
        const validData = {
          name: 'John Doe',
          value: 'john+test@example.com',
        };

        await expect(personCreateSchema.validate(validData)).resolves.toEqual(
          validData
        );
      });
    });

    describe('invalid data', () => {
      it('nameが空の場合はエラーを返す', async () => {
        const invalidData = {
          name: '',
          value: 'value',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          ERROR_MESSAGES.PERSON.NAME_REQUIRED
        );
      });

      it('valueが空の場合はエラーを返す', async () => {
        const invalidData = {
          name: 'John Doe',
          value: '',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          ERROR_MESSAGES.PERSON.VALUE_REQUIRED
        );
      });

      it('nameが最小文字数未満の場合はエラーを返す', async () => {
        const invalidData = {
          name: 'A', // minLength: 2
          value: 'value',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          `名前は${PersonValidationRules.name.minLength}文字以上で入力してください`
        );
      });

      it('nameが最大文字数を超える場合はエラーを返す', async () => {
        const invalidData = {
          name: 'A'.repeat(PersonValidationRules.name.maxLength + 1),
          value: 'value',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          `名前は${PersonValidationRules.name.maxLength}文字以内で入力してください`
        );
      });

      it('nameが空白のみの場合はエラーを返す', async () => {
        const invalidData = {
          name: '   ',
          value: 'value',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          '名前は必須です'
        );
      });

      it('valueが空白のみの場合はエラーを返す', async () => {
        const invalidData = {
          name: 'John Doe',
          value: '   ',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow(
          '値は必須です'
        );
      });

      it('nameが未定義の場合はエラーを返す', async () => {
        const invalidData = {
          value: 'value',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow();
      });

      it('valueが未定義の場合はエラーを返す', async () => {
        const invalidData = {
          name: 'John Doe',
        };

        await expect(personCreateSchema.validate(invalidData)).rejects.toThrow();
      });
    });

    describe('型推論', () => {
      it('正しい型を持つデータを作成できる', async () => {
        const data: typeof personCreateSchema.__outputType = {
          name: 'John Doe',
          value: 'value',
        };

        await expect(personCreateSchema.validate(data)).resolves.toEqual(data);
      });
    });
  });
});
