import React from 'react';
import './ScrollProgressIndicator.css';

/**
 * ScrollProgressIndicator Component
 * Visual indicator of scroll position with section markers
 *
 * @param {Object} props
 * @param {number} props.progress - Scroll progress (0-1)
 * @param {number} props.currentSection - Active section index
 * @param {number} props.totalSections - Total number of sections
 * @param {function} props.onSectionClick - Section click handler
 * @param {boolean} props.visible - Visibility toggle
 */
export default function ScrollProgressIndicator({
  progress = 0,
  currentSection = 0,
  totalSections = 4,
  onSectionClick,
  visible = true,
}) {
  if (!visible) return null;

  const sectionLabels = [
    'Overview',
    'Architecture',
    'Capabilities',
    'Integration',
  ];

  return (
    <div className="scroll-progress-indicator">
      {/* Progress bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* Section markers */}
      <div className="progress-sections">
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            className={`progress-section ${currentSection === i ? 'active' : ''} ${
              progress >= i / totalSections ? 'passed' : ''
            }`}
            onClick={() => onSectionClick && onSectionClick(i)}
            title={sectionLabels[i]}
          >
            <div className="section-dot" />
            <div className="section-label">{sectionLabels[i]}</div>
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      {progress < 0.1 && (
        <div className="scroll-hint">
          <div className="scroll-hint-icon">↓</div>
          <div className="scroll-hint-text">Scroll to explore</div>
        </div>
      )}
    </div>
  );
}
