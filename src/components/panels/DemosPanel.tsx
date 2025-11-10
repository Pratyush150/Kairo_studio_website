/**
 * Demos Panel
 * 6 interactive demo tiles with previews
 */

import { useState, useEffect, useRef } from 'react';
import './DemosPanel.css';

interface Demo {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  thumbnail: string;
  lottie?: string;
  demoType: 'sandbox' | 'gated' | 'interactive';
  demoUrl?: string;
  features: string[];
  cta: {
    text: string;
    action: string;
  };
}

interface DemosPanelProps {
  content: {
    headline: string;
    lead: string;
  };
  demos: Demo[];
  onAction: (action: string, demo?: Demo) => void;
}

export function DemosPanel({ content, demos, onAction }: DemosPanelProps) {
  const [hoveredDemo, setHoveredDemo] = useState<string | null>(null);
  const demoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // IntersectionObserver for autoplay when 60% visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(demoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [demos]);

  const handleDemoClick = (demo: Demo) => {
    if (demo.demoType === 'sandbox' && demo.demoUrl) {
      window.open(demo.demoUrl, '_blank');
      onAction('launchDemo', demo);
    } else if (demo.demoType === 'gated') {
      onAction('requestDemo', demo);
    } else {
      onAction(demo.cta.action, demo);
    }
  };

  return (
    <div className="demos-panel">
      <header className="demos-header">
        <h1>{content.headline}</h1>
        <p>{content.lead}</p>
      </header>

      <div className="demos-grid">
        {demos.map((demo) => (
          <div
            key={demo.id}
            ref={(el) => (demoRefs.current[demo.id] = el)}
            className={`demo-card ${hoveredDemo === demo.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredDemo(demo.id)}
            onMouseLeave={() => setHoveredDemo(null)}
            onClick={() => handleDemoClick(demo)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleDemoClick(demo)}
          >
            <div className="demo-preview">
              <img src={demo.thumbnail} alt={demo.title} />
              {demo.lottie && (
                <div className="demo-lottie-overlay">
                  <div className="lottie-placeholder">Preview Animation</div>
                </div>
              )}
              <div className="demo-type-badge">
                {demo.demoType === 'sandbox' && '▶ Live Demo'}
                {demo.demoType === 'gated' && '🔒 Request Access'}
                {demo.demoType === 'interactive' && '⚡ Interactive'}
              </div>
            </div>

            <div className="demo-content">
              <h3 className="demo-title">{demo.title}</h3>
              <p className="demo-subtitle">{demo.subtitle}</p>
              <p className="demo-description">{demo.description}</p>

              <div className="demo-features">
                {demo.features.slice(0, 3).map((feature, i) => (
                  <span key={i} className="demo-feature">✓ {feature}</span>
                ))}
              </div>

              <div className="demo-tech">
                {demo.tech.map((tech, i) => (
                  <span key={i} className="tech-tag">{tech}</span>
                ))}
              </div>

              <button className="demo-cta-btn">
                {demo.cta.text}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
