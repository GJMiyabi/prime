/**
 * ラベル定数ファイルのテスト
 * アプリケーション全体で使用される文字列定数の検証
 */

import * as labels from "../labels";

describe("constants/labels", () => {
  describe("共通フィールドラベル", () => {
    it("LABEL_NAMEが正しい値を持つ", () => {
      expect(labels.LABEL_NAME).toBe("名称");
      expect(typeof labels.LABEL_NAME).toBe("string");
    });

    it("LABEL_NAME_ENが正しい値を持つ", () => {
      expect(labels.LABEL_NAME_EN).toBe("Name");
      expect(typeof labels.LABEL_NAME_EN).toBe("string");
    });

    it("LABEL_VALUEが正しい値を持つ", () => {
      expect(labels.LABEL_VALUE).toBe("Value");
      expect(typeof labels.LABEL_VALUE).toBe("string");
    });
  });

  describe("セクションタイトル", () => {
    it("組織関連のラベルが正しい値を持つ", () => {
      expect(labels.LABEL_ORGANIZATION).toBe("組織");
      expect(labels.LABEL_PARENT_ORGANIZATION).toBe("所属元組織");
      expect(typeof labels.LABEL_ORGANIZATION).toBe("string");
      expect(typeof labels.LABEL_PARENT_ORGANIZATION).toBe("string");
    });

    it("プロフィール関連のラベルが正しい値を持つ", () => {
      expect(labels.LABEL_PROFILE).toBe("プロフィール");
      expect(labels.LABEL_CONTACT).toBe("連絡先");
      expect(typeof labels.LABEL_PROFILE).toBe("string");
      expect(typeof labels.LABEL_CONTACT).toBe("string");
    });

    it("アカウント関連のラベルが正しい値を持つ", () => {
      expect(labels.LABEL_ACCOUNT_SETTINGS).toBe("アカウント設定");
      expect(typeof labels.LABEL_ACCOUNT_SETTINGS).toBe("string");
    });

    it("施設関連のラベルが正しい値を持つ", () => {
      expect(labels.LABEL_FACILITY).toBe("設定施設");
      expect(labels.LABEL_AFFILIATED_FACILITIES).toBe("所属先施設");
      expect(typeof labels.LABEL_FACILITY).toBe("string");
      expect(typeof labels.LABEL_AFFILIATED_FACILITIES).toBe("string");
    });
  });

  describe("メッセージ", () => {
    it("エラーメッセージが正しい値を持つ", () => {
      expect(labels.MESSAGE_NO_ACCOUNT).toBe("アカウントの設定はありません");
      expect(labels.MESSAGE_NO_FACILITY).toBe("所属施設の設定ありません");
      expect(labels.MESSAGE_NO_ORGANIZATION).toBe("所属組織の設定ありません");
      
      expect(typeof labels.MESSAGE_NO_ACCOUNT).toBe("string");
      expect(typeof labels.MESSAGE_NO_FACILITY).toBe("string");
      expect(typeof labels.MESSAGE_NO_ORGANIZATION).toBe("string");
    });
  });

  describe("アクション", () => {
    it("アクションラベルが正しい値を持つ", () => {
      expect(labels.ACTION_SUBMIT).toBe("Submit");
      expect(labels.ACTION_SAVING).toBe("Saving...");
      
      expect(typeof labels.ACTION_SUBMIT).toBe("string");
      expect(typeof labels.ACTION_SAVING).toBe("string");
    });
  });

  describe("エクスポート確認", () => {
    it("全ての定数が定義されている", () => {
      const expectedExports = [
        "LABEL_NAME",
        "LABEL_NAME_EN", 
        "LABEL_VALUE",
        "LABEL_ORGANIZATION",
        "LABEL_PROFILE",
        "LABEL_CONTACT",
        "LABEL_ACCOUNT_SETTINGS",
        "LABEL_FACILITY",
        "LABEL_AFFILIATED_FACILITIES",
        "LABEL_PARENT_ORGANIZATION",
        "MESSAGE_NO_ACCOUNT",
        "MESSAGE_NO_FACILITY",
        "MESSAGE_NO_ORGANIZATION",
        "ACTION_SUBMIT",
        "ACTION_SAVING"
      ];

      expectedExports.forEach(exportName => {
        expect(labels).toHaveProperty(exportName);
        expect(labels[exportName as keyof typeof labels]).toBeDefined();
      });
    });

    it("エクスポートされた値がすべて文字列である", () => {
      Object.values(labels).forEach(value => {
        expect(typeof value).toBe("string");
      });
    });

    it("空の文字列が存在しない", () => {
      Object.values(labels).forEach(value => {
        expect(value).not.toBe("");
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe("国際化対応", () => {
    it("日本語ラベルが適切に定義されている", () => {
      const japaneseLabels = [
        labels.LABEL_NAME,
        labels.LABEL_ORGANIZATION,
        labels.LABEL_PROFILE,
        labels.LABEL_CONTACT,
        labels.LABEL_ACCOUNT_SETTINGS,
        labels.LABEL_FACILITY,
        labels.LABEL_AFFILIATED_FACILITIES,
        labels.LABEL_PARENT_ORGANIZATION
      ];

      japaneseLabels.forEach(label => {
        expect(label).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // ひらがな、カタカナ、漢字を含む
      });
    });

    it("英語ラベルが適切に定義されている", () => {
      const englishLabels = [
        labels.LABEL_NAME_EN,
        labels.LABEL_VALUE,
        labels.ACTION_SUBMIT,
        labels.ACTION_SAVING
      ];

      englishLabels.forEach(label => {
        expect(label).toMatch(/^[A-Za-z0-9\s\.\-_]+$/); // 英数字、スペース、ピリオド、ハイフン、アンダースコアのみ
      });
    });
  });

  describe("一意性確認", () => {
    it("すべてのラベル値が一意である", () => {
      const values = Object.values(labels);
      const uniqueValues = new Set(values);
      
      expect(values.length).toBe(uniqueValues.size);
    });
  });
});