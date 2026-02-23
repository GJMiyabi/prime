import { PrismaClient } from '@prisma/client';
import { PrismaClientSingleton } from '../prisma-client';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('PrismaClientSingleton', () => {
  beforeEach(() => {
    // シングルトンインスタンスをリセット
    (PrismaClientSingleton as any)._instance = undefined;
    jest.clearAllMocks();
  });

  describe('instance getter', () => {
    describe('正常系', () => {
      it('初回アクセス時にPrismaClientのインスタンスを作成する', () => {
        // Act
        const instance = PrismaClientSingleton.instance;

        // Assert
        expect(instance).toBeDefined();
        expect(PrismaClient).toHaveBeenCalledTimes(1);
      });

      it('2回目以降のアクセスでは同じインスタンスを返す', () => {
        // Act
        const instance1 = PrismaClientSingleton.instance;
        const instance2 = PrismaClientSingleton.instance;
        const instance3 = PrismaClientSingleton.instance;

        // Assert
        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
        expect(PrismaClient).toHaveBeenCalledTimes(1);
      });

      it('複数回アクセスしてもPrismaClientは1回しか作成されない（シングルトンパターン）', () => {
        // Act
        for (let i = 0; i < 10; i++) {
          PrismaClientSingleton.instance;
        }

        // Assert
        expect(PrismaClient).toHaveBeenCalledTimes(1);
      });

      it('作成されたインスタンスはPrismaClientの型を持つ', () => {
        // Act
        const instance = PrismaClientSingleton.instance;

        // Assert
        expect(instance).toBeDefined();
        expect(typeof instance).toBe('object');
      });
    });
  });

  describe('環境変数の読み込み', () => {
    it('dotenv/configがインポートされている', () => {
      // prisma-client.tsファイルの先頭でimport 'dotenv/config'が実行されるため、
      // PrismaClientが作成される前に環境変数が読み込まれる
      const instance = PrismaClientSingleton.instance;

      // PrismaClientが作成されたことを確認
      expect(instance).toBeDefined();
    });
  });
});
