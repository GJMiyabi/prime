/**
 * バリデーションインデックスファイルのテスト
 * ドメインバリデーションの公開APIが正しくエクスポートされていることを検証
 */

describe("validations/index", () => {
  let validationsIndex: typeof import("../index");

  beforeEach(async () => {
    // モジュールをインポート
    validationsIndex = await import("../index");
  });

  describe("person.validationからのエクスポート確認", () => {
    it("PersonValidationRulesがエクスポートされている", () => {
      expect(validationsIndex.PersonValidationRules).toBeDefined();
      expect(typeof validationsIndex.PersonValidationRules).toBe("object");
      expect(validationsIndex.PersonValidationRules.name).toBeDefined();
      expect(validationsIndex.PersonValidationRules.value).toBeDefined();
    });

    it("validatePersonNameがエクスポートされている", () => {
      expect(validationsIndex.validatePersonName).toBeDefined();
      expect(typeof validationsIndex.validatePersonName).toBe("function");
    });

    it("validatePersonValueがエクスポートされている", () => {
      expect(validationsIndex.validatePersonValue).toBeDefined();
      expect(typeof validationsIndex.validatePersonValue).toBe("function");
    });

    it("createValidatedPersonNameがエクスポートされている", () => {
      expect(validationsIndex.createValidatedPersonName).toBeDefined();
      expect(typeof validationsIndex.createValidatedPersonName).toBe("function");
    });

    it("createValidatedPersonValueがエクスポートされている", () => {
      expect(validationsIndex.createValidatedPersonValue).toBeDefined();
      expect(typeof validationsIndex.createValidatedPersonValue).toBe("function");
    });
  });

  describe("auth.validationからのエクスポート確認", () => {
    it("AuthValidationRulesがエクスポートされている", () => {
      expect(validationsIndex.AuthValidationRules).toBeDefined();
      expect(typeof validationsIndex.AuthValidationRules).toBe("object");
      expect(validationsIndex.AuthValidationRules.username).toBeDefined();
      expect(validationsIndex.AuthValidationRules.password).toBeDefined();
    });

    it("validateUsernameがエクスポートされている", () => {
      expect(validationsIndex.validateUsername).toBeDefined();
      expect(typeof validationsIndex.validateUsername).toBe("function");
    });

    it("validatePasswordがエクスポートされている", () => {
      expect(validationsIndex.validatePassword).toBeDefined();
      expect(typeof validationsIndex.validatePassword).toBe("function");
    });
  });

  describe("バリデーションルール構造確認", () => {
    it("PersonValidationRulesが正しい構造を持つ", () => {
      const { PersonValidationRules } = validationsIndex;
      
      expect(PersonValidationRules.name).toHaveProperty("minLength");
      expect(PersonValidationRules.name).toHaveProperty("maxLength");
      expect(PersonValidationRules.name).toHaveProperty("required");
      expect(PersonValidationRules.value).toHaveProperty("required");
      
      // 値の型確認
      expect(typeof PersonValidationRules.name.minLength).toBe("number");
      expect(typeof PersonValidationRules.name.maxLength).toBe("number");
      expect(typeof PersonValidationRules.name.required).toBe("boolean");
      expect(typeof PersonValidationRules.value.required).toBe("boolean");
    });

    it("AuthValidationRulesが正しい構造を持つ", () => {
      const { AuthValidationRules } = validationsIndex;
      
      expect(AuthValidationRules.username).toHaveProperty("minLength");
      expect(AuthValidationRules.username).toHaveProperty("maxLength");
      expect(AuthValidationRules.username).toHaveProperty("required");
      expect(AuthValidationRules.username).toHaveProperty("pattern");
      expect(AuthValidationRules.password).toHaveProperty("minLength");
      expect(AuthValidationRules.password).toHaveProperty("required");
      
      // 値の型確認
      expect(typeof AuthValidationRules.username.minLength).toBe("number");
      expect(typeof AuthValidationRules.username.maxLength).toBe("number");
      expect(typeof AuthValidationRules.username.required).toBe("boolean");
      expect(AuthValidationRules.username.pattern).toBeInstanceOf(RegExp);
      expect(typeof AuthValidationRules.password.minLength).toBe("number");
      expect(typeof AuthValidationRules.password.required).toBe("boolean");
    });
  });

  describe("バリデーション関数の動作確認", () => {
    it("validatePersonNameが正常に動作する", () => {
      const { validatePersonName } = validationsIndex;
      
      // 有効な名前
      const validResult = validatePersonName("テストユーザー");
      expect(validResult).toHaveProperty("isValid");
      expect(typeof validResult.isValid).toBe("boolean");
      
      // 短すぎる名前
      const invalidResult = validatePersonName("a");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });

    it("validatePersonValueが正常に動作する", () => {
      const { validatePersonValue } = validationsIndex;
      
      // 有効な値
      const validResult = validatePersonValue("test-value");
      expect(validResult).toHaveProperty("isValid");
      expect(typeof validResult.isValid).toBe("boolean");
      
      // 空の値
      const invalidResult = validatePersonValue("");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });

    it("validateUsernameが正常に動作する", () => {
      const { validateUsername } = validationsIndex;
      
      // 有効なユーザー名
      const validResult = validateUsername("testuser123");
      expect(validResult).toHaveProperty("isValid");
      expect(typeof validResult.isValid).toBe("boolean");
      
      // 短すぎるユーザー名
      const invalidResult = validateUsername("ab");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });

    it("validatePasswordが正常に動作する", () => {
      const { validatePassword } = validationsIndex;
      
      // 有効なパスワード
      const validResult = validatePassword("password123");
      expect(validResult).toHaveProperty("isValid");
      expect(typeof validResult.isValid).toBe("boolean");
      
      // 短すぎるパスワード
      const invalidResult = validatePassword("123");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe("ファクトリー関数の動作確認", () => {
    it("createValidatedPersonNameが正常に動作する", () => {
      const { createValidatedPersonName } = validationsIndex;
      
      // 有効な名前
      const validResult = createValidatedPersonName("テストユーザー");
      expect(validResult).not.toBeNull();
      expect(typeof validResult).toBe("string");
      
      // 無効な名前（短すぎ）
      const invalidResult = createValidatedPersonName("a");
      expect(invalidResult).toBeNull();
      
      // 空白文字のトリム確認
      const trimmedResult = createValidatedPersonName("  テストユーザー  ");
      expect(trimmedResult).not.toBeNull();
      expect(trimmedResult).toBe("テストユーザー");
    });

    it("createValidatedPersonValueが正常に動作する", () => {
      const { createValidatedPersonValue } = validationsIndex;
      
      // 有効な値
      const validResult = createValidatedPersonValue("test-value");
      expect(validResult).not.toBeNull();
      expect(typeof validResult).toBe("string");
      
      // 無効な値（空）
      const invalidResult = createValidatedPersonValue("");
      expect(invalidResult).toBeNull();
      
      // 空白文字のトリム確認
      const trimmedResult = createValidatedPersonValue("  test-value  ");
      expect(trimmedResult).not.toBeNull();
      expect(trimmedResult).toBe("test-value");
    });
  });

  describe("エクスポート整合性", () => {
    it("期待されるすべてのエクスポートが存在する", () => {
      const expectedExports = [
        // person.validation exports
        "PersonValidationRules",
        "validatePersonName",
        "validatePersonValue", 
        "createValidatedPersonName",
        "createValidatedPersonValue",
        // auth.validation exports
        "AuthValidationRules",
        "validateUsername",
        "validatePassword"
      ];

      expectedExports.forEach(exportName => {
        expect(validationsIndex).toHaveProperty(exportName);
        expect(validationsIndex[exportName as keyof typeof validationsIndex]).toBeDefined();
      });
    });

    it("エクスポートされた関数がすべて関数型である", () => {
      const functionExports = [
        "validatePersonName",
        "validatePersonValue",
        "createValidatedPersonName", 
        "createValidatedPersonValue",
        "validateUsername",
        "validatePassword"
      ];

      functionExports.forEach(funcName => {
        expect(typeof validationsIndex[funcName as keyof typeof validationsIndex]).toBe("function");
      });
    });

    it("エクスポートされたオブジェクトがすべてオブジェクト型である", () => {
      const objectExports = [
        "PersonValidationRules",
        "AuthValidationRules"
      ];

      objectExports.forEach(objName => {
        expect(typeof validationsIndex[objName as keyof typeof validationsIndex]).toBe("object");
        expect(validationsIndex[objName as keyof typeof validationsIndex]).not.toBeNull();
      });
    });
  });

  describe("モジュール間接続", () => {
    it("PersonValidationRulesが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { PersonValidationRules: DirectImport } = await import("../person.validation");
      
      expect(validationsIndex.PersonValidationRules).toBe(DirectImport);
    });

    it("AuthValidationRulesが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { AuthValidationRules: DirectImport } = await import("../auth.validation");
      
      expect(validationsIndex.AuthValidationRules).toBe(DirectImport);
    });

    it("validatePersonNameが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { validatePersonName: DirectImport } = await import("../person.validation");
      
      expect(validationsIndex.validatePersonName).toBe(DirectImport);
    });

    it("validateUsernameが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { validateUsername: DirectImport } = await import("../auth.validation");
      
      expect(validationsIndex.validateUsername).toBe(DirectImport);
    });
  });

  describe("バリデーション結果の構造", () => {
    it("すべてのバリデーション関数がValidationResult形式を返す", () => {
      const { validatePersonName, validateUsername, validatePassword, validatePersonValue } = validationsIndex;
      
      const validationFunctions = [
        () => validatePersonName("test"),
        () => validateUsername("testuser"),
        () => validatePassword("testpass123"),
        () => validatePersonValue("testvalue")
      ];

      validationFunctions.forEach(fn => {
        const result = fn();
        expect(result).toHaveProperty("isValid");
        expect(typeof result.isValid).toBe("boolean");
        
        if (!result.isValid) {
          expect(result).toHaveProperty("error");
          expect(typeof result.error).toBe("string");
        }
      });
    });

    it("ファクトリー関数が正しい形式で値を返す", () => {
      const { createValidatedPersonName, createValidatedPersonValue } = validationsIndex;
      
      // 有効な入力に対して文字列を返す
      const validName = createValidatedPersonName("テストユーザー");
      const validValue = createValidatedPersonValue("test-value");
      
      expect(validName).not.toBeNull();
      expect(typeof validName).toBe("string");
      expect(validValue).not.toBeNull();
      expect(typeof validValue).toBe("string");
      
      // 無効な入力に対してnullを返す
      const invalidName = createValidatedPersonName("");
      const invalidValue = createValidatedPersonValue("");
      
      expect(invalidName).toBeNull();
      expect(invalidValue).toBeNull();
    });
  });
});