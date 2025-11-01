/**
 * Performance Monitoring
 * Tracks Core Web Vitals and custom metrics
 */

import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
}

// Performance budgets (in milliseconds)
export const PERFORMANCE_BUDGETS = {
  lcp: 2500, // Largest Contentful Paint
  fid: 100, // First Input Delay
  cls: 0.1, // Cumulative Layout Shift
  ttfb: 600, // Time to First Byte
  fcp: 1800, // First Contentful Paint
  bundleSize: 250000, // 250KB
};

// Track Core Web Vitals
export function trackCoreWebVitals() {
  const vitals: CoreWebVitals = {};

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.warn('performance', 'LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any;
          if (!vitals.fid || fidEntry.processingDuration < vitals.fid) {
            vitals.fid = fidEntry.processingDuration;
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      logger.warn('performance', 'FID observer not supported');
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        let cls = 0;
        entries.forEach(entry => {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            cls += clsEntry.value;
          }
        });
        vitals.cls = cls;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      logger.warn('performance', 'CLS observer not supported');
    }
  }

  // Time to First Byte
  if ('performance' in window) {
    const perfData = window.performance.timing;
    vitals.ttfb = perfData.responseStart - perfData.fetchStart;
    vitals.fcp = perfData.domContentLoadedEventEnd - perfData.fetchStart;
  }

  return vitals;
}

// Report metrics to Firestore
export async function reportMetrics(vitals: CoreWebVitals) {
  try {
    const metric: PerformanceMetric = {
      name: 'core-web-vitals',
      value: Object.values(vitals).reduce((a, b) => (a || 0) + (b || 0), 0) as number,
      unit: 'ms',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    await addDoc(collection(db, 'performanceMetrics'), {
      ...metric,
      vitals,
      budgetStatus: {
        lcp: vitals.lcp ? vitals.lcp <= PERFORMANCE_BUDGETS.lcp : null,
        fid: vitals.fid ? vitals.fid <= PERFORMANCE_BUDGETS.fid : null,
        cls: vitals.cls ? vitals.cls <= PERFORMANCE_BUDGETS.cls : null,
        ttfb: vitals.ttfb ? vitals.ttfb <= PERFORMANCE_BUDGETS.ttfb : null,
        fcp: vitals.fcp ? vitals.fcp <= PERFORMANCE_BUDGETS.fcp : null,
      },
    });

    logger.info('performance', 'Metrics reported', vitals);
  } catch (error) {
    logger.error('performance', 'Failed to report metrics', error);
  }
}

// Measure function execution time
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logger.info('performance', `${name}: ${duration.toFixed(2)}ms`);
    }) as Promise<T>;
  }

  const duration = performance.now() - start;
  logger.info('performance', `${name}: ${duration.toFixed(2)}ms`);
  return result;
}

// Check bundle size
export function checkBundleSize() {
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const resources = window.performance.getEntriesByType('resource');
    const bundleSize = resources.reduce((total, resource) => {
      const res = resource as any;
      return total + (res.transferSize || 0);
    }, 0);

    const status = bundleSize <= PERFORMANCE_BUDGETS.bundleSize ? 'pass' : 'fail';
    logger.info('performance', `Bundle size: ${(bundleSize / 1024).toFixed(2)}KB (${status})`);

    return {
      size: bundleSize,
      budget: PERFORMANCE_BUDGETS.bundleSize,
      status,
    };
  }

  return null;
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Track Core Web Vitals
  const vitals = trackCoreWebVitals();

  // Report metrics after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => reportMetrics(vitals), 3000);
    });
  } else {
    setTimeout(() => reportMetrics(vitals), 3000);
  }

  // Check bundle size
  window.addEventListener('load', () => {
    setTimeout(checkBundleSize, 1000);
  });
}

