/**
 * 設定ファイルのテスト
 * 環境変数からの設定取得と環境別の動作を検証
 */

import { logger } from "../../_lib/logger";

// モック設定
jest.mock("../../_lib/env", () => ({
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://test-api.example.com/graphql",
    NEXT_PUBLIC_SENTRY_DSN: "https://test-sentry-dsn@example.com/123",
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: "test",
    NEXT_PUBLIC_APP_VERSION: "1.0.0-test"
  },
  isDevelopment: false,
  isProduction: true
}));

jest.mock("../../_lib/logger", () => ({
  logger: {
    warn: jest.fn()
  }
}));

describe("config", () => {
  let CONFIG: typeof import("../config").CONFIG;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("CONFIG オブジェクト構造", () => {
    beforeEach(async () => {
      const configModule = await import("../config");
      CONFIG = configModule.CONFIG;
    });

    it("正しい構造を持つ", () => {
      expect(CONFIG).toHaveProperty("GRAPHQL_ENDPOINT");
      expect(CONFIG).toHaveProperty("SENTRY");
      expect(CONFIG).toHaveProperty("APP");
      expect(CONFIG).toHaveProperty("IS_DEVELOPMENT");
      expect(CONFIG).toHaveProperty("IS_PRODUCTION");
    });

    it("GRAPHQL_ENDPOINTが環境変数から設定される", () => {
      expect(CONFIG.GRAPHQL_ENDPOINT).toBe("https://test-api.example.com/graphql");
    });

    it("SENTRYセクションが正しい構造を持つ", () => {
      expect(CONFIG.SENTRY).toHaveProperty("DSN");
      expect(CONFIG.SENTRY).toHaveProperty("ENVIRONMENT");
      expect(CONFIG.SENTRY).toHaveProperty("ENABLED");
    });

    it("APPセクションが正しい構造を持つ", () => {
      expect(CONFIG.APP).toHaveProperty("VERSION");
    });
  });

  describe("SENTRY設定", () => {
    describe("本番環境でSentry DSNが設定されている場合", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.example.com/graphql",
            NEXT_PUBLIC_SENTRY_DSN: "https://sentry-dsn@example.com/123",
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: "1.0.0"
          },
          isDevelopment: false,
          isProduction: true
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("Sentryが有効になる", () => {
        expect(CONFIG.SENTRY.ENABLED).toBe(true);
        expect(CONFIG.SENTRY.DSN).toBe("https://sentry-dsn@example.com/123");
        expect(CONFIG.SENTRY.ENVIRONMENT).toBe("production");
      });
    });

    describe("本番環境でSentry DSNが未設定の場合", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.example.com/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: "1.0.0"
          },
          isDevelopment: false,
          isProduction: true
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("Sentryが無効になる", () => {
        expect(CONFIG.SENTRY.ENABLED).toBe(false);
        expect(CONFIG.SENTRY.DSN).toBeUndefined();
      });
    });

    describe("開発環境の場合", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:4000/graphql",
            NEXT_PUBLIC_SENTRY_DSN: "https://sentry-dsn@example.com/123",
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "development",
            NEXT_PUBLIC_APP_VERSION: "dev"
          },
          isDevelopment: true,
          isProduction: false
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("Sentryが無効になる（開発環境のため）", () => {
        expect(CONFIG.SENTRY.ENABLED).toBe(false);
        expect(CONFIG.IS_DEVELOPMENT).toBe(true);
        expect(CONFIG.IS_PRODUCTION).toBe(false);
      });
    });
  });

  describe("APP設定", () => {
    describe("アプリバージョンが設定されている場合", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.example.com/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: "2.1.0"
          },
          isDevelopment: false,
          isProduction: true
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("設定されたバージョンを使用する", () => {
        expect(CONFIG.APP.VERSION).toBe("2.1.0");
      });
    });

    describe("アプリバージョンが未設定の場合", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.example.com/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: undefined
          },
          isDevelopment: false,
          isProduction: true
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("デフォルト値'dev'を使用する", () => {
        expect(CONFIG.APP.VERSION).toBe("dev");
      });
    });
  });

  describe("開発環境での警告", () => {
    describe("デフォルトのGraphQLエンドポイントを使用する場合", () => {
      it("警告がログ出力される", async () => {
        jest.clearAllMocks();
        
        // モジュールキャッシュをクリアして新しいモックを適用
        jest.resetModules();
        
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:4000/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "development",
            NEXT_PUBLIC_APP_VERSION: undefined
          },
          isDevelopment: true,
          isProduction: false
        }));

        jest.doMock("../../_lib/logger", () => ({
          logger: {
            warn: jest.fn()
          }
        }));

        // モジュールを新しくimportして警告ロジックを実行
        const { logger: mockedLogger } = await import("../../_lib/logger");
        await import("../config");

        expect(mockedLogger.warn).toHaveBeenCalledWith(
          "NEXT_PUBLIC_GRAPHQL_ENDPOINTが未設定のためデフォルト値を使用",
          {
            component: "config",
            meta: { defaultEndpoint: "http://localhost:4000/graphql" }
          }
        );
      });
    });

    describe("カスタムのGraphQLエンドポイントを使用する場合", () => {
      it("警告が出力されない", async () => {
        jest.clearAllMocks(); // 前のテストの影響をクリア
        
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:3000/api/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "development",
            NEXT_PUBLIC_APP_VERSION: undefined
          },
          isDevelopment: true,
          isProduction: false
        }));

        await import("../config");

        expect(logger.warn).not.toHaveBeenCalled();
      });
    });

    describe("本番環境の場合", () => {
      it("警告が出力されない（開発環境ではないため）", async () => {
        jest.clearAllMocks(); // 前のテストの影響をクリア
        
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:4000/graphql",
            NEXT_PUBLIC_SENTRY_DSN: undefined,
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: undefined
          },
          isDevelopment: false,
          isProduction: true
        }));

        await import("../config");

        expect(logger.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe("型の不変性", () => {
    beforeEach(async () => {
      const configModule = await import("../config");
      CONFIG = configModule.CONFIG;
    });

    it("CONFIGオブジェクトの構造が保持される", () => {
      // as constによる型レベルの不変性をランタイムで確認
      // JavaScriptランタイムでは完全なreadonlyは強制されないが、
      // 構造の整合性は保たれる
      expect(CONFIG).toHaveProperty("GRAPHQL_ENDPOINT");
      expect(CONFIG).toHaveProperty("SENTRY");
      expect(CONFIG).toHaveProperty("APP");
      expect(CONFIG).toHaveProperty("IS_DEVELOPMENT");
      expect(CONFIG).toHaveProperty("IS_PRODUCTION");
    });

    it("プロパティが期待される型構造を持つ", () => {
      expect(typeof CONFIG.GRAPHQL_ENDPOINT).toBe("string");
      // SENTRY.DSNは環境によってstring | undefinedになる
      expect(["string", "undefined"]).toContain(typeof CONFIG.SENTRY.DSN);
      expect(typeof CONFIG.SENTRY.ENVIRONMENT).toBe("string");
      expect(typeof CONFIG.SENTRY.ENABLED).toBe("boolean");
      expect(typeof CONFIG.APP.VERSION).toBe("string");
      expect(typeof CONFIG.IS_DEVELOPMENT).toBe("boolean");
      expect(typeof CONFIG.IS_PRODUCTION).toBe("boolean");
    });
  });

  describe("設定の整合性", () => {
    describe("開発環境の設定", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:4000/graphql",
            NEXT_PUBLIC_SENTRY_DSN: "https://test-dsn@example.com/123",
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "development",
            NEXT_PUBLIC_APP_VERSION: "dev"
          },
          isDevelopment: true,
          isProduction: false
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("開発環境フラグが正しく設定される", () => {
        expect(CONFIG.IS_DEVELOPMENT).toBe(true);
        expect(CONFIG.IS_PRODUCTION).toBe(false);
      });

      it("Sentryが無効になる（開発環境のため）", () => {
        expect(CONFIG.SENTRY.ENABLED).toBe(false);
      });
    });

    describe("本番環境の設定", () => {
      beforeEach(async () => {
        jest.doMock("../../_lib/env", () => ({
          env: {
            NEXT_PUBLIC_GRAPHQL_ENDPOINT: "https://api.prod.example.com/graphql",
            NEXT_PUBLIC_SENTRY_DSN: "https://prod-dsn@example.com/123",
            NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
            NEXT_PUBLIC_APP_VERSION: "1.0.0"
          },
          isDevelopment: false,
          isProduction: true
        }));

        const configModule = await import("../config");
        CONFIG = configModule.CONFIG;
      });

      it("本番環境フラグが正しく設定される", () => {
        expect(CONFIG.IS_DEVELOPMENT).toBe(false);
        expect(CONFIG.IS_PRODUCTION).toBe(true);
      });

      it("Sentryが有効になる（本番環境でDSNが設定されているため）", () => {
        expect(CONFIG.SENTRY.ENABLED).toBe(true);
      });
    });
  });
});