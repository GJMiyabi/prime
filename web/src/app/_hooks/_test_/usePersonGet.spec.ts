import { renderHook, waitFor } from '@testing-library/react';
import { usePersonGet } from '../person/usePersonGet';
import * as usePersonUseCasesModule from '../factories/usePersonUseCases';

// Mock usePersonUseCases
const mockExecute = jest.fn();

jest.mock('../factories/usePersonUseCases', () => ({
  usePersonUseCases: jest.fn(),
}));

describe('usePersonGet', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(usePersonUseCasesModule.usePersonUseCases).mockReturnValue({
      get: {
        execute: mockExecute,
      },
      create: {
        execute: jest.fn(),
      },
    });
  });

  describe('初期状態', () => {
    it('dataがnull、isLoadingがfalse、errorがnullである', () => {
      mockExecute.mockResolvedValue({
        success: true,
        person: null,
      });

      const { result } = renderHook(() => usePersonGet(''));

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('refetch関数が提供される', () => {
      mockExecute.mockResolvedValue({
        success: true,
        person: null,
      });

      const { result } = renderHook(() => usePersonGet(''));

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Person取得 - 成功時', () => {
    it('IDが指定されている場合、getPersonUseCaseを実行する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith(
          'person-1',
          undefined,
          undefined
        );
      });
    });

    it('取得したデータをdataに設定する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockPerson);
      });
    });

    it('isLoadingがtrue→falseに変化する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve({ success: true, person: mockPerson }),
              100
            );
          })
      );

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('includeオプション付きでリクエストする', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const includeOptions = {
        contacts: true,
      };

      renderHook(() => usePersonGet('person-1', includeOptions));

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith(
          'person-1',
          includeOptions,
          undefined
        );
      });
    });

    it('queryOptionsを渡す', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const queryOptions = {
        fetchPolicy: 'cache-first' as const,
      };

      renderHook(() => usePersonGet('person-1', undefined, queryOptions));

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith(
          'person-1',
          undefined,
          queryOptions
        );
      });
    });
  });

  describe('Person取得 - エラー時', () => {
    it('エラーが発生した場合、errorを設定する', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: 'Person not found',
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.error).toBe('Person not found');
      });
    });

    it('エラー時、dataはnullである', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: 'Person not found',
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });
    });

    it('エラー時もisLoadingがfalseになる', async () => {
      mockExecute.mockResolvedValue({
        success: false,
        error: 'Person not found',
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('IDの変更', () => {
    it('IDが変更されると再度取得する', async () => {
      const mockPerson1 = {
        id: 'person-1',
        name: 'Person 1',
      };

      const mockPerson2 = {
        id: 'person-2',
        name: 'Person 2',
      };

      mockExecute
        .mockResolvedValueOnce({
          success: true,
          person: mockPerson1,
        })
        .mockResolvedValueOnce({
          success: true,
          person: mockPerson2,
        });

      const { result, rerender } = renderHook(
        ({ id }) => usePersonGet(id),
        {
          initialProps: { id: 'person-1' },
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockPerson1);
      });

      // IDを変更
      rerender({ id: 'person-2' });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockPerson2);
      });

      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    it('IDが空文字列の場合は取得しない', async () => {
      renderHook(() => usePersonGet(''));

      await waitFor(() => {
        expect(mockExecute).not.toHaveBeenCalled();
      });
    });
  });

  describe('refetch', () => {
    it('refetchを呼び出すと再度データを取得する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledTimes(1);
      });

      // refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledTimes(2);
      });
    });

    it('refetch時はnetwork-onlyポリシーで取得する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledTimes(1);
      });

      // refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith('person-1', undefined, {
          fetchPolicy: 'network-only',
        });
      });
    });

    it('IDが空の場合、refetchは何もしない', async () => {
      const { result } = renderHook(() => usePersonGet(''));

      await result.current.refetch();

      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('refetch中もisLoadingがtrueになる', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve({ success: true, person: mockPerson }),
              100
            );
          })
      );

      const { result } = renderHook(() => usePersonGet('person-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // refetch開始
      const refetchPromise = result.current.refetch();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await refetchPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('includeオプションの変更', () => {
    it('includeオプションが変更されると再度取得する', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
      };

      mockExecute.mockResolvedValue({
        success: true,
        person: mockPerson,
      });

      const { rerender } = renderHook(
        ({ include }) => usePersonGet('person-1', include),
        {
          initialProps: { include: undefined },
        }
      );

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledTimes(1);
      });

      // includeオプションを変更
      rerender({ include: { contacts: true } });

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledTimes(2);
      });
    });
  });
});
