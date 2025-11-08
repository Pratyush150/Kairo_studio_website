import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import PropertyPanel from './PropertyPanel';
import LoadingScreen from './LoadingScreen';
import FallbackCarousel from './FallbackCarousel';
import { useCarouselAPI } from '../../hooks/useCarouselAPI';
import { useAnalytics } from '../../hooks/useAnalytics';
import './PlateCarousel.css';

const PlateCarousel = ({ plates, onPlateChange }) => {
  const [activePlateIndex, setActivePlateIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef(null);
  const analytics = useAnalytics();

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
      console.warn('WebGL not supported, falling back to 2D carousel');
    }

    // Check URL param for forced fallback
    const params = new URLSearchParams(window.location.search);
    if (params.get('no3d') === '1') {
      setWebGLSupported(false);
    }
  }, []);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPanelOpen) {
        if (e.key === 'Escape') {
          closePanel();
        }
        return; // Block other keys when panel is open
      }

      switch(e.key) {
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case 'Enter':
          openPanel(activePlateIndex);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const index = parseInt(e.key) - 1;
          if (index < plates.length) {
            goToPlate(index);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlateIndex, isPanelOpen, plates.length]);

  // Update URL hash when plate changes
  useEffect(() => {
    if (plates[activePlateIndex]) {
      const slug = plates[activePlateIndex].slug;
      window.history.pushState(null, '', `#${slug}`);
      onPlateChange?.(activePlateIndex, plates[activePlateIndex]);

      // Analytics
      analytics.trackEvent('plate_change', {
        plate_index: activePlateIndex,
        plate_slug: slug
      });
    }
  }, [activePlateIndex, plates, onPlateChange]);

  const goToPlate = (index) => {
    if (index >= 0 && index < plates.length && !isPanelOpen) {
      setActivePlateIndex(index);
    }
  };

  const navigateNext = () => {
    goToPlate((activePlateIndex + 1) % plates.length);
  };

  const navigatePrev = () => {
    goToPlate((activePlateIndex - 1 + plates.length) % plates.length);
  };

  const openPanel = (index) => {
    setIsPanelOpen(true);
    analytics.trackEvent('panel_open', {
      plate_index: index,
      plate_slug: plates[index]?.slug
    });
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    analytics.trackEvent('panel_close', {
      plate_index: activePlateIndex,
      plate_slug: plates[activePlateIndex]?.slug
    });
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  // Expose carousel API
  const carouselAPI = useCarouselAPI({
    goTo: goToPlate,
    next: navigateNext,
    prev: navigatePrev,
    openPanel,
    closePanel,
    currentIndex: activePlateIndex,
    isPanelOpen
  });

  // Add API to window for external access
  useEffect(() => {
    window.carouselAPI = carouselAPI;
    return () => {
      delete window.carouselAPI;
    };
  }, [carouselAPI]);

  if (!webGLSupported) {
    return (
      <FallbackCarousel
        plates={plates}
        activePlateIndex={activePlateIndex}
        onPlateChange={goToPlate}
        onPlateClick={openPanel}
        isPanelOpen={isPanelOpen}
        onClosePanel={closePanel}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`plate-carousel ${reducedMotion ? 'reduced-motion' : ''}`}
      role="region"
      aria-label="Interactive 3D plate carousel"
    >
      {isLoading && <LoadingScreen />}

      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            plates={plates}
            activePlateIndex={activePlateIndex}
            onPlateChange={goToPlate}
            onPlateClick={openPanel}
            isPanelOpen={isPanelOpen}
            reducedMotion={reducedMotion}
            onLoadComplete={handleLoadComplete}
          />
        </Suspense>
      </Canvas>

      {isPanelOpen && (
        <PropertyPanel
          plate={plates[activePlateIndex]}
          onClose={closePanel}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Accessibility: Hidden content for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {plates[activePlateIndex] && (
          <span>
            Currently viewing {plates[activePlateIndex].title}: {plates[activePlateIndex].short}
          </span>
        )}
      </div>

      {/* Navigation hints */}
      {!isPanelOpen && (
        <div className="navigation-hints" aria-hidden="true">
          <p>Use arrow keys, numbers 1-6, or hover to navigate • Press Enter to open • ESC to close</p>
        </div>
      )}
    </div>
  );
};

export default PlateCarousel;
