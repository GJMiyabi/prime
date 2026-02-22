import { GraphQLPersonRepository } from '../person.repository';
import type { CreatePersonInput, PersonIncludeOptions } from '../person.repository';
import type { SinglePerson, Person } from '../../_types/person';
import type { ValidatedPersonName, ValidatedPersonValue } from '../../_validations/person.validation';
import { ERROR_MESSAGES } from '../../_constants/error-messages';
import { ApolloClient } from '@apollo/client';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  HttpLink: jest.fn(),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

describe('GraphQLPersonRepository', () => {
  let repository: GraphQLPersonRepository;
  let mockMutate: jest.Mock;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn();
    mockQuery = jest.fn();

    // ApolloClientのモックインスタンスを作成
    jest.mocked(ApolloClient).mockImplementation(
      () =>
        ({
          mutate: mockMutate,
          query: mockQuery,
        }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    repository = new GraphQLPersonRepository('http://localhost:4000/graphql');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('成功時', () => {
      it('有効な入力でPersonを作成する', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        const mockPerson: SinglePerson = {
          __typename: 'SinglePerson',
          id: 'person-1',
          name: 'John Doe',
          value: 'john@example.com',
        };

        const mockResponse = {
          data: {
            createSinglePerson: mockPerson,
          },
        };

        mockMutate.mockResolvedValue(mockResponse);

        const result = await repository.create(input);

        expect(result).toEqual(mockPerson);
        expect(mockMutate).toHaveBeenCalledWith({
          mutation: expect.anything(),
          variables: { input },
        });
      });

      it('dataがnullの場合はnullを返す', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        mockMutate.mockResolvedValue({ data: null });

        const result = await repository.create(input);

        expect(result).toBeNull();
      });

      it('createSinglePersonがundefinedの場合はnullを返す', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        mockMutate.mockResolvedValue({ data: {} });

        const result = await repository.create(input);

        expect(result).toBeNull();
      });
    });

    describe('エラー時', () => {
      it('GraphQLエラーが発生した場合はエラーメッセージを含む例外をスロー', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        const graphQLError = {
          graphQLErrors: [{ message: 'Validation failed' }],
        };

        mockMutate.mockRejectedValue(graphQLError);

        await expect(repository.create(input)).rejects.toThrow(
          `${ERROR_MESSAGES.PERSON.CREATE_FAILED}: Validation failed`
        );
      });

      it('ネットワークエラーが発生した場合はネットワークエラーメッセージをスロー', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        const networkError = {
          networkError: new Error('Network failure'),
        };

        mockMutate.mockRejectedValue(networkError);

        await expect(repository.create(input)).rejects.toThrow(
          ERROR_MESSAGES.COMMON.NETWORK_ERROR
        );
      });

      it('その他のエラーの場合はデフォルトの作成失敗メッセージをスロー', async () => {
        const input: CreatePersonInput = {
          name: 'John Doe' as ValidatedPersonName,
          value: 'john@example.com' as ValidatedPersonValue,
        };

        mockMutate.mockRejectedValue(new Error('Unknown error'));

        await expect(repository.create(input)).rejects.toThrow(
          ERROR_MESSAGES.PERSON.CREATE_FAILED
        );
      });
    });
  });

  describe('findById', () => {
    describe('成功時', () => {
      it('IDでPersonを取得する', async () => {
        const personId = 'person-1';

        const mockPerson: Person = {
          id: 'person-1',
          name: 'John Doe',
        };

        const mockResponse = {
          data: {
            person: mockPerson,
          },
        };

        mockQuery.mockResolvedValue(mockResponse);

        const result = await repository.findById(personId);

        expect(result).toEqual(mockPerson);
        expect(mockQuery).toHaveBeenCalledWith({
          query: expect.anything(),
          variables: { id: personId, include: undefined },
          fetchPolicy: 'cache-first',
        });
      });

      it('includeオプションを指定してPersonを取得する', async () => {
        const personId = 'person-1';
        const include: PersonIncludeOptions = {
          contacts: true,
          principal: { account: true },
        };

        const mockPerson: Person = {
          id: 'person-1',
          name: 'John Doe',
        };

        const mockResponse = {
          data: {
            person: mockPerson,
          },
        };

        mockQuery.mockResolvedValue(mockResponse);

        const result = await repository.findById(personId, include);

        expect(result).toEqual(mockPerson);
        expect(mockQuery).toHaveBeenCalledWith({
          query: expect.anything(),
          variables: { id: personId, include },
          fetchPolicy: 'cache-first',
        });
      });

      it('fetchPolicyオプションを指定してPersonを取得する', async () => {
        const personId = 'person-1';
        const options = { fetchPolicy: 'network-only' as const };

        const mockPerson: Person = {
          id: 'person-1',
          name: 'John Doe',
        };

        const mockResponse = {
          data: {
            person: mockPerson,
          },
        };

        mockQuery.mockResolvedValue(mockResponse);

        const result = await repository.findById(personId, undefined, options);

        expect(result).toEqual(mockPerson);
        expect(mockQuery).toHaveBeenCalledWith({
          query: expect.anything(),
          variables: { id: personId, include: undefined },
          fetchPolicy: 'network-only',
        });
      });

      it('dataがnullの場合はnullを返す', async () => {
        const personId = 'person-1';

        mockQuery.mockResolvedValue({ data: null });

        const result = await repository.findById(personId);

        expect(result).toBeNull();
      });

      it('personがundefinedの場合はnullを返す', async () => {
        const personId = 'person-1';

        mockQuery.mockResolvedValue({ data: {} });

        const result = await repository.findById(personId);

        expect(result).toBeNull();
      });
    });

    describe('エラー時', () => {
      it('GraphQLエラーが発生した場合はエラーメッセージを含む例外をスロー', async () => {
        const personId = 'person-1';

        const graphQLError = {
          graphQLErrors: [{ message: 'Person not found' }],
        };

        mockQuery.mockRejectedValue(graphQLError);

        await expect(repository.findById(personId)).rejects.toThrow(
          `${ERROR_MESSAGES.PERSON.FETCH_FAILED}: Person not found`
        );
      });

      it('ネットワークエラーが発生した場合はネットワークエラーメッセージをスロー', async () => {
        const personId = 'person-1';

        const networkError = {
          networkError: new Error('Network failure'),
        };

        mockQuery.mockRejectedValue(networkError);

        await expect(repository.findById(personId)).rejects.toThrow(
          ERROR_MESSAGES.COMMON.NETWORK_ERROR
        );
      });

      it('その他のエラーの場合はデフォルトの取得失敗メッセージをスロー', async () => {
        const personId = 'person-1';

        mockQuery.mockRejectedValue(new Error('Unknown error'));

        await expect(repository.findById(personId)).rejects.toThrow(
          ERROR_MESSAGES.PERSON.FETCH_FAILED
        );
      });
    });
  });
});
