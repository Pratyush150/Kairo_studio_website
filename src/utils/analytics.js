/**
 * Analytics Tracking Utility
 * Comprehensive analytics system for tracking user interactions and performance
 *
 * Features:
 * - Event tracking (module interactions, navigation, etc.)
 * - User engagement time tracking
 * - Conversion tracking
 * - Error tracking
 * - Custom event queue
 * - Privacy-conscious (respects DNT)
 * - Works with Google Analytics, Plausible, or custom backend
 */

class AnalyticsManager {
  constructor() {
    this.enabled = false;
    this.eventQueue = [];
    this.sessionStart = Date.now();
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.pageLoadTime = null;
    this.engagementStart = null;
    this.totalEngagementTime = 0;
    this.respectsDNT = navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes';

    // Initialize
    this.init();
  }

  /**
   * Initialize analytics system
   */
  init() {
    // Respect Do Not Track
    if (this.respectsDNT) {
      console.log('[Analytics] Do Not Track detected - analytics disabled');
      return;
    }

    // Check for development environment
    if (import.meta.env.DEV) {
      console.log('[Analytics] Development mode - logging events to console');
      this.enabled = true;
      this.debugMode = true;
    } else {
      this.enabled = true;
      this.debugMode = false;
    }

    // Track page load
    this.trackPageLoad();

    // Track engagement time
    this.startEngagementTracking();

    // Track page visibility
    this.trackVisibility();

    console.log('[Analytics] Initialized', {
      sessionId: this.sessionId,
      userId: this.userId,
      respectsDNT: this.respectsDNT,
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create user ID
   */
  getUserId() {
    let userId = localStorage.getItem('cerebral-user-id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cerebral-user-id', userId);
    }
    return userId;
  }

  /**
   * Track page load
   */
  trackPageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      this.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      this.track('page_load', {
        loadTime: this.pageLoadTime,
        url: window.location.pathname,
        referrer: document.referrer,
      });
    }
  }

  /**
   * Start engagement time tracking
   */
  startEngagementTracking() {
    this.engagementStart = Date.now();

    // Track engagement time every 30 seconds
    this.engagementInterval = setInterval(() => {
      if (this.engagementStart && !document.hidden) {
        const duration = Date.now() - this.engagementStart;
        this.totalEngagementTime += duration;
        this.engagementStart = Date.now();

        this.track('engagement_time', {
          duration: Math.round(duration / 1000),
          total: Math.round(this.totalEngagementTime / 1000),
        });
      }
    }, 30000);
  }

  /**
   * Track page visibility changes
   */
  trackVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - pause engagement tracking
        if (this.engagementStart) {
          const duration = Date.now() - this.engagementStart;
          this.totalEngagementTime += duration;
          this.engagementStart = null;
        }

        this.track('page_blur', {
          totalEngagement: Math.round(this.totalEngagementTime / 1000),
        });
      } else {
        // Page visible - resume engagement tracking
        this.engagementStart = Date.now();

        this.track('page_focus', {
          totalEngagement: Math.round(this.totalEngagementTime / 1000),
        });
      }
    });
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      },
    };

    // Add to queue
    this.eventQueue.push(event);

    // Log in debug mode
    if (this.debugMode) {
      console.log(`[Analytics] ${eventName}`, event.properties);
    }

    // Send to analytics provider
    this.sendToProvider(event);
  }

  /**
   * Track module interaction
   * @param {string} moduleId - Module ID
   * @param {string} action - Action (view, click, close)
   */
  trackModule(moduleId, action) {
    this.track('module_interaction', {
      moduleId,
      action,
    });
  }

  /**
   * Track navigation
   * @param {string} from - Source location
   * @param {string} to - Destination location
   * @param {string} method - Navigation method (click, keyboard, scroll)
   */
  trackNavigation(from, to, method = 'click') {
    this.track('navigation', {
      from,
      to,
      method,
    });
  }

  /**
   * Track conversion
   * @param {string} type - Conversion type
   * @param {Object} details - Conversion details
   */
  trackConversion(type, details = {}) {
    this.track('conversion', {
      type,
      ...details,
    });
  }

  /**
   * Track error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  /**
   * Track performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} details - Additional details
   */
  trackPerformance(metric, value, details = {}) {
    this.track('performance', {
      metric,
      value,
      ...details,
    });
  }

  /**
   * Send event to analytics provider
   * @param {Object} event - Event object
   */
  sendToProvider(event) {
    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, event.properties);
    }

    // Plausible Analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(event.name, { props: event.properties });
    }

    // Custom backend endpoint
    if (!this.debugMode) {
      this.sendToBackend(event);
    }
  }

  /**
   * Send event to custom backend
   * @param {Object} event - Event object
   */
  async sendToBackend(event) {
    try {
      const endpoint = '/api/analytics';

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      if (this.debugMode) {
        console.error('[Analytics] Failed to send event:', error);
      }
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Date.now() - this.sessionStart,
      totalEngagementTime: this.totalEngagementTime,
      eventCount: this.eventQueue.length,
      events: this.eventQueue,
    };
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.eventQueue = [];
    this.sessionStart = Date.now();
    this.sessionId = this.generateSessionId();
    this.totalEngagementTime = 0;
  }

  /**
   * Cleanup on unmount
   */
  cleanup() {
    if (this.engagementInterval) {
      clearInterval(this.engagementInterval);
    }

    // Track final engagement time
    if (this.engagementStart) {
      const duration = Date.now() - this.engagementStart;
      this.totalEngagementTime += duration;
    }

    // Track session end
    this.track('session_end', {
      duration: Date.now() - this.sessionStart,
      totalEngagement: Math.round(this.totalEngagementTime / 1000),
      eventCount: this.eventQueue.length,
    });
  }
}

// Create singleton instance
let analyticsInstance = null;

export function getAnalytics() {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager();
  }
  return analyticsInstance;
}

export default {
  getAnalytics,
  AnalyticsManager,
};
