/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and performance metrics
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial load
 * - TTFB (Time to First Byte) - Server response time
 */

import { getAnalytics } from './analytics';

/**
 * Web Vitals thresholds (in ms, except CLS)
 */
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Get rating for metric value
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @returns {string} Rating (good, needs-improvement, poor)
 */
function getRating(metric, value) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Web Vital metric
 * @param {Object} metric - Metric object
 */
function trackWebVital(metric) {
  const analytics = getAnalytics();
  const rating = getRating(metric.name, metric.value);

  analytics.trackPerformance(metric.name, metric.value, {
    id: metric.id,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  console.log(`[WebVitals] ${metric.name}:`, {
    value: metric.value,
    rating,
    id: metric.id,
  });
}

/**
 * Measure Largest Contentful Paint (LCP)
 * Tracks when the largest content element becomes visible
 */
export function measureLCP() {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      trackWebVital({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: `lcp-${Date.now()}`,
        delta: lastEntry.renderTime || lastEntry.loadTime,
        navigationType: performance.navigation?.type || 0,
      });
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    console.error('[WebVitals] LCP measurement failed:', error);
  }
}

/**
 * Measure First Input Delay (FID)
 * Tracks delay between user interaction and browser response
 */
export function measureFID() {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        trackWebVital({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          id: `fid-${Date.now()}`,
          delta: entry.processingStart - entry.startTime,
          navigationType: performance.navigation?.type || 0,
        });
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    console.error('[WebVitals] FID measurement failed:', error);
  }
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * Tracks unexpected layout shifts
 */
export function measureCLS() {
  if (!window.PerformanceObserver) return;

  try {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // If the entry occurred less than 1 second after the previous entry and
          // less than 5 seconds after the first entry in the session, include the
          // entry in the current session. Otherwise, start a new session.
          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          // If the current session value is larger than the current CLS value,
          // update CLS and the entries contributing to it.
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
          }
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && clsValue > 0) {
        trackWebVital({
          name: 'CLS',
          value: clsValue,
          id: `cls-${Date.now()}`,
          delta: clsValue,
          navigationType: performance.navigation?.type || 0,
        });
      }
    });
  } catch (error) {
    console.error('[WebVitals] CLS measurement failed:', error);
  }
}

/**
 * Measure First Contentful Paint (FCP)
 * Tracks when the first text/image is painted
 */
export function measureFCP() {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          trackWebVital({
            name: 'FCP',
            value: entry.startTime,
            id: `fcp-${Date.now()}`,
            delta: entry.startTime,
            navigationType: performance.navigation?.type || 0,
          });
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (error) {
    console.error('[WebVitals] FCP measurement failed:', error);
  }
}

/**
 * Measure Time to First Byte (TTFB)
 * Tracks server response time
 */
export function measureTTFB() {
  if (!window.performance || !window.performance.timing) return;

  try {
    const { responseStart, requestStart } = window.performance.timing;
    const ttfb = responseStart - requestStart;

    if (ttfb > 0) {
      trackWebVital({
        name: 'TTFB',
        value: ttfb,
        id: `ttfb-${Date.now()}`,
        delta: ttfb,
        navigationType: performance.navigation?.type || 0,
      });
    }
  } catch (error) {
    console.error('[WebVitals] TTFB measurement failed:', error);
  }
}

/**
 * Measure custom metric
 * @param {string} name - Metric name
 * @param {function} measureFn - Measurement function that returns a value
 */
export function measureCustom(name, measureFn) {
  try {
    const value = measureFn();

    if (typeof value === 'number' && value >= 0) {
      const analytics = getAnalytics();
      analytics.trackPerformance(name, value, {
        custom: true,
      });

      console.log(`[WebVitals] ${name}:`, value);
    }
  } catch (error) {
    console.error(`[WebVitals] ${name} measurement failed:`, error);
  }
}

/**
 * Initialize all Web Vitals measurements
 */
export function initWebVitals() {
  // Wait for page load
  if (document.readyState === 'complete') {
    startMeasurements();
  } else {
    window.addEventListener('load', startMeasurements);
  }
}

/**
 * Start all measurements
 */
function startMeasurements() {
  console.log('[WebVitals] Starting measurements...');

  measureLCP();
  measureFID();
  measureCLS();
  measureFCP();
  measureTTFB();

  // Custom metrics
  measureCustom('memory-used', () => {
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1048576);
    }
    return null;
  });

  measureCustom('fps', () => {
    // This would be measured continuously in the app
    return null;
  });
}

export default {
  initWebVitals,
  measureLCP,
  measureFID,
  measureCLS,
  measureFCP,
  measureTTFB,
  measureCustom,
};
