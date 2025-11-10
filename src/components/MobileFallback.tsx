/**
 * Mobile Fallback
 * Lightweight alternative for low-memory mobile devices
 * Uses CSS animations instead of WebGL
 */

import { useState } from 'react';
import { morphs } from '../lib/tokens';
import './MobileFallback.css';

export function MobileFallback() {
  const [activeMorph, setActiveMorph] = useState<string | null>(null);

  const morphList = Object.entries(morphs);

  return (
    <div className="mobile-fallback">
      {/* Hero section with logo */}
      <section className="mobile-hero">
        <div className="mobile-logo-container">
          <div className="mobile-logo-placeholder">
            {/* Kairo Studio Logo */}
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
              KAIRO
            </h2>
          </div>
        </div>
        <h1 className="mobile-title">Morphing Canvas</h1>
        <p className="mobile-tagline">We build systems that move</p>
      </section>

      {/* Morph cards */}
      <section className="mobile-entities">
        {morphList.map(([key, morph], index) => (
          <div
            key={key}
            className={`mobile-entity-card ${activeMorph === key ? 'active' : ''}`}
            style={{
              borderColor: morph.accent,
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => setActiveMorph(activeMorph === key ? null : key)}
          >
            <div className="entity-card-header">
              <div
                className="entity-card-icon"
                style={{ backgroundColor: morph.accent }}
              />
              <h3 className="entity-card-title">{morph.name}</h3>
            </div>

            {activeMorph === key && (
              <div className="entity-card-content">
                <p className="entity-card-description">{morph.description}</p>
                <button
                  className="entity-card-button"
                  style={{ borderColor: morph.accent, color: morph.accent }}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Navigate to: ${morph.slug}`);
                  }}
                >
                  Learn More →
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mobile-footer">
        <p>© 2024 Kairo Studio. All rights reserved.</p>
        <p className="mobile-fallback-notice">
          For the full 3D experience, visit on desktop
        </p>
      </footer>
    </div>
  );
}
