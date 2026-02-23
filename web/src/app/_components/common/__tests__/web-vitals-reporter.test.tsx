/**
 * WebVitalsReporterコンポーネントのテスト
 */

import { render } from '@testing-library/react';
import { WebVitalsReporter } from '../web-vitals-reporter';
import { useReportWebVitals } from 'next/web-vitals';

// next/web-vitalsをモック
jest.mock('next/web-vitals', () => ({
  useReportWebVitals: jest.fn(),
}));

describe('WebVitalsReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('何もレンダリングしない（nullを返す）', () => {
      const { container } = render(<WebVitalsReporter />);
      expect(container.firstChild).toBeNull();
    });

    it('useReportWebVitalsが呼ばれる', () => {
      render(<WebVitalsReporter />);
      expect(useReportWebVitals).toHaveBeenCalled();
    });
  });
});
