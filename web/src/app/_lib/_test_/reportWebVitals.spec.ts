import {
  reportWebVitals,
  getStoredMetrics,
  getMetricsStatistics,
  clearMetrics,
  WebVitalsMetric,
} from '../reportWebVitals';
import * as logger from '../logger';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Type declaration for global functions
declare global {
  function setMockPathname(pathname: string): void;
  function getMockPathname(): string;
}

describe('reportWebVitals', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      configurable: true
    });
    global.setMockPathname('/test-page');

    // Mock window.gtag
    (window as Window & { gtag?: jest.Mock }).gtag = jest.fn();
  });

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
    delete (window as Window & { gtag?: jest.Mock }).gtag;
  });

  const createMetric = (
    overrides: Partial<WebVitalsMetric> = {}
  ): WebVitalsMetric => ({
    id: 'test-metric-id',
    name: 'LCP',
    value: 2000,
    rating: 'good',
    delta: 100,
    navigationType: 'navigate',
    ...overrides,
  });

  describe('reportWebVitals - 基本機能', () => {
    it('メトリクスを処理する', () => {
      const metric = createMetric();

      reportWebVitals(metric);

      // ローカルストレージに保存される
      const stored = getStoredMetrics();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({
        name: 'LCP',
        value: 2000,
        rating: 'good',
        url: '/test-page', // beforeEachで設定されたパス
      });
    });

    it('valueを整数に丸める', () => {
      const metric = createMetric({ value: 2345.678 });

      reportWebVitals(metric);

      const stored = getStoredMetrics();
      expect(stored[0].value).toBe(2346);
    });

    it('タイムスタンプを記録', () => {
      const metric = createMetric();

      reportWebVitals(metric);

      const stored = getStoredMetrics();
      expect(stored[0].timestamp).toBeDefined();
      expect(new Date(stored[0].timestamp).getTime()).toBeGreaterThan(0);
    });

    it('現在のURLパスを記録', () => {
      // 最初にメトリクスを作成してデフォルトのパスを確認
      const metric1 = createMetric();
      reportWebVitals(metric1);
      
      // パスを変更
      global.setMockPathname('/custom/path');
      const metric2 = createMetric({ id: 'test-metric-2' });
      reportWebVitals(metric2);

      const stored = getStoredMetrics();
      expect(stored).toHaveLength(2);
      expect(stored[0].url).toBe('/test-page'); // 1番目のメトリクスは初期値
      expect(stored[1].url).toBe('/custom/path'); // 2番目のメトリクスはカスタムパス
    });
  });

  describe('reportWebVitals - 開発環境', () => {
    it('開発環境ではデバッグログを出力', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true });
      const metric = createMetric({ name: 'CLS', value: 0.05 });

      reportWebVitals(metric);

      expect(logger.logger.debug).toHaveBeenCalledWith(
        'Web Vitals',
        expect.objectContaining({
          component: 'reportWebVitals',
          action: 'metric',
          meta: {
            name: 'CLS',
            value: 0,
            rating: 'good',
          },
        })
      );
    });

    it('開発環境以外ではデバッグログを出力しない', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true });
      const metric = createMetric();

      reportWebVitals(metric);

      expect(logger.logger.debug).not.toHaveBeenCalled();
    });
  });

  describe('reportWebVitals - 閾値チェック', () => {
    it('LCP > 4000 で poor 警告', () => {
      const metric = createMetric({ name: 'LCP', value: 4500, rating: 'poor' });

      reportWebVitals(metric);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '⚠️ Poor LCP detected',
        expect.objectContaining({
          meta: expect.objectContaining({
            metric: 'LCP',
            value: 4500,
            threshold: 4000,
            rating: 'poor',
          }),
        })
      );
    });

    it('LCP 2501-4000 で needs-improvement 情報', () => {
      const metric = createMetric({
        name: 'LCP',
        value: 3000,
        rating: 'needs-improvement',
      });

      reportWebVitals(metric);

      expect(logger.logger.info).toHaveBeenCalledWith(
        'ℹ️ LCP needs improvement',
        expect.objectContaining({
          meta: expect.objectContaining({
            metric: 'LCP',
            value: 3000,
            threshold: 2500,
            rating: 'needs-improvement',
          }),
        })
      );
    });

    it('CLS > 0.25 で poor 警告', () => {
      const metric = createMetric({ name: 'CLS', value: 0.3, rating: 'poor' });

      reportWebVitals(metric);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '⚠️ Poor CLS detected',
        expect.anything()
      );
    });

    it('FID > 300 で poor 警告', () => {
      const metric = createMetric({ name: 'FID', value: 350, rating: 'poor' });

      reportWebVitals(metric);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '⚠️ Poor FID detected',
        expect.anything()
      );
    });

    it('TTFB > 1800 で poor 警告', () => {
      const metric = createMetric({ name: 'TTFB', value: 2000, rating: 'poor' });

      reportWebVitals(metric);

      expect(logger.logger.warn).toHaveBeenCalledWith(
        '⚠️ Poor TTFB detected',
        expect.anything()
      );
    });

    it('good メトリクスでは警告なし', () => {
      const metric = createMetric({ name: 'LCP', value: 2000, rating: 'good' });

      reportWebVitals(metric);

      expect(logger.logger.warn).not.toHaveBeenCalled();
      expect(logger.logger.info).not.toHaveBeenCalled();
    });

    it('未知のメトリクスでは閾値チェックをスキップ', () => {
      const metric = createMetric({ name: 'UNKNOWN', value: 9999 });

      reportWebVitals(metric);

      expect(logger.logger.warn).not.toHaveBeenCalled();
      expect(logger.logger.info).not.toHaveBeenCalled();
    });
  });

  describe('reportWebVitals - 本番環境の分析送信', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true });
    });

    it('本番環境でGoogle Analyticsに送信', () => {
      const metric = createMetric({ name: 'LCP', value: 2500 });

      reportWebVitals(metric);

      expect(window.gtag).toHaveBeenCalledWith('event', 'LCP', {
        event_category: 'Web Vitals',
        event_label: 'good',
        value: 2500,
        non_interaction: true,
      });
    });

    it('gtagが存在しない場合はエラーなし', () => {
      delete (window as Window & { gtag?: jest.Mock }).gtag;
      const metric = createMetric();

      expect(() => reportWebVitals(metric)).not.toThrow();
    });

    it('カスタムエンドポイントが設定されている場合は送信', async () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT = 'https://analytics.example.com/vitals';
      jest.mocked(global.fetch).mockResolvedValue({
        ok: true,
      } as Response);

      const metric = createMetric({ name: 'CLS', value: 0.05 });
      reportWebVitals(metric);

      await new Promise((resolve) => setTimeout(resolve, 0)); // fetchが実行されるまで待機

      expect(global.fetch).toHaveBeenCalledWith(
        'https://analytics.example.com/vitals',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        })
      );
    });

    it('カスタムエンドポイント送信失敗時はコンソールエラー', async () => {
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT = 'https://analytics.example.com/vitals';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const metric = createMetric();
      reportWebVitals(metric);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send web vitals to analytics:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveMetricToLocalStorage', () => {
    it('メトリクスをローカルストレージに保存', () => {
      const metric = createMetric();
      reportWebVitals(metric);

      const stored = localStorage.getItem('web-vitals-metrics');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
    });

    it('最新50件のみ保持', () => {
      // 51件のメトリクスを送信
      for (let i = 0; i < 51; i++) {
        reportWebVitals(createMetric({ value: i }));
      }

      const stored = getStoredMetrics();
      expect(stored).toHaveLength(50);
      expect(stored[0].value).toBe(1); // 最初の1件が削除される
      expect(stored[49].value).toBe(50);
    });

    it('ローカルストレージエラーは無視', () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const metric = createMetric();
      expect(() => reportWebVitals(metric)).not.toThrow();

      consoleDebugSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('getStoredMetrics', () => {
    it('保存されたメトリクスを取得', () => {
      reportWebVitals(createMetric({ name: 'LCP', value: 2000 }));
      reportWebVitals(createMetric({ name: 'FID', value: 50 }));

      const stored = getStoredMetrics();
      expect(stored).toHaveLength(2);
      expect(stored[0].name).toBe('LCP');
      expect(stored[1].name).toBe('FID');
    });

    it('メトリクスがない場合は空配列', () => {
      const stored = getStoredMetrics();
      expect(stored).toEqual([]);
    });

    it('不正なJSONの場合は空配列', () => {
      localStorage.setItem('web-vitals-metrics', 'invalid json');

      const stored = getStoredMetrics();
      expect(stored).toEqual([]);
    });
  });

  describe('getMetricsStatistics', () => {
    it('メトリクスの統計を計算', () => {
      reportWebVitals(createMetric({ name: 'LCP', value: 2000 }));
      reportWebVitals(createMetric({ name: 'LCP', value: 3000 }));
      reportWebVitals(createMetric({ name: 'FID', value: 100 }));

      const stats = getMetricsStatistics();

      expect(stats.LCP).toEqual({
        average: 2500,
        count: 2,
        poor: 0,
      });

      expect(stats.FID).toEqual({
        average: 100,
        count: 1,
        poor: 0,
      });
    });

    it('poor メトリクスをカウント', () => {
      reportWebVitals(createMetric({ name: 'LCP', value: 2000, rating: 'good' }));
      reportWebVitals(createMetric({ name: 'LCP', value: 5000, rating: 'poor' }));
      reportWebVitals(createMetric({ name: 'LCP', value: 6000, rating: 'poor' }));

      const stats = getMetricsStatistics();

      expect(stats.LCP.poor).toBe(2);
    });

    it('メトリクスがない場合は空オブジェクト', () => {
      const stats = getMetricsStatistics();
      expect(stats).toEqual({});
    });

    it('平均値を整数に丸める', () => {
      reportWebVitals(createMetric({ name: 'LCP', value: 2333 }));
      reportWebVitals(createMetric({ name: 'LCP', value: 2666 }));

      const stats = getMetricsStatistics();
      expect(stats.LCP.average).toBe(2500); // (2333 + 2666) / 2 = 2499.5 → 2500
    });
  });

  describe('clearMetrics', () => {
    it('メトリクスをクリア', () => {
      reportWebVitals(createMetric());
      reportWebVitals(createMetric());

      expect(getStoredMetrics()).toHaveLength(2);

      clearMetrics();

      expect(getStoredMetrics()).toEqual([]);
    });

    it('メトリクスがない場合もエラーなし', () => {
      expect(() => clearMetrics()).not.toThrow();
    });
  });
});
