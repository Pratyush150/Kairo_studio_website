/**
 * Panel View
 * Content panel displayed when morph is clicked
 */

import { useEffect, useRef } from 'react';
import { useSceneStore, sceneAPI } from '../lib/sceneAPI';
import gsap from 'gsap';
import './PanelView.css';

export function PanelView() {
  const { sceneState, panelOpen, panelContent } = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const isVisible = sceneState === 'panel' && panelOpen && panelContent;
  const morphData = panelContent ? sceneAPI.getMorphData(panelContent) : null;

  useEffect(() => {
    if (isVisible && panelRef.current) {
      // Entrance animation
      gsap.fromTo(
        panelRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          ease: 'power3.out',
        }
      );

      // Stagger children
      const children = panelRef.current.querySelectorAll('.panel-section');
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2,
        }
      );

      // Set aria-live announcement
      const announcer = document.getElementById('a11y-announcer');
      if (announcer && morphData) {
        announcer.textContent = `${morphData.name} panel opened`;
      }
    }
  }, [isVisible, morphData]);

  const handleClose = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          sceneAPI.closePanel();
        },
      });
    }
  };

  if (!isVisible || !morphData) return null;

  return (
    <div className="panel-overlay">
      <div ref={panelRef} className="panel">
        {/* Close button */}
        <button className="panel-close" onClick={handleClose} aria-label="Close panel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="panel-section panel-header" style={{ borderColor: morphData.accent }}>
          <h1 className="panel-title" style={{ color: morphData.accent }}>
            {morphData.name}
          </h1>
          <p className="panel-subtitle">{morphData.description}</p>
        </div>

        {/* Content */}
        <div className="panel-section panel-content">
          <h2 className="panel-section-title">Overview</h2>
          <p className="panel-text">
            {getMorphContent(morphData.slug)}
          </p>

          <h2 className="panel-section-title">What We Offer</h2>
          <ul className="panel-list">
            {getMorphFeatures(morphData.slug).map((feature, index) => (
              <li key={index} className="panel-list-item">
                <span className="panel-list-bullet" style={{ backgroundColor: morphData.accent }} />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="panel-cta">
            <button
              className="panel-button"
              style={{
                borderColor: morphData.accent,
                color: morphData.accent,
                boxShadow: `0 0 20px ${morphData.accent}40`,
              }}
              onClick={() => {
                // Track CTA click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'cta_click', {
                    morph_type: morphData.id,
                    morph_slug: morphData.slug,
                  });
                }
              }}
            >
              Talk to us
            </button>
            <button
              className="panel-button panel-button-secondary"
              onClick={handleClose}
            >
              Back to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for content
function getMorphContent(slug: string): string {
  const content: Record<string, string> = {
    about: 'Kairo Studio is a performance-driven agency that builds systems that move. We combine strategic thinking, creative excellence, and technical expertise to deliver transformative results.',
    work: 'We craft digital experiences that flow seamlessly across platforms. From SaaS products to marketing campaigns, we build solutions that perform.',
    collaborate: 'Great work happens through great partnerships. We collaborate with forward-thinking brands to create systems that scale and adapt.',
    contact: 'Ready to start? Let\'s talk about how we can help you build systems that work.',
  };

  return content[slug] || 'Discover how we can help you achieve your goals.';
}

function getMorphFeatures(slug: string): string[] {
  const features: Record<string, string[]> = {
    about: [
      'Performance marketing & automation',
      'SaaS product development',
      'Brand strategy & positioning',
      'End-to-end digital transformation',
    ],
    work: [
      'High-converting web experiences',
      'Marketing automation systems',
      'SaaS platform development',
      'Data-driven optimization',
    ],
    collaborate: [
      'Strategic partnerships',
      'Flexible engagement models',
      'Dedicated team support',
      'Results-focused approach',
    ],
    contact: [
      'Free consultation call',
      'Fast response time',
      'Transparent pricing',
      'No-obligation discussion',
    ],
  };

  return features[slug] || ['Innovation', 'Excellence', 'Results', 'Partnership'];
}
