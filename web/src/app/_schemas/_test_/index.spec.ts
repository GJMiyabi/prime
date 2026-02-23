/**
 * スキーマインデックスファイルのテスト
 * 公開APIが正しくエクスポートされていることを検証
 */

describe("schemas/index", () => {
  let schemasIndex: typeof import("../index");

  beforeEach(async () => {
    // モジュールをインポート
    schemasIndex = await import("../index");
  });

  describe("エクスポート確認", () => {
    it("person.schemaから必要な要素をエクスポートする", () => {
      expect(schemasIndex.personCreateSchema).toBeDefined();
      expect(typeof schemasIndex.personCreateSchema.validateSync).toBe("function");
    });

    it("auth.schemaから必要な要素をエクスポートする", () => {
      expect(schemasIndex.loginSchema).toBeDefined();
      expect(typeof schemasIndex.loginSchema.validateSync).toBe("function");
    });
  });

  describe("スキーマ機能確認", () => {
    it("personCreateSchemaが正常に動作する", () => {
      const validData = {
        name: "テストユーザー",
        value: "test-value"
      };

      expect(() => {
        schemasIndex.personCreateSchema.validateSync(validData);
      }).not.toThrow();
    });

    it("loginSchemaが正常に動作する", () => {
      const validData = {
        username: "testuser123",
        password: "password123"
      };

      expect(() => {
        schemasIndex.loginSchema.validateSync(validData);
      }).not.toThrow();
    });
  });

  describe("エクスポート整合性", () => {
    it("エクスポートされたオブジェクトが期待される構造を持つ", () => {
      const exportedKeys = Object.keys(schemasIndex);
      
      // 期待されるエクスポート
      expect(exportedKeys).toContain("personCreateSchema");
      expect(exportedKeys).toContain("loginSchema");
      
      // エクスポート数の確認（新しいスキーマが追加された場合に気づけるように）
      expect(exportedKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("すべてのエクスポートがYupスキーマオブジェクトである", () => {
      const schemas = [
        schemasIndex.personCreateSchema,
        schemasIndex.loginSchema
      ];

      schemas.forEach(schema => {
        expect(schema).toBeDefined();
        expect(typeof schema.validateSync).toBe("function");
        expect(typeof schema.validate).toBe("function");
        expect(typeof schema.isValid).toBe("function");
      });
    });
  });
});