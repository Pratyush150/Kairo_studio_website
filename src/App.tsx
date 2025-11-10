/**
 * Morphing Canvas — Main App
 * Kairo Studio Homepage
 */

import { useEffect } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { Preloader } from './components/Preloader';
import { HUD } from './components/HUD';
import { PanelView } from './components/PanelView';
import { MobileFallback } from './components/MobileFallback';
import { GestureHandler } from './components/GestureHandler';
import { AudioSystem } from './components/AudioSystem';
import { useSceneStore, sceneAPI, getSlugIndex } from './lib/sceneAPI';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useFPSMonitor } from './hooks/useFPSMonitor';
import { useResponsive } from './hooks/useResponsive';
import './styles/globals.css';

function App() {
  const { sceneState, setSceneState, setReducedMotion: setStoreReducedMotion, setPerformanceMode } = useSceneStore();
  const reducedMotion = useReducedMotion();
  const { isMobile, deviceMemory } = useResponsive();

  // Determine if we should use mobile fallback
  const useMobileFallback = isMobile && (deviceMemory === undefined || deviceMemory < 3);

  // Update reduced motion setting
  useEffect(() => {
    setStoreReducedMotion(reducedMotion);
  }, [reducedMotion, setStoreReducedMotion]);

  // Set initial performance mode based on device
  useEffect(() => {
    if (isMobile) {
      setPerformanceMode('low');
    } else if (deviceMemory && deviceMemory < 4) {
      setPerformanceMode('medium');
    } else {
      setPerformanceMode('high');
    }
  }, [isMobile, deviceMemory, setPerformanceMode]);

  // FPS monitoring with degradation
  const fpsData = useFPSMonitor((fps) => {
    if (fps < 45) {
      console.log(`[App] Low FPS detected (${fps}), degrading performance`);
      const current = useSceneStore.getState().performanceMode;
      if (current === 'high') {
        setPerformanceMode('medium');
      } else if (current === 'medium') {
        setPerformanceMode('low');
      }
    }
  });

  // Simulate loading completion
  useEffect(() => {
    if (sceneState === 'loading') {
      const timer = setTimeout(() => {
        // Set to ELEMENT_ACTIVE (first element ready to interact)
        setSceneState('ELEMENT_ACTIVE');

        // Check URL hash on load and navigate if specified
        if (typeof window !== 'undefined' && window.location.hash) {
          const slug = window.location.hash.replace('#', '');
          console.log('[App] Initial URL hash detected:', slug);

          // Wait for scene to be ready, then navigate to index
          setTimeout(() => {
            const index = getSlugIndex(slug);
            if (index >= 0) {
              sceneAPI.goToIndex(index);
            }
          }, 500);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [sceneState, setSceneState]);

  // ESC key handled by GestureHandler component

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');

      if (hash) {
        // Navigate to index
        const index = getSlugIndex(hash);
        if (index >= 0) {
          sceneAPI.goToIndex(index);
        }
      } else {
        // Close panel if open
        const state = useSceneStore.getState();
        if (state.panelOpen) {
          sceneAPI.closeContent();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render mobile fallback if needed
  if (useMobileFallback) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <MobileFallback />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Preloader */}
      {sceneState === 'loading' && <Preloader />}

      {/* 3D Canvas */}
      <CanvasShell />

      {/* Gesture Handler (drag/swipe/keyboard navigation) */}
      <GestureHandler />

      {/* Audio System (procedural sounds) */}
      <AudioSystem />

      {/* UI Overlays */}
      <HUD />
      <PanelView />

      {/* Accessibility announcement region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        id="a11y-announcer"
      />

      {/* FPS debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '8px 12px',
              fontSize: '12px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              zIndex: 9999,
            }}
          >
            FPS: {fpsData.current} | Avg: {fpsData.average}
          </div>

          {/* TEST PANEL BUTTON */}
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <button
              onClick={() => {
                console.log('[TEST] Opening about panel');
                useSceneStore.getState().openPanel('about');
              }}
              style={{
                background: '#A854FF',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'system-ui',
              }}
            >
              TEST: Open About Panel
            </button>
            <button
              onClick={() => {
                console.log('[TEST] Current state:', useSceneStore.getState());
              }}
              style={{
                background: '#00E5FF',
                color: 'black',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'system-ui',
              }}
            >
              LOG STATE
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
