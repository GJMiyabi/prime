import { renderHook, act } from '@testing-library/react';
import { useCollapsible } from '../useCollapsible';

describe('useCollapsible', () => {
  describe('初期状態', () => {
    it('デフォルトでisOpenがtrueである', () => {
      const { result } = renderHook(() => useCollapsible());
      expect(result.current.isOpen).toBe(true);
    });

    it('initialOpenがfalseの場合、isOpenがfalseである', () => {
      const { result } = renderHook(() => useCollapsible(false));
      expect(result.current.isOpen).toBe(false);
    });

    it('initialOpenがtrueの場合、isOpenがtrueである', () => {
      const { result } = renderHook(() => useCollapsible(true));
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('toggle', () => {
    it('isOpenをtrueからfalseに切り替える', () => {
      const { result } = renderHook(() => useCollapsible(true));

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('isOpenをfalseからtrueに切り替える', () => {
      const { result } = renderHook(() => useCollapsible(false));

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('複数回toggleを呼び出すと状態が切り替わる', () => {
      const { result } = renderHook(() => useCollapsible(true));

      act(() => {
        result.current.toggle(); // false
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle(); // true
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle(); // false
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('open', () => {
    it('閉じている状態から開く', () => {
      const { result } = renderHook(() => useCollapsible(false));

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('既に開いている場合も開いたままにする', () => {
      const { result } = renderHook(() => useCollapsible(true));

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('複数回呼び出しても開いたままである', () => {
      const { result } = renderHook(() => useCollapsible(false));

      act(() => {
        result.current.open();
        result.current.open();
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('開いている状態から閉じる', () => {
      const { result } = renderHook(() => useCollapsible(true));

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('既に閉じている場合も閉じたままにする', () => {
      const { result } = renderHook(() => useCollapsible(false));

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('複数回呼び出しても閉じたままである', () => {
      const { result } = renderHook(() => useCollapsible(true));

      act(() => {
        result.current.close();
        result.current.close();
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('関数のメモ化', () => {
    it('toggle関数の参照が再レンダリングで変わらない', () => {
      const { result, rerender } = renderHook(() => useCollapsible());
      const firstToggle = result.current.toggle;

      rerender();

      expect(result.current.toggle).toBe(firstToggle);
    });

    it('open関数の参照が再レンダリングで変わらない', () => {
      const { result, rerender } = renderHook(() => useCollapsible());
      const firstOpen = result.current.open;

      rerender();

      expect(result.current.open).toBe(firstOpen);
    });

    it('close関数の参照が再レンダリングで変わらない', () => {
      const { result, rerender } = renderHook(() => useCollapsible());
      const firstClose = result.current.close;

      rerender();

      expect(result.current.close).toBe(firstClose);
    });
  });

  describe('複合操作', () => {
    it('open → toggle → close の順で正しく動作する', () => {
      const { result } = renderHook(() => useCollapsible(false));

      // open
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      // toggle (true → false)
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);

      // close (既に閉じているがfalseのまま)
      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('close → toggle → open の順で正しく動作する', () => {
      const { result } = renderHook(() => useCollapsible(true));

      // close
      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      // toggle (false → true)
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      // open (既に開いているがtrueのまま)
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
    });
  });
});
