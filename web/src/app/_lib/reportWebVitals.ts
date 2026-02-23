/**
 * Web Vitals計測
 * Core Web Vitals（LCP, FID, CLS, TTFB）を記録
 */

import { logger } from './logger';

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

interface PerformanceMetricData {
  name: string;
  value: number;
  rating: string;
  timestamp: string;
  url: string;
}

// Google Analytics型定義
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
  }
}

/**
 * Web Vitalsメトリクスを処理
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  // コンソールにログ出力（開発環境）
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Web Vitals', {
      component: 'reportWebVitals',
      action: 'metric',
      meta: {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      },
    });
  }

  // メトリクスデータを整形
  const metricData: PerformanceMetricData = {
    name: metric.name,
    value: metric.name === 'CLS' ? Math.round(metric.value * 1000) / 1000 : Math.round(metric.value), // CLSは小数点以下を保持
    rating: metric.rating,
    timestamp: new Date().toISOString(),
    url: process.env.NODE_ENV === 'test' 
      ? (global as { getMockPathname?: () => string }).getMockPathname?.() || '/'
      : typeof window !== 'undefined' && window.location 
        ? window.location.pathname 
        : '/',
  };

  // 閾値チェック
  checkThreshold(metricData);

  // 本番環境では分析サービスに送信
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metricData);
  }

  // ローカルストレージに保存（デバッグ用）
  saveMetricToLocalStorage(metricData);
}

/**
 * メトリクス閾値をチェックして警告
 */
function checkThreshold(metric: PerformanceMetricData): void {
  const thresholds = {
    // Core Web Vitals の推奨閾値
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric.name as keyof typeof thresholds];
  if (!threshold) return;

  if (metric.value > threshold.poor) {
    logger.warn(`⚠️ Poor ${metric.name} detected`, {
      component: 'reportWebVitals',
      action: 'threshold',
      meta: {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.poor,
        rating: 'poor',
      },
    });
  } else if (metric.value > threshold.good) {
    logger.info(`ℹ️ ${metric.name} needs improvement`, {
      component: 'reportWebVitals',
      action: 'threshold',
      meta: {
        metric: metric.name,
        value: metric.value,
        threshold: threshold.good,
        rating: 'needs-improvement',
      },
    });
  }
}

/**
 * 分析サービスにメトリクスを送信
 */
function sendToAnalytics(metric: PerformanceMetricData): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: metric.value,
      non_interaction: true,
    });
  }

  // カスタムバックエンドエンドポイントに送信（オプション）
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'web-vitals',
        ...metric,
      }),
      keepalive: true, // ページ離脱後も送信を継続
    }).catch((error) => {
      console.error('Failed to send web vitals to analytics:', error);
    });
  }
}

/**
 * メトリクスをローカルストレージに保存（デバッグ用）
 */
function saveMetricToLocalStorage(metric: PerformanceMetricData): void {
  if (typeof window === 'undefined') return;

  try {
    const key = 'web-vitals-metrics';
    const stored = localStorage.getItem(key);
    const metrics: PerformanceMetricData[] = stored ? JSON.parse(stored) : [];

    // 最新50件のみ保持
    metrics.push(metric);
    const trimmed = metrics.slice(-50);

    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    // ローカルストレージが利用できない場合は無視
    console.debug('Failed to save metric to localStorage:', error);
  }
}

/**
 * 保存されたメトリクスを取得（デバッグ用）
 */
export function getStoredMetrics(): PerformanceMetricData[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('web-vitals-metrics');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * メトリクスの統計を取得
 */
export function getMetricsStatistics(): Record<
  string,
  { average: number; count: number; poor: number }
> {
  const metrics = getStoredMetrics();
  const stats: Record<
    string,
    { total: number; count: number; poor: number }
  > = {};

  metrics.forEach((metric) => {
    if (!stats[metric.name]) {
      stats[metric.name] = { total: 0, count: 0, poor: 0 };
    }
    stats[metric.name].total += metric.value;
    stats[metric.name].count += 1;
    if (metric.rating === 'poor') {
      stats[metric.name].poor += 1;
    }
  });

  return Object.entries(stats).reduce(
    (acc, [name, data]) => ({
      ...acc,
      [name]: {
        average: Math.round(data.total / data.count),
        count: data.count,
        poor: data.poor,
      },
    }),
    {},
  );
}

/**
 * メトリクスをクリア（テスト用）
 */
export function clearMetrics(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('web-vitals-metrics');
  }
}
