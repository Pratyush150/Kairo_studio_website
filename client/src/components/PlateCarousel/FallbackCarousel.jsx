import React, { useEffect, useState, useRef } from 'react';
import PropertyPanel from './PropertyPanel';
import './FallbackCarousel.css';

const FallbackCarousel = ({
  plates,
  activePlateIndex,
  onPlateChange,
  onPlateClick,
  isPanelOpen,
  onClosePanel
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onPlateChange((activePlateIndex + 1) % plates.length);
    }
    if (isRightSwipe) {
      onPlateChange((activePlateIndex - 1 + plates.length) % plates.length);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fallback-carousel"
      role="listbox"
      aria-label="Plate carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}
      <div className="fallback-background">
        <div className="stars"></div>
      </div>

      {/* Carousel container */}
      <div className="fallback-carousel-track">
        {plates.map((plate, index) => {
          const offset = index - activePlateIndex;
          const isActive = index === activePlateIndex;
          const isVisible = Math.abs(offset) <= 2;

          return (
            <div
              key={plate.id}
              className={`fallback-plate ${isActive ? 'active' : ''} ${isVisible ? 'visible' : 'hidden'}`}
              style={{
                transform: `translateX(${offset * 120}%) scale(${isActive ? 1 : 0.85})`,
                opacity: isActive ? 1 : 0.4,
                zIndex: isActive ? 10 : 5 - Math.abs(offset)
              }}
              role="option"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => isActive && onPlateClick(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isActive) {
                  onPlateClick(index);
                }
              }}
            >
              <div className="fallback-plate-content">
                <div className="plate-number">{index + 1}</div>
                <h3 className="plate-title">{plate.title}</h3>
                <p className="plate-short">{plate.short}</p>
                {isActive && (
                  <button className="plate-open-btn">Click to open</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        className="fallback-nav fallback-nav-prev"
        onClick={() => onPlateChange((activePlateIndex - 1 + plates.length) % plates.length)}
        aria-label="Previous plate"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        className="fallback-nav fallback-nav-next"
        onClick={() => onPlateChange((activePlateIndex + 1) % plates.length)}
        aria-label="Next plate"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Indicators */}
      <div className="fallback-indicators">
        {plates.map((plate, index) => (
          <button
            key={plate.id}
            className={`indicator ${index === activePlateIndex ? 'active' : ''}`}
            onClick={() => onPlateChange(index)}
            aria-label={`Go to ${plate.title}`}
            aria-current={index === activePlateIndex}
          />
        ))}
      </div>

      {/* Navigation hints */}
      <div className="fallback-hints">
        <p>Use arrow keys, numbers 1-6, or swipe to navigate • Press Enter to open</p>
      </div>

      {/* Property Panel */}
      {isPanelOpen && (
        <PropertyPanel
          plate={plates[activePlateIndex]}
          onClose={onClosePanel}
          reducedMotion={false}
        />
      )}
    </div>
  );
};

export default FallbackCarousel;
