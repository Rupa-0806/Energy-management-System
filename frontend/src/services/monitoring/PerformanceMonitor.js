class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Monitor navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Navigation Timing:', {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          domInteractive: entry.domInteractive - entry.fetchStart,
          timeToFirstByte: entry.responseStart - entry.fetchStart,
        });
      }
    });

    try {
      navObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.warn('Failed to observe navigation timing:', e);
    }

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn('Long Task detected:', entry.duration, 'ms', entry);
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Longtask API may not be available
    }

    // Monitor resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          console.warn('Slow resource:', entry.name, entry.duration, 'ms');
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Failed to observe resource timing:', e);
    }
  }

  mark(name) {
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      this.metrics[name] = measure.duration;
      console.log(`Measure ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (e) {
      console.error(`Failed to measure ${name}:`, e);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  /**
   * Report Core Web Vitals
   */
  reportWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP (Largest Contentful Paint):', lastEntry.renderTime || lastEntry.loadTime, 'ms');
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay / Interaction to Next Paint
      const interactionObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const delay = entry.processingEnd - entry.processingStart;
          console.log('INP (Interaction to Next Paint):', delay, 'ms');
        }
      });

      try {
        interactionObserver.observe({ entryTypes: ['first-input', 'event'] });
      } catch (e) {
        // INP not supported
      }
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = clsValue + entry.value;
          clsValue = firstSessionEntry;
        }
      }
      console.log('CLS (Cumulative Layout Shift):', clsValue.toFixed(3));
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift not supported
    }
  }

  /**
   * Get memory usage (Chrome only)
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      };
    }
    return null;
  }
}

export default new PerformanceMonitor();
