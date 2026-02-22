import { renderHook } from '@testing-library/react';
import { usePersonUseCases } from '../factories/usePersonUseCases';

// Mock repositories and use cases
jest.mock('../../_repositories/person.repository', () => ({
  GraphQLPersonRepository: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    create: jest.fn(),
  })),
}));

jest.mock('../../_usecases/person/get-person.usecase', () => ({
  GetPersonUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('../../_usecases/person/create-person.usecase', () => ({
  CreatePersonUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

describe('usePersonUseCases', () => {
  describe('初期化', () => {
    it('getとcreateのUseCaseを返す', () => {
      const { result } = renderHook(() => usePersonUseCases());

      expect(result.current.get).toBeDefined();
      expect(result.current.create).toBeDefined();
      expect(result.current.get.execute).toBeDefined();
      expect(result.current.create.execute).toBeDefined();
    });
  });

  describe('メモ化', () => {
    it('再レンダリング時も同じインスタンスを返す', () => {
      const { result, rerender } = renderHook(() => usePersonUseCases());

      const firstGet = result.current.get;
      const firstCreate = result.current.create;

      // 再レンダリング
      rerender();

      expect(result.current.get).toBe(firstGet);
      expect(result.current.create).toBe(firstCreate);
    });

    it('複数回再レンダリングしても同じインスタンスを返す', () => {
      const { result, rerender } = renderHook(() => usePersonUseCases());

      const firstGet = result.current.get;
      const firstCreate = result.current.create;

      // 複数回再レンダリング
      rerender();
      rerender();
      rerender();

      expect(result.current.get).toBe(firstGet);
      expect(result.current.create).toBe(firstCreate);
    });
  });

  describe('複数のフックインスタンス', () => {
    it('別々のコンポーネントで使用した場合、異なるインスタンスを持つ', () => {
      const { result: result1 } = renderHook(() => usePersonUseCases());
      const { result: result2 } = renderHook(() => usePersonUseCases());

      // 異なるフックインスタンスなので、異なるUseCaseインスタンスを持つ
      expect(result1.current.get).not.toBe(result2.current.get);
      expect(result1.current.create).not.toBe(result2.current.create);
    });
  });
});
