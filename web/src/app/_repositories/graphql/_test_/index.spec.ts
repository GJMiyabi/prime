// GraphQL定義の統合エクスポートをテスト

describe('graphql/index', () => {
  describe('Mutations export', () => {
    it('auth.mutationsからミューテーションが再エクスポートされる', async () => {
      const mutations = await import('../mutations');

      expect(mutations.LOGIN_MUTATION).toBeDefined();
      expect(mutations.LOGOUT_MUTATION).toBeDefined();
      expect(mutations.REFRESH_TOKEN_MUTATION).toBeDefined();
    });

    it('indexファイル経由でミューテーションにアクセスできる', async () => {
      const graphqlModule = await import('../index');

      expect(graphqlModule.LOGIN_MUTATION).toBeDefined();
      expect(graphqlModule.LOGOUT_MUTATION).toBeDefined();
      expect(graphqlModule.REFRESH_TOKEN_MUTATION).toBeDefined();
    });
  });

  describe('Queries export', () => {
    it('auth.queriesからクエリが再エクスポートされる', async () => {
      const queries = await import('../queries');

      expect(queries.GET_CURRENT_USER).toBeDefined();
      expect(queries.VERIFY_TOKEN).toBeDefined();
    });

    it('indexファイル経由でクエリにアクセスできる', async () => {
      const graphqlModule = await import('../index');

      expect(graphqlModule.GET_CURRENT_USER).toBeDefined();
      expect(graphqlModule.VERIFY_TOKEN).toBeDefined();
    });
  });

  describe('統合エクスポート', () => {
    it('全てのGraphQL定義が一元管理される', async () => {
      const graphqlModule = await import('../index');

      // Mutations
      expect(graphqlModule.LOGIN_MUTATION).toBeDefined();
      expect(graphqlModule.LOGOUT_MUTATION).toBeDefined();
      expect(graphqlModule.REFRESH_TOKEN_MUTATION).toBeDefined();

      // Queries
      expect(graphqlModule.GET_CURRENT_USER).toBeDefined();
      expect(graphqlModule.VERIFY_TOKEN).toBeDefined();
    });

    it('mutations/indexとqueries/indexが正しくエクスポートされる', async () => {
      const mutationsIndex = await import('../mutations/index');
      const queriesIndex = await import('../queries/index');

      // Mutations
      expect(mutationsIndex.LOGIN_MUTATION).toBeDefined();
      expect(mutationsIndex.LOGOUT_MUTATION).toBeDefined();
      expect(mutationsIndex.REFRESH_TOKEN_MUTATION).toBeDefined();

      // Queries
      expect(queriesIndex.GET_CURRENT_USER).toBeDefined();
      expect(queriesIndex.VERIFY_TOKEN).toBeDefined();
    });
  });

  describe('モジュール構造', () => {
    it('mutations/indexが個別ファイルからエクスポートする', async () => {
      const authMutations = await import('../mutations/auth.mutations');
      const mutationsIndex = await import('../mutations/index');

      // 同じオブジェクトを参照
      expect(mutationsIndex.LOGIN_MUTATION).toBe(authMutations.LOGIN_MUTATION);
      expect(mutationsIndex.LOGOUT_MUTATION).toBe(
        authMutations.LOGOUT_MUTATION
      );
      expect(mutationsIndex.REFRESH_TOKEN_MUTATION).toBe(
        authMutations.REFRESH_TOKEN_MUTATION
      );
    });

    it('queries/indexが個別ファイルからエクスポートする', async () => {
      const authQueries = await import('../queries/auth.queries');
      const queriesIndex = await import('../queries/index');

      // 同じオブジェクトを参照
      expect(queriesIndex.GET_CURRENT_USER).toBe(authQueries.GET_CURRENT_USER);
      expect(queriesIndex.VERIFY_TOKEN).toBe(authQueries.VERIFY_TOKEN);
    });
  });
});
