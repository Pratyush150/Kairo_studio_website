import { useEffect } from 'react';

export function AnalyticsTracker() {
  useEffect(() => {
    // Logo hover tracking
    const handleLogoHover = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { active } = customEvent.detail;

      if (active) {
        // Emit GA4 event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'logo_hover', {
            id: 'logo',
            ts: Date.now(),
          });
        }

        // Custom analytics
        console.log('[Analytics] logo_hover', { id: 'logo', ts: Date.now() });
      }
    };

    // Logo click tracking
    const handleExplosion = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'logo_click', {
          method: 'mouse',
          ts: Date.now(),
        });
      }

      console.log('[Analytics] logo_click', { method: 'mouse', ts: Date.now() });
    };

    // Entity hover tracking
    const handleEntityHover = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { entityId, active } = customEvent.detail;

      if (active) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'entity_hover', {
            entityId,
            ts: Date.now(),
          });
        }

        console.log('[Analytics] entity_hover', { entityId, ts: Date.now() });
      }
    };

    // Entity click tracking is already in Entity.tsx goTo()

    // Performance degrade tracking
    const handlePerformanceDegrade = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { fps, timestamp, mode } = customEvent.detail;

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_degrade', {
          fps: Math.round(fps),
          timestamp,
          mode,
        });
      }

      console.log('[Analytics] performance_degrade', { fps, timestamp, mode });
    };

    // Panel open tracking
    const handlePanelOpen = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { slug } = customEvent.detail;

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'panel_open', {
          slug,
          ts: Date.now(),
        });
      }

      console.log('[Analytics] panel_open', { slug, ts: Date.now() });
    };

    // Add listeners
    window.addEventListener('kairo:logo-hover', handleLogoHover);
    window.addEventListener('kairo:explosion-sequence', handleExplosion);
    window.addEventListener('kairo:entity-hover', handleEntityHover);
    window.addEventListener('kairo:performance-degrade', handlePerformanceDegrade);
    window.addEventListener('kairo:panel-open', handlePanelOpen);

    return () => {
      window.removeEventListener('kairo:logo-hover', handleLogoHover);
      window.removeEventListener('kairo:explosion-sequence', handleExplosion);
      window.removeEventListener('kairo:entity-hover', handleEntityHover);
      window.removeEventListener('kairo:performance-degrade', handlePerformanceDegrade);
      window.removeEventListener('kairo:panel-open', handlePanelOpen);
    };
  }, []);

  return null;
}
