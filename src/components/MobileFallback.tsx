import { useState, useEffect } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import './MobileFallback.css';

export function MobileFallback() {
  const { entities } = useSceneStore();
  const [activeEntity, setActiveEntity] = useState<string | null>(null);

  return (
    <div className="mobile-fallback">
      {/* Hero section with logo */}
      <section className="mobile-hero">
        <div className="mobile-logo-container">
          <img
            src="/assets/logo/kairo_logo.jpg"
            alt="Kairo Studio"
            className="mobile-logo"
          />
        </div>
        <h1 className="mobile-title">Kairoverse</h1>
        <p className="mobile-tagline">Where Strategy Becomes a Living Idea</p>
      </section>

      {/* Entity cards */}
      <section className="mobile-entities">
        {entities.map((entity, index) => (
          <div
            key={entity.id}
            className={`mobile-entity-card ${activeEntity === entity.id ? 'active' : ''}`}
            style={{
              borderColor: entity.color,
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => setActiveEntity(activeEntity === entity.id ? null : entity.id)}
          >
            <div className="entity-card-header">
              <div
                className="entity-card-icon"
                style={{ backgroundColor: entity.color }}
              />
              <h3 className="entity-card-title">{entity.title}</h3>
            </div>

            {activeEntity === entity.id && (
              <div className="entity-card-content">
                <p className="entity-card-description">{entity.description}</p>
                <button
                  className="entity-card-button"
                  style={{ borderColor: entity.color, color: entity.color }}
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
