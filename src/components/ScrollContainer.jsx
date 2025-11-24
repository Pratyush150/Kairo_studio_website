import React from 'react';
import './ScrollContainer.css';

/**
 * ScrollContainer Component
 * Creates virtual scroll height for scroll-driven animations
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.sections - Number of sections (default: 4)
 */
export default function ScrollContainer({ children, sections = 4 }) {
  // Create virtual height (each section = 100vh)
  const scrollHeight = `${sections * 100}vh`;

  return (
    <>
      {/* Fixed canvas container */}
      <div className="scroll-canvas-container">
        {children}
      </div>

      {/* Invisible spacer for scroll height */}
      <div
        className="scroll-spacer"
        style={{ height: scrollHeight }}
        aria-hidden="true"
      />
    </>
  );
}
