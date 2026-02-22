/**
 * Vitest Setup File
 * テスト実行前に実行される共通設定
 */

import { vi } from "vitest";

// グローバルモック設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Material Tailwind React のモック（ESM/CJS問題回避）
// 単純なダミーコンポーネントとして定義
vi.mock('@material-tailwind/react', () => {
  const createMockComponent = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = vi.fn((props: any) => props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Component as any).displayName = name;
    return Component;
  };

  return {
    Button: createMockComponent('Button'),
    Input: createMockComponent('Input'),
    Card: createMockComponent('Card'),
    CardHeader: createMockComponent('CardHeader'),
    CardBody: createMockComponent('CardBody'),
    CardFooter: createMockComponent('CardFooter'),
    Typography: createMockComponent('Typography'),
    Alert: createMockComponent('Alert'),
    Spinner: createMockComponent('Spinner'),
    Dialog: createMockComponent('Dialog'),
    DialogHeader: createMockComponent('DialogHeader'),
    DialogBody: createMockComponent('DialogBody'),
    DialogFooter: createMockComponent('DialogFooter'),
  };
});

// Next.js Router のモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
