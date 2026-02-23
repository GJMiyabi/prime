/**
 * 環境変数管理ファイルのテスト
 * zodバリデーション、型安全性、エラーハンドリングを検証
 */

describe("lib/env", () => {
  // 元のprocess.envを保存
  const originalEnv = process.env;

  beforeEach(() => {
    // 各テストの前にprocess.envをリセット
    jest.resetModules();
  });

  afterEach(() => {
    // テスト後に元のenvironmentを復元
    process.env = originalEnv;
  });

  describe("環境変数パース", () => {
    it("デフォルト値を使用して正常にパースされる", async () => {
      // NODE_ENVのみ設定
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
      };

      const { env } = await import("../env");

      expect(env.NODE_ENV).toBe("development");
      expect(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT).toBe("http://localhost:4000/graphql");
      expect(env.NEXT_PUBLIC_SENTRY_ENVIRONMENT).toBe("development");
    });

    it("すべての環境変数を設定した場合に正常にパースされる", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "production",
        NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.example.com/graphql",
        NEXT_PUBLIC_SENTRY_DSN: "https://sentry.example.com/123",
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
        NEXT_PUBLIC_APP_VERSION: "1.2.3",
      };

      const { env } = await import("../env");

      expect(env.NODE_ENV).toBe("production");
      expect(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT).toBe("https://api.example.com/graphql");
      expect(env.NEXT_PUBLIC_SENTRY_DSN).toBe("https://sentry.example.com/123");
      expect(env.NEXT_PUBLIC_SENTRY_ENVIRONMENT).toBe("production");
      expect(env.NEXT_PUBLIC_APP_VERSION).toBe("1.2.3");
    });

    it("test環境で正常にパースされる", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "test",
      };

      const { env } = await import("../env");

      expect(env.NODE_ENV).toBe("test");
      expect(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT).toBe("http://localhost:4000/graphql");
    });
  });

  describe("バリデーションエラー", () => {
    it("無効なNODE_ENVでエラーが発生する", async () => {
      process.env = {
        ...originalEnv,
        // @ts-expect-error - 意図的に無効な値をテスト
        NODE_ENV: "invalid",
      };

      await expect(import("../env")).rejects.toThrow("環境変数のバリデーションエラー");
    });

    it("無効なGraphQLエンドポイントURLでエラーが発生する", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
        NEXT_PUBLIC_GRAPHQL_ENDPOINT: "invalid-url",
      };

      await expect(import("../env")).rejects.toThrow("環境変数のバリデーションエラー");
    });

    it("エラーメッセージに具体的な問題が含まれる", async () => {
      process.env = {
        ...originalEnv,
        // @ts-expect-error - 意図的に無効な値をテスト
        NODE_ENV: "invalid",
        NEXT_PUBLIC_GRAPHQL_ENDPOINT: "not-a-url",
      };

      try {
        await import("../env");
        fail("エラーが発生するべき");
      } catch (error: unknown) {
        expect((error as Error).message).toContain("NODE_ENV");
        expect((error as Error).message).toContain("NEXT_PUBLIC_GRAPHQL_ENDPOINT");
        expect((error as Error).message).toContain(".env.localファイルを確認してください");
      }
    });
  });

  describe("環境判定ヘルパー", () => {
    it("isDevelopmentが正しく動作する", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
      };

      const { isDevelopment, isProduction, isTest } = await import("../env");

      expect(isDevelopment).toBe(true);
      expect(isProduction).toBe(false);
      expect(isTest).toBe(false);
    });

    it("isProductionが正しく動作する", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "production",
      };

      const { isDevelopment, isProduction, isTest } = await import("../env");

      expect(isDevelopment).toBe(false);
      expect(isProduction).toBe(true);
      expect(isTest).toBe(false);
    });

    it("isTestが正しく動作する", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "test",
      };

      const { isDevelopment, isProduction, isTest } = await import("../env");

      expect(isDevelopment).toBe(false);
      expect(isProduction).toBe(false);
      expect(isTest).toBe(true);
    });
  });

  describe("キャッシュ機能", () => {
    it("複数回インポートしても同じ値を返す", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
        NEXT_PUBLIC_APP_VERSION: "1.0.0",
      };

      const { env: env1 } = await import("../env");
      const { env: env2 } = await import("../env");

      expect(env1).toBe(env2); // 同じオブジェクト参照
      expect(env1.NEXT_PUBLIC_APP_VERSION).toBe("1.0.0");
      expect(env2.NEXT_PUBLIC_APP_VERSION).toBe("1.0.0");
    });
  });

  describe("オプションフィールド", () => {
    it("NEXT_PUBLIC_SENTRY_DSNが未設定でもエラーにならない", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
      };

      const { env } = await import("../env");

      expect(env.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
      expect(env.NODE_ENV).toBe("development");
    });

    it("NEXT_PUBLIC_APP_VERSIONが未設定でもエラーにならない", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "production",
      };

      const { env } = await import("../env");

      expect(env.NEXT_PUBLIC_APP_VERSION).toBeUndefined();
      expect(env.NODE_ENV).toBe("production");
    });
  });

  describe("型安全性", () => {
    it("envオブジェクトが正しい型を持つ", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development",
      };

      const { env } = await import("../env");

      // TypeScriptの型チェックでこれらが通る
      expect(typeof env.NODE_ENV).toBe("string");
      expect(typeof env.NEXT_PUBLIC_GRAPHQL_ENDPOINT).toBe("string");
      expect(typeof env.NEXT_PUBLIC_SENTRY_ENVIRONMENT).toBe("string");
      expect(["string", "undefined"]).toContain(typeof env.NEXT_PUBLIC_SENTRY_DSN);
      expect(["string", "undefined"]).toContain(typeof env.NEXT_PUBLIC_APP_VERSION);
    });
  });
});