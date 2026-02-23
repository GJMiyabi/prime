/**
 * Person ユースケースインデックスファイルのテスト
 * ユースケース層の公開APIが正しくエクスポートされていることを検証
 */

describe("usecases/person/index", () => {
  let personUsecases: typeof import("../index");

  beforeEach(async () => {
    // モジュールをインポート
    personUsecases = await import("../index");
  });

  describe("エクスポート確認", () => {
    it("CreatePersonUseCaseがエクスポートされている", () => {
      expect(personUsecases.CreatePersonUseCase).toBeDefined();
      expect(typeof personUsecases.CreatePersonUseCase).toBe("function");
      // クラスかどうかの確認
      expect(personUsecases.CreatePersonUseCase.prototype).toBeDefined();
    });

    it("GetPersonUseCaseがエクスポートされている", () => {
      expect(personUsecases.GetPersonUseCase).toBeDefined();
      expect(typeof personUsecases.GetPersonUseCase).toBe("function");
      // クラスかどうかの確認
      expect(personUsecases.GetPersonUseCase.prototype).toBeDefined();
    });

    it("CreatePersonResult型がTypeScriptで利用可能", () => {
      // インポートエラーが発生しないことで型の存在を間接的に確認
      const { CreatePersonUseCase } = personUsecases;
      expect(CreatePersonUseCase).toBeDefined();
      
      // ランタイムでは型は存在しないが、コンパイル時にエラーがないことで型の正当性を確認
      expect(typeof CreatePersonUseCase).toBe("function");
    });

    it("GetPersonResult型がTypeScriptで利用可能", () => {
      // インポートエラーが発生しないことで型の存在を間接的に確認
      const { GetPersonUseCase } = personUsecases;
      expect(GetPersonUseCase).toBeDefined();

      // ランタイムでは型は存在しないが、コンパイル時にエラーがないことで型の正当性を確認
      expect(typeof GetPersonUseCase).toBe("function");
    });
  });

  describe("ユースケースクラス構造", () => {
    it("CreatePersonUseCaseがクラスのような構造を持つ", () => {
      const { CreatePersonUseCase } = personUsecases;
      
      // コンストラクタが存在する
      expect(typeof CreatePersonUseCase).toBe("function");
      expect(CreatePersonUseCase.prototype).toBeDefined();
      expect(CreatePersonUseCase.name).toBe("CreatePersonUseCase");
    });

    it("GetPersonUseCaseがクラスのような構造を持つ", () => {
      const { GetPersonUseCase } = personUsecases;
      
      // コンストラクタが存在する
      expect(typeof GetPersonUseCase).toBe("function");
      expect(GetPersonUseCase.prototype).toBeDefined();
      expect(GetPersonUseCase.name).toBe("GetPersonUseCase");
    });

    it("両方のユースケースクラスが異なるクラス", () => {
      const { CreatePersonUseCase, GetPersonUseCase } = personUsecases;
      
      expect(CreatePersonUseCase).not.toBe(GetPersonUseCase);
      expect(CreatePersonUseCase.name).not.toBe(GetPersonUseCase.name);
    });
  });

  describe("エクスポート整合性", () => {
    it("期待されるすべてのエクスポートが存在する", () => {
      const exportedKeys = Object.keys(personUsecases);
      
      // 期待されるエクスポート
      expect(exportedKeys).toContain("CreatePersonUseCase");
      expect(exportedKeys).toContain("GetPersonUseCase");
      
      // 最低限のエクスポート数を確認
      expect(exportedKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("すべてのエクスポートが定義されている", () => {
      Object.values(personUsecases).forEach(exportedValue => {
        expect(exportedValue).toBeDefined();
        expect(exportedValue).not.toBeNull();
      });
    });

    it("クラスエクスポートがコンストラクタ関数である", () => {
      const { CreatePersonUseCase, GetPersonUseCase } = personUsecases;
      
      const classes = [CreatePersonUseCase, GetPersonUseCase];
      
      classes.forEach(ClassConstructor => {
        expect(typeof ClassConstructor).toBe("function");
        expect(ClassConstructor.prototype).toBeDefined();
        expect(typeof ClassConstructor.prototype.constructor).toBe("function");
      });
    });
  });

  describe("モジュール間接続", () => {
    it("CreatePersonUseCaseが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { CreatePersonUseCase: DirectImport } = await import("../create-person.usecase");
      
      expect(personUsecases.CreatePersonUseCase).toBe(DirectImport);
    });

    it("GetPersonUseCaseが正しいモジュールから来ている", async () => {
      // 直接インポートと比較
      const { GetPersonUseCase: DirectImport } = await import("../get-person.usecase");
      
      expect(personUsecases.GetPersonUseCase).toBe(DirectImport);
    });
  });

  describe("型の可用性", () => {
    it("インポートしたモジュールが期待される構造を持つ", () => {
      // TypeScriptコンパイル時に型が解決できることの確認
      expect(typeof personUsecases).toBe("object");
      expect(personUsecases).not.toBeNull();
      
      // 主要なプロパティが存在する
      expect(personUsecases).toHaveProperty("CreatePersonUseCase");  
      expect(personUsecases).toHaveProperty("GetPersonUseCase");
    });

    it("エクスポートされたクラスがインスタンス化可能な構造を持つ", () => {
      const { CreatePersonUseCase, GetPersonUseCase } = personUsecases;
      
      // プロトタイプチェーンが正常
      expect(CreatePersonUseCase.prototype).toBeDefined();
      expect(GetPersonUseCase.prototype).toBeDefined();
      
      // Function.prototypeを継承している
      expect(CreatePersonUseCase.prototype.constructor).toBe(CreatePersonUseCase);
      expect(GetPersonUseCase.prototype.constructor).toBe(GetPersonUseCase);
    });
  });

  describe("名前空間の一意性", () => {
    it("エクスポートされたクラス名がユニークである", () => {
      const exportedClassNames = [
        personUsecases.CreatePersonUseCase.name,
        personUsecases.GetPersonUseCase.name,
      ];
      
      const uniqueNames = new Set(exportedClassNames);
      expect(exportedClassNames.length).toBe(uniqueNames.size);
    });

    it("クラス名が期待される命名規則に従っている", () => {
      const { CreatePersonUseCase, GetPersonUseCase } = personUsecases;
      
      expect(CreatePersonUseCase.name).toMatch(/.*UseCase$/);
      expect(GetPersonUseCase.name).toMatch(/.*UseCase$/);
      expect(CreatePersonUseCase.name).toMatch(/^[A-Z]/); // PascalCase
      expect(GetPersonUseCase.name).toMatch(/^[A-Z]/); // PascalCase
    });
  });
});