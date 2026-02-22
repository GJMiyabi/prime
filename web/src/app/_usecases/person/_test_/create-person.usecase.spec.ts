import { CreatePersonUseCase } from '../create-person.usecase';
import { IPersonRepository } from '../../../_repositories/person.repository';
import { ERROR_MESSAGES } from '../../../_constants/error-messages';
import * as logger from '../../../_lib/logger';
import type { SinglePerson } from '../../../_types/person';
import type {
  ValidatedPersonName,
  ValidatedPersonValue,
} from '../../../_validations/person.validation';

// Mock logger
jest.mock('../../../_lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CreatePersonUseCase', () => {
  let useCase: CreatePersonUseCase;
  let mockRepository: jest.Mocked<IPersonRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock repository
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IPersonRepository>;

    useCase = new CreatePersonUseCase(mockRepository);
  });

  describe('execute - 成功時', () => {
    it('正しい入力でPersonを作成する', async () => {
      const input = {
        name: 'Test Person' as ValidatedPersonName,
        value: 'test@example.com' as ValidatedPersonValue,
      };

      const mockPerson: SinglePerson = {
        __typename: 'SinglePerson',
        id: 'person-1',
        name: 'Test Person',
        value: 'test@example.com',
      };

      mockRepository.create.mockResolvedValue(mockPerson);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.person).toEqual(mockPerson);
      expect(result.error).toBeUndefined();
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it('リポジトリにinputを正しく渡す', async () => {
      const input = {
        name: 'John Doe' as ValidatedPersonName,
        value: 'john@example.com' as ValidatedPersonValue,
      };

      const mockPerson: SinglePerson = {
        __typename: 'SinglePerson',
        id: 'person-2',
        name: 'John Doe',
        value: 'john@example.com',
      };

      mockRepository.create.mockResolvedValue(mockPerson);

      await useCase.execute(input);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('execute - エラー時', () => {
    it('リポジトリからnullが返された場合はエラーを返す', async () => {
      const input = {
        name: 'Test Person' as ValidatedPersonName,
        value: 'test@example.com' as ValidatedPersonValue,
      };

      mockRepository.create.mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.CREATE_FAILED);
    });

    it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
      const input = {
        name: 'Test Person' as ValidatedPersonName,
        value: 'test@example.com' as ValidatedPersonValue,
      };

      const error = new Error('Database connection failed');
      mockRepository.create.mockRejectedValue(error);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe('Database connection failed');
    });

    it('エラー時にloggerを呼び出す', async () => {
      const input = {
        name: 'Test Person' as ValidatedPersonName,
        value: 'test@example.com' as ValidatedPersonValue,
      };

      const error = new Error('Network error');
      mockRepository.create.mockRejectedValue(error);

      await useCase.execute(input);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'Person作成ユースケースでエラーが発生',
        expect.objectContaining({
          component: 'CreatePersonUseCase',
          action: 'execute',
          error,
          meta: { input },
        })
      );
    });

    it('Error以外の例外が発生した場合はデフォルトメッセージを返す', async () => {
      const input = {
        name: 'Test Person' as ValidatedPersonName,
        value: 'test@example.com' as ValidatedPersonValue,
      };

      mockRepository.create.mockRejectedValue('Unknown error');

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.CREATE_FAILED);
    });
  });
});
