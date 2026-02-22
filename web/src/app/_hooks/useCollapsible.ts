"use client";

// フレームワーク層：折りたたみ可能なコンポーネントの状態管理フック

import { useState, useCallback } from "react";

/**
 * 折りたたみ可能なコンポーネントの開閉状態を管理するカスタムフック
 */
export function useCollapsible(initialOpen = true) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  /**
   * 開閉状態をトグル
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * 開く
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * 閉じる
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}
