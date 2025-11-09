import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';
import './PanelView.css';

export function PanelView() {
  const { sceneState, selectedEntity, entities, closePanel } = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const entity = entities.find((e) => e.id === selectedEntity);
  const isVisible = sceneState === 'panel' && entity;

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
    }
  }, [isVisible]);

  const handleClose = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          closePanel();
        },
      });
    }
  };

  if (!isVisible || !entity) return null;

  return (
    <div className="panel-overlay">
      <div ref={panelRef} className="panel">
        {/* Close button */}
        <button className="panel-close" onClick={handleClose} aria-label="Close panel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="panel-section panel-header" style={{ borderColor: entity.color }}>
          <div
            className="panel-icon"
            style={{
              background: `linear-gradient(135deg, ${entity.color}40, ${entity.color}20)`,
              boxShadow: `0 0 30px ${entity.color}40`,
            }}
          >
            <div
              className="panel-icon-glow"
              style={{
                background: `radial-gradient(circle, ${entity.color}60, transparent)`,
              }}
            />
          </div>
          <h1 className="panel-title" style={{ color: entity.color }}>
            {entity.title}
          </h1>
          <p className="panel-subtitle">{entity.description}</p>
        </div>

        {/* Content */}
        <div className="panel-section panel-content">
          <h2 className="panel-section-title">Overview</h2>
          <p className="panel-text">
            {getEntityContent(entity.slug)}
          </p>

          <h2 className="panel-section-title">Key Features</h2>
          <ul className="panel-list">
            {getEntityFeatures(entity.slug).map((feature, index) => (
              <li key={index} className="panel-list-item">
                <span className="panel-list-bullet" style={{ backgroundColor: entity.color }} />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="panel-cta">
            <button
              className="panel-button"
              style={{
                borderColor: entity.color,
                color: entity.color,
                boxShadow: `0 0 20px ${entity.color}40`,
              }}
              onClick={() => {
                // Track CTA click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'cta_click', {
                    entity_slug: entity.slug,
                  });
                }
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for content (would typically come from CMS)
function getEntityContent(slug: string): string {
  const content: Record<string, string> = {
    'brand-strategy': 'Strategic brand development that positions your business for sustainable growth and market leadership.',
    'design-creative': 'Innovative design solutions that captivate audiences and elevate your brand presence across all touchpoints.',
    'saas-automation': 'Cutting-edge SaaS solutions and intelligent automation that streamline operations and accelerate growth.',
    'performance-marketing': 'Data-driven marketing campaigns optimized for maximum ROI and sustainable customer acquisition.',
    'case-studies': 'Real-world success stories showcasing transformative results for clients across industries.',
    'collaborations': 'Strategic partnerships and collaborative ventures that amplify impact and drive mutual success.',
    'experiments': 'Innovative explorations at the intersection of technology, design, and creative problem-solving.',
    'contact': 'Connect with us to explore how we can help transform your vision into reality.',
  };

  return content[slug] || 'Discover how we can help you achieve your goals.';
}

function getEntityFeatures(slug: string): string[] {
  const features: Record<string, string[]> = {
    'brand-strategy': [
      'Brand positioning & messaging',
      'Market research & competitive analysis',
      'Visual identity & brand guidelines',
      'Go-to-market strategy',
    ],
    'design-creative': [
      'UI/UX design & prototyping',
      'Motion graphics & animation',
      'Brand identity design',
      'Creative direction & art direction',
    ],
    'saas-automation': [
      'Custom SaaS platform development',
      'Workflow automation & integration',
      'API development & management',
      'Cloud infrastructure & DevOps',
    ],
    'performance-marketing': [
      'Paid media strategy & execution',
      'Conversion rate optimization',
      'Marketing analytics & attribution',
      'Growth experimentation',
    ],
    'case-studies': [
      '50+ successful project deliveries',
      'Average 3x ROI improvement',
      'Cross-industry expertise',
      'End-to-end transformation stories',
    ],
    'collaborations': [
      'Strategic technology partnerships',
      'Creative agency collaborations',
      'Industry thought leadership',
      'Open-source contributions',
    ],
    'experiments': [
      'AI & machine learning explorations',
      '3D & immersive experiences',
      'Generative design tools',
      'Emerging technology R&D',
    ],
    'contact': [
      'Free consultation call',
      '24-hour response time',
      'Flexible engagement models',
      'Global team, local presence',
    ],
  };

  return features[slug] || ['Innovation', 'Excellence', 'Results', 'Partnership'];
}
