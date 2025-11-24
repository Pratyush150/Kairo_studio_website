import React from 'react';
import './FallbackHero.css';

/**
 * FallbackHero Component
 * Enhanced static fallback for users without WebGL or who prefer reduced motion
 *
 * Features:
 * - Pure CSS/SVG visualization
 * - Respects prefers-reduced-motion
 * - Fully accessible with keyboard navigation
 * - Screen reader compatible with ARIA attributes
 * - Fast loading and minimal resource usage
 *
 * @param {Object} props
 * @param {function} props.onEnableExperience - Callback to enable full 3D experience
 * @param {string} props.reason - Reason for fallback (no-webgl, user-preference, performance)
 */
export default function FallbackHero({ onEnableExperience, reason = 'no-webgl' }) {
  const modules = [
    {
      id: 'saas',
      name: 'SaaS Solutions',
      description: 'Scalable cloud architectures designed for growth and reliability',
      features: ['Multi-tenant Support', 'Auto-scaling', 'Cloud-native Design', 'API-first'],
    },
    {
      id: 'automation',
      name: 'Automation',
      description: 'Intelligent workflows that transform business operations',
      features: ['Process Automation', 'AI Integration', 'Analytics', 'Optimization'],
    },
    {
      id: 'integration',
      name: 'Integration',
      description: 'Seamless connections between systems and services',
      features: ['API Gateway', 'Data Sync', 'Event-driven', 'Real-time Updates'],
    },
  ];

  const reasonMessages = {
    'no-webgl': 'Your browser doesn\'t support WebGL, but you can still explore our solutions below.',
    'user-preference': 'You\'ve chosen to view the simplified version. You can enable the full experience anytime.',
    'performance': 'We\'ve detected limited resources. Here\'s a lighter version for better performance.',
  };

  return (
    <div className="fallback-hero" role="main" aria-label="Cerebral Machine - Portfolio">
      {/* Skip link for keyboard navigation */}
      <a href="#modules-section" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="fallback-header">
        <h1 className="fallback-title">
          Cerebral Machine
          <span className="fallback-subtitle" role="doc-subtitle">
            Intelligent Solutions Architecture
          </span>
        </h1>

        {/* Reason Notice */}
        <div className="fallback-notice" role="status" aria-live="polite">
          <p>{reasonMessages[reason]}</p>
          {(reason === 'user-preference' || reason === 'performance') && onEnableExperience && (
            <button
              onClick={onEnableExperience}
              className="fallback-enable-btn"
              aria-label="Enable full 3D experience"
            >
              Enable Full Experience
            </button>
          )}
        </div>
      </header>

      {/* Static Brain Visualization */}
      <div className="fallback-brain" aria-hidden="true">
        <svg
          viewBox="0 0 400 300"
          className="brain-svg"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Cerebral Machine visualization showing three interconnected modules"
        >
          <title>Brain Network Visualization</title>

          {/* Brain outline */}
          <g className="brain-outline">
            <ellipse cx="200" cy="150" rx="120" ry="100" className="brain-shape" />
            <path
              d="M 140 120 Q 180 100 220 120"
              className="brain-fold"
            />
            <path
              d="M 140 150 Q 180 130 220 150"
              className="brain-fold"
            />
            <path
              d="M 140 180 Q 180 160 220 180"
              className="brain-fold"
            />
          </g>

          {/* Connecting lines */}
          <g className="brain-connections">
            <line x1="200" y1="100" x2="160" y2="170" className="connection" />
            <line x1="200" y1="100" x2="240" y2="170" className="connection" />
            <line x1="160" y1="170" x2="240" y2="170" className="connection" />
          </g>

          {/* Module nodes */}
          <g className="brain-nodes">
            <circle cx="200" cy="100" r="15" className="node node-saas" />
            <circle cx="160" cy="170" r="15" className="node node-automation" />
            <circle cx="240" cy="170" r="15" className="node node-integration" />
          </g>

          {/* Labels */}
          <text x="200" y="85" textAnchor="middle" className="node-label">SaaS</text>
          <text x="160" y="200" textAnchor="middle" className="node-label">Automation</text>
          <text x="240" y="200" textAnchor="middle" className="node-label">Integration</text>
        </svg>
      </div>

      {/* Modules Grid */}
      <section
        id="modules-section"
        className="fallback-modules"
        aria-label="Our Solutions"
      >
        <h2 className="modules-title">Our Solutions</h2>
        <div className="modules-grid" role="list">
          {modules.map((module, index) => (
            <article
              key={module.id}
              className={`module-card module-${module.id}`}
              tabIndex={0}
              role="listitem"
              aria-labelledby={`module-${module.id}-title`}
              aria-describedby={`module-${module.id}-desc`}
            >
              <div className="module-icon" aria-hidden="true">
                <div className="icon-circle"></div>
              </div>
              <h3 id={`module-${module.id}-title`} className="module-name">
                {module.name}
              </h3>
              <p id={`module-${module.id}-desc`} className="module-description">
                {module.description}
              </p>
              <ul className="module-features" aria-label={`${module.name} features`}>
                {module.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Accessibility Features Notice */}
      <aside className="accessibility-notice" role="complementary" aria-label="Accessibility information">
        <h3>Accessibility Features</h3>
        <ul>
          <li>Keyboard navigation supported (Tab, Arrow keys)</li>
          <li>Screen reader optimized with ARIA labels</li>
          <li>No motion animations (respects your preferences)</li>
          <li>High contrast and readable fonts</li>
          <li>Semantic HTML structure</li>
        </ul>
      </aside>
    </div>
  );
}
