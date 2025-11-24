import { useEffect, useRef, useCallback } from 'react';
import { getAnalytics } from '../utils/analytics';

/**
 * useAnalytics Hook
 * Main hook for tracking analytics events
 *
 * @returns {Object} Analytics tracking functions
 */
export function useAnalytics() {
  const analytics = getAnalytics();

  const track = useCallback((eventName, properties) => {
    analytics.track(eventName, properties);
  }, [analytics]);

  const trackModule = useCallback((moduleId, action) => {
    analytics.trackModule(moduleId, action);
  }, [analytics]);

  const trackNavigation = useCallback((from, to, method) => {
    analytics.trackNavigation(from, to, method);
  }, [analytics]);

  const trackConversion = useCallback((type, details) => {
    analytics.trackConversion(type, details);
  }, [analytics]);

  const trackError = useCallback((error, context) => {
    analytics.trackError(error, context);
  }, [analytics]);

  return {
    track,
    trackModule,
    trackNavigation,
    trackConversion,
    trackError,
  };
}

/**
 * useModuleTracking Hook
 * Tracks module view duration and interactions
 *
 * @param {string} moduleId - Module ID
 * @param {boolean} isActive - Whether module is active
 */
export function useModuleTracking(moduleId, isActive) {
  const analytics = getAnalytics();
  const viewStartRef = useRef(null);

  useEffect(() => {
    if (isActive && moduleId) {
      // Module opened
      viewStartRef.current = Date.now();
      analytics.trackModule(moduleId, 'view');

      console.log(`[Analytics] Module view started: ${moduleId}`);
    } else if (!isActive && moduleId && viewStartRef.current) {
      // Module closed
      const duration = Date.now() - viewStartRef.current;
      analytics.track('module_view_duration', {
        moduleId,
        duration: Math.round(duration / 1000),
      });

      viewStartRef.current = null;
      console.log(`[Analytics] Module view ended: ${moduleId}, duration: ${duration}ms`);
    }
  }, [isActive, moduleId, analytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewStartRef.current && moduleId) {
        const duration = Date.now() - viewStartRef.current;
        analytics.track('module_view_duration', {
          moduleId,
          duration: Math.round(duration / 1000),
          interrupted: true,
        });
      }
    };
  }, [moduleId, analytics]);
}

/**
 * useEngagementTracking Hook
 * Tracks user engagement with the 3D scene
 *
 * @param {boolean} enabled - Whether tracking is enabled
 */
export function useEngagementTracking(enabled = true) {
  const analytics = getAnalytics();
  const engagementStartRef = useRef(null);
  const totalEngagementRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    engagementStartRef.current = Date.now();

    // Track engagement every minute
    const interval = setInterval(() => {
      if (engagementStartRef.current && !document.hidden) {
        const duration = Date.now() - engagementStartRef.current;
        totalEngagementRef.current += duration;
        engagementStartRef.current = Date.now();

        analytics.track('3d_engagement', {
          duration: Math.round(duration / 1000),
          total: Math.round(totalEngagementRef.current / 1000),
        });
      }
    }, 60000); // Every minute

    return () => {
      clearInterval(interval);

      // Final engagement tracking
      if (engagementStartRef.current) {
        const duration = Date.now() - engagementStartRef.current;
        totalEngagementRef.current += duration;

        analytics.track('3d_engagement_total', {
          total: Math.round(totalEngagementRef.current / 1000),
        });
      }
    };
  }, [enabled, analytics]);

  return {
    totalEngagement: totalEngagementRef.current,
  };
}

/**
 * useScrollTracking Hook
 * Tracks scroll progress and section views
 *
 * @param {number} currentSection - Current scroll section
 * @param {number} scrollProgress - Scroll progress (0-1)
 */
export function useScrollTracking(currentSection, scrollProgress) {
  const analytics = getAnalytics();
  const previousSectionRef = useRef(currentSection);
  const sectionsVisitedRef = useRef(new Set([currentSection]));

  useEffect(() => {
    if (currentSection !== previousSectionRef.current) {
      // Track section change
      analytics.track('scroll_section', {
        from: previousSectionRef.current,
        to: currentSection,
        progress: Math.round(scrollProgress * 100),
      });

      // Track unique sections visited
      sectionsVisitedRef.current.add(currentSection);

      previousSectionRef.current = currentSection;
    }
  }, [currentSection, scrollProgress, analytics]);

  // Track scroll milestones
  useEffect(() => {
    const milestones = [0.25, 0.5, 0.75, 1.0];
    const reached = milestones.filter(m => scrollProgress >= m);

    reached.forEach(milestone => {
      const key = `scroll-${milestone}`;
      if (!sessionStorage.getItem(key)) {
        analytics.track('scroll_milestone', {
          milestone,
          progress: Math.round(scrollProgress * 100),
        });
        sessionStorage.setItem(key, 'true');
      }
    });
  }, [scrollProgress, analytics]);

  return {
    sectionsVisited: sectionsVisitedRef.current.size,
  };
}

/**
 * usePerformanceTracking Hook
 * Tracks FPS and performance metrics
 *
 * @param {Object} stats - Performance stats
 */
export function usePerformanceTracking(stats) {
  const analytics = getAnalytics();
  const lastReportRef = useRef(Date.now());

  useEffect(() => {
    // Report performance every 30 seconds
    const now = Date.now();
    if (now - lastReportRef.current > 30000) {
      if (stats && stats.current) {
        analytics.trackPerformance('fps', stats.current, {
          average: stats.average,
          min: stats.min,
          max: stats.max,
        });

        lastReportRef.current = now;
      }
    }
  }, [stats, analytics]);
}

/**
 * useClickTracking Hook
 * Tracks clicks on specific elements
 *
 * @param {string} elementId - Element identifier
 */
export function useClickTracking(elementId) {
  const analytics = getAnalytics();

  const trackClick = useCallback((details = {}) => {
    analytics.track('click', {
      elementId,
      ...details,
    });
  }, [elementId, analytics]);

  return { trackClick };
}

/**
 * useConversionTracking Hook
 * Tracks conversion events
 */
export function useConversionTracking() {
  const analytics = getAnalytics();

  const trackConversion = useCallback((type, details = {}) => {
    analytics.trackConversion(type, details);
    console.log(`[Analytics] Conversion: ${type}`, details);
  }, [analytics]);

  return { trackConversion };
}

export default {
  useAnalytics,
  useModuleTracking,
  useEngagementTracking,
  useScrollTracking,
  usePerformanceTracking,
  useClickTracking,
  useConversionTracking,
};
