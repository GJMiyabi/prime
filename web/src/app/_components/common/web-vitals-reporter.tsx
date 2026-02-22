/**
 * Web Vitals Reporter Component
 * Core Web Vitalsを自動計測してレポート
 */

'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '../../_lib/reportWebVitals';

export function WebVitalsReporter(): null {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });

  // クライアントサイドのみで実行される初期化処理
  useEffect(() => {
    // Performance Observer APIで追加のメトリクスを収集
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Navigation Timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          console.debug('[Performance] Navigation Timing:', {
            dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
            tcp: navTiming.connectEnd - navTiming.connectStart,
            ttfb: navTiming.responseStart - navTiming.requestStart,
            download: navTiming.responseEnd - navTiming.responseStart,
            domInteractive: navTiming.domInteractive - navTiming.fetchStart,
            domComplete: navTiming.domComplete - navTiming.fetchStart,
          });
        }

        // Resource Timing (遅いリソースを検出)
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const slowResources = resources.filter((r) => r.duration > 1000);
        if (slowResources.length > 0) {
          console.warn('[Performance] Slow resources detected:', 
            slowResources.map((r) => ({
              name: r.name,
              duration: Math.round(r.duration),
              type: r.initiatorType,
            }))
          );
        }
      } catch (error) {
        console.debug('[Performance] Failed to collect timing metrics:', error);
      }
    }
  }, []);

  return null;
}
