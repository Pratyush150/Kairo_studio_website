import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './PropertyPanel.css';

const PropertyPanel = ({ plate, onClose, reducedMotion }) => {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [metrics, setMetrics] = useState(plate.metrics || []);

  useEffect(() => {
    // Panel open animation
    const tl = gsap.timeline();

    if (!reducedMotion) {
      // Overlay fade in
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 0.6, duration: 0.18 }
      );

      // Panel slide from right
      tl.fromTo(
        panelRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.42, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        '-=0.1'
      );

      // Stagger children
      tl.fromTo(
        '.panel-content > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.16, stagger: 0.08, ease: 'power2.out' },
        '-=0.2'
      );

      // Animate metrics counters
      if (plate.metrics && plate.metrics.length > 0) {
        plate.metrics.forEach((metric, index) => {
          gsap.to(metrics[index] || {}, {
            value: metric.value,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: function() {
              const updatedMetrics = [...metrics];
              updatedMetrics[index] = { ...metric, animatedValue: Math.floor(this.targets()[0].value) };
              setMetrics(updatedMetrics);
            }
          });
        });
      }
    }

    // Focus trap
    const firstFocusable = panelRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    return () => {
      tl.kill();
    };
  }, [plate, reducedMotion]);

  const handleClose = () => {
    if (!reducedMotion) {
      const tl = gsap.timeline({
        onComplete: onClose
      });

      tl.to(panelRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.36,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });

      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.24
      }, '-=0.2');
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className="property-panel-container" onKeyDown={handleKeyDown}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="panel-overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="property-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Close button */}
        <button
          className="panel-close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Content */}
        <div ref={contentRef} className="panel-content">
          {/* Hero image if available */}
          {plate.heroImageUrl && (
            <div className="panel-hero">
              <img src={plate.heroImageUrl} alt={plate.title} loading="lazy" />
            </div>
          )}

          {/* Metrics */}
          {plate.metrics && plate.metrics.length > 0 && (
            <div className="panel-metrics">
              {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-value">{metric.animatedValue || 0}+</div>
                  <div className="metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Main content */}
          <div
            className="panel-body"
            id="panel-title"
            dangerouslySetInnerHTML={{ __html: plate.longHtml }}
          />

          {/* Tags */}
          {plate.tags && plate.tags.length > 0 && (
            <div className="panel-tags">
              {plate.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Demo link if available */}
          {plate.demoUrl && (
            <div className="panel-demo">
              <a href={plate.demoUrl} className="demo-button" target="_blank" rel="noopener noreferrer">
                View Demo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
