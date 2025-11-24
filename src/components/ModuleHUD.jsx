import React from 'react';
import { getModuleById } from '../lib/moduleData';
import './ModuleHUD.css';

/**
 * ModuleHUD Component
 * Displays detailed information about the active module
 *
 * @param {Object} props
 * @param {string} props.moduleId - Active module ID
 * @param {function} props.onClose - Close handler
 */
export default function ModuleHUD({ moduleId, onClose }) {
  if (!moduleId) return null;

  const module = getModuleById(moduleId);
  if (!module) return null;

  return (
    <div className="module-hud" data-module={moduleId}>
      <div className="module-hud-overlay" onClick={onClose} />

      <div className="module-hud-content" style={{ borderColor: module.color }}>
        {/* Header */}
        <div className="module-hud-header">
          <div className="module-hud-icon" style={{ color: module.color }}>
            {module.icon}
          </div>
          <div className="module-hud-title">
            <h2>{module.name}</h2>
            <p>{module.description}</p>
          </div>
          <button className="module-hud-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Features */}
        <div className="module-hud-body">
          <h3 style={{ color: module.color }}>Key Features</h3>
          <ul className="module-hud-features">
            {module.features.map((feature, index) => (
              <li key={index} style={{ '--delay': `${index * 0.1}s` }}>
                <span className="feature-bullet" style={{ background: module.color }}>
                  ✓
                </span>
                <span className="feature-text">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="module-hud-footer">
          <button
            className="module-hud-button"
            style={{
              borderColor: module.color,
              color: module.color,
            }}
            onClick={() => console.log(`Learn more about ${module.name}`)}
          >
            Learn More
          </button>
          <button
            className="module-hud-button module-hud-button-primary"
            style={{
              background: module.color,
              borderColor: module.color,
            }}
            onClick={() => console.log(`Get started with ${module.name}`)}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ModuleHintOverlay Component
 * Shows hint to click on modules
 */
export function ModuleHintOverlay({ visible = true }) {
  if (!visible) return null;

  return (
    <div className="module-hint-overlay">
      <div className="module-hint">
        <div className="module-hint-icon">👆</div>
        <div className="module-hint-text">
          Click on the <span className="highlight">colored spheres</span> to explore modules
        </div>
      </div>
    </div>
  );
}
