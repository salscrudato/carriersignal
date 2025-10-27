/**
 * Performance monitoring utilities for CarrierSignal
 */

// Log Core Web Vitals
export function logWebVitals() {
  if (typeof window === 'undefined') return;

  // First Contentful Paint (FCP)
  const paintEntries = performance.getEntriesByType('paint');
  const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcp) {
    console.log(`[PERF] First Contentful Paint: ${Math.round(fcp.startTime)}ms`);
  }

  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log(`[PERF] Largest Contentful Paint: ${Math.round(lastEntry.startTime)}ms`);
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      console.log(`[PERF] First Input Delay: ${Math.round(entry.processingStart - entry.startTime)}ms`);
    });
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    console.log(`[PERF] Cumulative Layout Shift: ${clsValue.toFixed(3)}`);
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }

  // Time to Interactive (TTI) approximation
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const tti = navTiming.domInteractive - navTiming.fetchStart;
        console.log(`[PERF] Time to Interactive (approx): ${Math.round(tti)}ms`);
        console.log(`[PERF] DOM Content Loaded: ${Math.round(navTiming.domContentLoadedEventEnd - navTiming.fetchStart)}ms`);
        console.log(`[PERF] Page Load Complete: ${Math.round(navTiming.loadEventEnd - navTiming.fetchStart)}ms`);
      }
    }, 0);
  });
}

// Measure component render time
export function measureRender(componentName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`[PERF] ${componentName} render: ${(end - start).toFixed(2)}ms`);
}

// Log memory usage (Chrome only)
export function logMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log(`[PERF] Memory Usage:`, {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

// Monitor long tasks (> 50ms)
export function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`[PERF] Long Task detected: ${Math.round(entry.duration)}ms`);
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long tasks not supported
    }
  }
}

// Initialize all performance monitoring
export function initPerformanceMonitoring() {
  if (import.meta.env.DEV) {
    console.log('[PERF] Performance monitoring enabled');
    logWebVitals();
    monitorLongTasks();

    // Log memory every 30 seconds in dev
    setInterval(logMemoryUsage, 30000);
  }
}

