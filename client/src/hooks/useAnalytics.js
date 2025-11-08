import { useCallback } from 'react';

// Vite automatically provides import.meta.env for environment variables

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName, eventData = {}) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Custom analytics endpoint
    if (typeof window !== 'undefined' && import.meta.env.VITE_API_URL) {
      fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(err => console.error('Analytics error:', err));
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', eventName, eventData);
    }
  }, []);

  const trackPageView = useCallback((path) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path
      });
    }
  }, []);

  const trackTiming = useCallback((category, variable, value) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category
      });
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackTiming
  };
};
