import { GraphQLAuthRepository } from '../auth.repository';
import type { LoginInput } from '../../_types/auth';
import { ERROR_MESSAGES } from '../../_constants/error-messages';
import { ApolloClient } from '@apollo/client';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  HttpLink: jest.fn(),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

describe('GraphQLAuthRepository', () => {
  let repository: GraphQLAuthRepository;
  let mockMutate: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn();

    // ApolloClientのモックインスタンスを作成
    jest.mocked(ApolloClient).mockImplementation(
      () =>
        ({
          mutate: mockMutate,
        }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    repository = new GraphQLAuthRepository('http://localhost:4000/graphql');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('成功時', () => {
      it('有効な認証情報でアクセストークンを返す', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'password123',
        };

        const mockResponse = {
          data: {
            login: {
              accessToken: 'mock-access-token',
            },
          },
        };

        mockMutate.mockResolvedValue(mockResponse);

        const result = await repository.login(input);

        expect(result).toBe('mock-access-token');
        expect(mockMutate).toHaveBeenCalledWith({
          mutation: expect.anything(),
          variables: { input },
        });
      });

      it('loginが存在してもaccessTokenがnullの場合はnullを返す', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'password123',
        };

        const mockResponse = {
          data: {
            login: {
              accessToken: null,
            },
          },
        };

        mockMutate.mockResolvedValue(mockResponse);

        const result = await repository.login(input);

        expect(result).toBeNull();
      });

      it('dataがnullの場合はnullを返す', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'password123',
        };

        mockMutate.mockResolvedValue({ data: null });

        const result = await repository.login(input);

        expect(result).toBeNull();
      });
    });

    describe('エラー時', () => {
      it('GraphQLエラーが発生した場合はエラーメッセージを含む例外をスロー', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'wrongpassword',
        };

        const graphQLError = {
          graphQLErrors: [{ message: 'Invalid credentials' }],
        };

        mockMutate.mockRejectedValue(graphQLError);

        await expect(repository.login(input)).rejects.toThrow(
          'Invalid credentials'
        );
      });

      it('GraphQLエラーメッセージがnullの場合はデフォルトメッセージを使用', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'wrongpassword',
        };

        const graphQLError = {
          graphQLErrors: [{ message: null }],
        };

        mockMutate.mockRejectedValue(graphQLError);

        await expect(repository.login(input)).rejects.toThrow(
          ERROR_MESSAGES.AUTH.LOGIN_FAILED
        );
      });

      it('ネットワークエラーが発生した場合はネットワークエラーメッセージをスロー', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'password123',
        };

        const networkError = {
          networkError: new Error('Network failure'),
        };

        mockMutate.mockRejectedValue(networkError);

        await expect(repository.login(input)).rejects.toThrow(
          ERROR_MESSAGES.COMMON.NETWORK_ERROR
        );
      });

      it('その他のエラーの場合はデフォルトのログイン失敗メッセージをスロー', async () => {
        const input: LoginInput = {
          username: 'testuser',
          password: 'password123',
        };

        mockMutate.mockRejectedValue(new Error('Unknown error'));

        await expect(repository.login(input)).rejects.toThrow(
          ERROR_MESSAGES.AUTH.LOGIN_FAILED
        );
      });
    });
  });
});
