import { GetPersonUseCase } from '../get-person.usecase';
import { IPersonRepository } from '../../../_repositories/person.repository';
import { ERROR_MESSAGES } from '../../../_constants/error-messages';
import * as logger from '../../../_lib/logger';

// Mock logger
jest.mock('../../../_lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('GetPersonUseCase', () => {
  let useCase: GetPersonUseCase;
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

    useCase = new GetPersonUseCase(mockRepository);
  });

  describe('execute - 成功時', () => {
    it('正しいIDでPersonを取得する', async () => {
      const personId = 'person-1';
      const mockPerson = {
        id: personId,
        name: 'Test Person',
        value: 'test@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepository.findById.mockResolvedValue(mockPerson);

      const result = await useCase.execute(personId);

      expect(result.success).toBe(true);
      expect(result.person).toEqual(mockPerson);
      expect(result.error).toBeUndefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(personId, undefined, undefined);
    });

    it('includeオプションを渡してPersonを取得する', async () => {
      const personId = 'person-1';
      const includeOptions = { contacts: true };
      const mockPerson = {
        id: personId,
        name: 'Test Person',
        value: 'test@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepository.findById.mockResolvedValue(mockPerson);

      const result = await useCase.execute(personId, includeOptions);

      expect(result.success).toBe(true);
      expect(result.person).toEqual(mockPerson);
      expect(mockRepository.findById).toHaveBeenCalledWith(personId, includeOptions, undefined);
    });

    it('queryオプションを渡してPersonを取得する', async () => {
      const personId = 'person-1';
      const queryOptions = { fetchPolicy: 'network-only' as const };
      const mockPerson = {
        id: personId,
        name: 'Test Person',
        value: 'test@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepository.findById.mockResolvedValue(mockPerson);

      const result = await useCase.execute(personId, undefined, queryOptions);

      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(personId, undefined, queryOptions);
    });
  });

  describe('execute - バリデーションエラー', () => {
    it('IDが空文字列の場合はエラーを返す', async () => {
      const result = await useCase.execute('');

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.ID_REQUIRED);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('IDが空白のみの場合はエラーを返す', async () => {
      const result = await useCase.execute('   ');

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.ID_REQUIRED);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('IDがnullの場合はエラーを返す', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await useCase.execute(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.ID_REQUIRED);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('execute - リポジトリエラー', () => {
    it('Personが見つからない場合はエラーを返す', async () => {
      const personId = 'non-existent-id';

      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(personId);

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.NOT_FOUND);
    });

    it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
      const personId = 'person-1';
      const error = new Error('Database connection failed');

      mockRepository.findById.mockRejectedValue(error);

      const result = await useCase.execute(personId);

      expect(result.success).toBe(false);
      expect(result.person).toBeUndefined();
      expect(result.error).toBe('Database connection failed');
    });

    it('エラー時にloggerを呼び出す', async () => {
      const personId = 'person-1';
      const error = new Error('Network error');

      mockRepository.findById.mockRejectedValue(error);

      await useCase.execute(personId);

      expect(logger.logger.error).toHaveBeenCalledWith(
        'Person取得ユースケースでエラーが発生',
        expect.objectContaining({
          component: 'GetPersonUseCase',
          action: 'execute',
          error,
          meta: { id: personId, include: undefined },
        })
      );
    });

    it('Error以外の例外が発生した場合はデフォルトメッセージを返す', async () => {
      const personId = 'person-1';

      mockRepository.findById.mockRejectedValue('Unknown error');

      const result = await useCase.execute(personId);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERSON.FETCH_FAILED);
    });
  });
});
