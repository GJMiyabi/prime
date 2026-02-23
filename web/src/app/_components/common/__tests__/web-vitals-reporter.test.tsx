/**
 * WebVitalsReporterコンポーネントのテスト
 */

import { render } from '@testing-library/react';
import { WebVitalsReporter } from '../web-vitals-reporter';

// next/web-vitalsをモック
jest.mock('next/web-vitals', () => ({
  useReportWebVitals: jest.fn(),
}));

const { useReportWebVitals } = require('next/web-vitals');

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
