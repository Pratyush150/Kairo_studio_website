import React, { useState, useEffect } from 'react';
import './Skip3DToggle.css';

/**
 * Skip3DToggle Component
 * Allows users to toggle between 3D experience and static fallback
 *
 * Features:
 * - Persistent preference (localStorage)
 * - Keyboard accessible
 * - Screen reader announcements
 * - Respects prefers-reduced-motion
 * - ARIA attributes for accessibility
 *
 * @param {Object} props
 * @param {boolean} props.skip3D - Current skip 3D state
 * @param {function} props.onToggle - Callback when toggle changes
 * @param {boolean} props.visible - Whether toggle is visible
 */
export default function Skip3DToggle({ skip3D = false, onToggle, visible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cerebral-skip-3d');
    if (saved !== null) {
      const shouldSkip = saved === 'true';
      if (shouldSkip !== skip3D && onToggle) {
        onToggle(shouldSkip);
      }
    }
  }, []);

  // Handle toggle change
  const handleToggle = () => {
    const newValue = !skip3D;

    // Save to localStorage
    localStorage.setItem('cerebral-skip-3d', String(newValue));

    // Call callback
    if (onToggle) {
      onToggle(newValue);
    }

    // Announce to screen readers
    announceChange(newValue);

    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Announce state change to screen readers
  const announceChange = (newValue) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = newValue
      ? 'Switched to simplified view. Page will reload.'
      : 'Switched to full 3D experience. Page will reload.';
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  if (!visible) return null;

  return (
    <div className="skip-3d-toggle-container">
      {/* Toggle Button */}
      <button
        className={`skip-3d-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Accessibility options"
        aria-controls="skip-3d-panel"
      >
        <span className="toggle-icon" aria-hidden="true">
          ♿
        </span>
        <span className="toggle-text">Accessibility</span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          id="skip-3d-panel"
          className="skip-3d-panel"
          role="dialog"
          aria-labelledby="skip-3d-title"
          aria-describedby="skip-3d-description"
        >
          <h3 id="skip-3d-title" className="panel-title">
            Display Preferences
          </h3>

          <p id="skip-3d-description" className="panel-description">
            Choose how you want to experience this site
          </p>

          {/* Toggle Switch */}
          <div className="toggle-option">
            <label htmlFor="skip-3d-checkbox" className="toggle-label">
              <span className="label-text">Use simplified view</span>
              <span className="label-description">
                Disable 3D graphics for better performance or accessibility
              </span>
            </label>

            <button
              id="skip-3d-checkbox"
              role="switch"
              aria-checked={skip3D}
              onClick={handleToggle}
              className={`toggle-switch ${skip3D ? 'active' : ''}`}
              aria-label={`Simplified view is ${skip3D ? 'enabled' : 'disabled'}`}
            >
              <span className="switch-slider" aria-hidden="true"></span>
            </button>
          </div>

          {/* Benefits List */}
          <div className="benefits-section">
            <h4 className="benefits-title">Simplified view includes:</h4>
            <ul className="benefits-list">
              <li>✓ Faster loading times</li>
              <li>✓ Lower resource usage</li>
              <li>✓ Better screen reader support</li>
              <li>✓ No motion animations</li>
              <li>✓ Keyboard-friendly navigation</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="panel-close"
            aria-label="Close accessibility options"
          >
            Close
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="skip-3d-backdrop"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
}
