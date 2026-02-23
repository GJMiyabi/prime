import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
} from '../auth.mutations';
import { gql } from '@apollo/client';

describe('auth.mutations', () => {
  describe('LOGIN_MUTATION', () => {
    it('LOGIN_MUTATIONミューテーションが定義されている', () => {
      expect(LOGIN_MUTATION).toBeDefined();
    });

    it('LOGIN_MUTATIONはDocumentNodeオブジェクト', () => {
      expect(LOGIN_MUTATION.kind).toBe('Document');
    });

    it('LOGIN_MUTATIONミューテーションに必要なフィールドが含まれる', () => {
      const mutationString = LOGIN_MUTATION.loc?.source.body;

      expect(mutationString).toContain('mutation Login');
      expect(mutationString).toContain('$input');
      expect(mutationString).toContain('LoginInput!');
      expect(mutationString).toContain('login');
      expect(mutationString).toContain('accessToken');
    });

    it('LOGIN_MUTATIONミューテーション名がLogin', () => {
      const mutationString = LOGIN_MUTATION.loc?.source.body;
      expect(mutationString).toMatch(/mutation\s+Login/);
    });

    it('LOGIN_MUTATIONミューテーションにinput引数が必須', () => {
      const mutationString = LOGIN_MUTATION.loc?.source.body;
      expect(mutationString).toContain('$input: LoginInput!');
    });
  });

  describe('LOGOUT_MUTATION', () => {
    it('LOGOUT_MUTATIONミューテーションが定義されている', () => {
      expect(LOGOUT_MUTATION).toBeDefined();
    });

    it('LOGOUT_MUTATIONはDocumentNodeオブジェクト', () => {
      expect(LOGOUT_MUTATION.kind).toBe('Document');
    });

    it('LOGOUT_MUTATIONミューテーションに必要なフィールドが含まれる', () => {
      const mutationString = LOGOUT_MUTATION.loc?.source.body;

      expect(mutationString).toContain('mutation Logout');
      expect(mutationString).toContain('logout');
      expect(mutationString).toContain('success');
      expect(mutationString).toContain('message');
    });

    it('LOGOUT_MUTATIONミューテーション名がLogout', () => {
      const mutationString = LOGOUT_MUTATION.loc?.source.body;
      expect(mutationString).toMatch(/mutation\s+Logout/);
    });

    it('LOGOUT_MUTATIONミューテーションに引数がない', () => {
      const mutationString = LOGOUT_MUTATION.loc?.source.body;
      expect(mutationString).not.toContain('$');
    });
  });

  describe('REFRESH_TOKEN_MUTATION', () => {
    it('REFRESH_TOKEN_MUTATIONミューテーションが定義されている', () => {
      expect(REFRESH_TOKEN_MUTATION).toBeDefined();
    });

    it('REFRESH_TOKEN_MUTATIONはDocumentNodeオブジェクト', () => {
      expect(REFRESH_TOKEN_MUTATION.kind).toBe('Document');
    });

    it('REFRESH_TOKEN_MUTATIONミューテーションに必要なフィールドが含まれる', () => {
      const mutationString = REFRESH_TOKEN_MUTATION.loc?.source.body;

      expect(mutationString).toContain('mutation RefreshToken');
      expect(mutationString).toContain('$refreshToken');
      expect(mutationString).toContain('String!');
      expect(mutationString).toContain('refreshToken');
      expect(mutationString).toContain('accessToken');
    });

    it('REFRESH_TOKEN_MUTATIONミューテーション名がRefreshToken', () => {
      const mutationString = REFRESH_TOKEN_MUTATION.loc?.source.body;
      expect(mutationString).toMatch(/mutation\s+RefreshToken/);
    });

    it('REFRESH_TOKEN_MUTATIONミューテーションにrefreshToken引数が必須', () => {
      const mutationString = REFRESH_TOKEN_MUTATION.loc?.source.body;
      expect(mutationString).toContain('$refreshToken: String!');
    });

    it('REFRESH_TOKEN_MUTATIONの戻り値にaccessTokenとrefreshTokenが含まれる', () => {
      const mutationString = REFRESH_TOKEN_MUTATION.loc?.source.body;
      expect(mutationString).toContain('accessToken');
      expect(mutationString).toContain('refreshToken');
    });
  });

  describe('GraphQL定義の構造', () => {
    it('gqlタグで作成されたミューテーションはloc.sourceを持つ', () => {
      expect(LOGIN_MUTATION.loc).toBeDefined();
      expect(LOGIN_MUTATION.loc?.source).toBeDefined();
      expect(LOGOUT_MUTATION.loc).toBeDefined();
      expect(LOGOUT_MUTATION.loc?.source).toBeDefined();
      expect(REFRESH_TOKEN_MUTATION.loc).toBeDefined();
      expect(REFRESH_TOKEN_MUTATION.loc?.source).toBeDefined();
    });

    it('全てのミューテーションがdefinitionsを持つ', () => {
      expect(LOGIN_MUTATION.definitions).toBeDefined();
      expect(LOGIN_MUTATION.definitions.length).toBeGreaterThan(0);
      expect(LOGOUT_MUTATION.definitions).toBeDefined();
      expect(LOGOUT_MUTATION.definitions.length).toBeGreaterThan(0);
      expect(REFRESH_TOKEN_MUTATION.definitions).toBeDefined();
      expect(REFRESH_TOKEN_MUTATION.definitions.length).toBeGreaterThan(0);
    });

    it('gql関数で作成したミューテーションと同じ構造', () => {
      const testMutation = gql`
        mutation Test {
          test
        }
      `;

      expect(LOGIN_MUTATION.kind).toBe(testMutation.kind);
      expect(LOGOUT_MUTATION.kind).toBe(testMutation.kind);
      expect(REFRESH_TOKEN_MUTATION.kind).toBe(testMutation.kind);
    });
  });

  describe('ミューテーション種別', () => {
    it('全てのミューテーション定義がミューテーション操作', () => {
      const operations = [
        LOGIN_MUTATION,
        LOGOUT_MUTATION,
        REFRESH_TOKEN_MUTATION,
      ];

      operations.forEach((operation) => {
        const def = operation.definitions[0];
        expect(def.kind).toBe('OperationDefinition');
        if (def.kind === 'OperationDefinition') {
          expect(def.operation).toBe('mutation');
        }
      });
    });
  });
});
