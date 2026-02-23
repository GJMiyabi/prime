import { GET_CURRENT_USER, VERIFY_TOKEN } from '../auth.queries';
import { gql } from '@apollo/client';

describe('auth.queries', () => {
  describe('GET_CURRENT_USER', () => {
    it('GET_CURRENT_USERクエリが定義されている', () => {
      expect(GET_CURRENT_USER).toBeDefined();
    });

    it('GET_CURRENT_USERはDocumentNodeオブジェクト', () => {
      expect(GET_CURRENT_USER.kind).toBe('Document');
    });

    it('GET_CURRENT_USERクエリに必要なフィールドが含まれる', () => {
      const queryString = GET_CURRENT_USER.loc?.source.body;

      expect(queryString).toContain('query GetCurrentUser');
      expect(queryString).toContain('currentUser');
      expect(queryString).toContain('id');
      expect(queryString).toContain('username');
      expect(queryString).toContain('email');
      expect(queryString).toContain('role');
    });

    it('GET_CURRENT_USERクエリ名がGetCurrentUser', () => {
      const queryString = GET_CURRENT_USER.loc?.source.body;
      expect(queryString).toMatch(/query\s+GetCurrentUser/);
    });
  });

  describe('VERIFY_TOKEN', () => {
    it('VERIFY_TOKENクエリが定義されている', () => {
      expect(VERIFY_TOKEN).toBeDefined();
    });

    it('VERIFY_TOKENはDocumentNodeオブジェクト', () => {
      expect(VERIFY_TOKEN.kind).toBe('Document');
    });

    it('VERIFY_TOKENクエリに必要なフィールドが含まれる', () => {
      const queryString = VERIFY_TOKEN.loc?.source.body;

      expect(queryString).toContain('query VerifyToken');
      expect(queryString).toContain('$token');
      expect(queryString).toContain('String!');
      expect(queryString).toContain('verifyToken');
      expect(queryString).toContain('valid');
      expect(queryString).toContain('expiresAt');
    });

    it('VERIFY_TOKENクエリ名がVerifyToken', () => {
      const queryString = VERIFY_TOKEN.loc?.source.body;
      expect(queryString).toMatch(/query\s+VerifyToken/);
    });

    it('VERIFY_TOKENクエリにtoken引数が必須', () => {
      const queryString = VERIFY_TOKEN.loc?.source.body;
      expect(queryString).toContain('$token: String!');
    });
  });

  describe('GraphQL定義の構造', () => {
    it('gqlタグで作成されたクエリはloc.sourceを持つ', () => {
      expect(GET_CURRENT_USER.loc).toBeDefined();
      expect(GET_CURRENT_USER.loc?.source).toBeDefined();
      expect(VERIFY_TOKEN.loc).toBeDefined();
      expect(VERIFY_TOKEN.loc?.source).toBeDefined();
    });

    it('全てのクエリがdefinitionsを持つ', () => {
      expect(GET_CURRENT_USER.definitions).toBeDefined();
      expect(GET_CURRENT_USER.definitions.length).toBeGreaterThan(0);
      expect(VERIFY_TOKEN.definitions).toBeDefined();
      expect(VERIFY_TOKEN.definitions.length).toBeGreaterThan(0);
    });

    it('gql関数で作成したクエリと同じ構造', () => {
      const testQuery = gql`
        query Test {
          test
        }
      `;

      expect(GET_CURRENT_USER.kind).toBe(testQuery.kind);
      expect(VERIFY_TOKEN.kind).toBe(testQuery.kind);
    });
  });
});
