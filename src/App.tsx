import { useEffect, useState } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { Preloader } from './components/Preloader';
import { SceneController } from './components/SceneController';
import { HUD } from './components/HUD';
import { PanelView } from './components/PanelView';
import { AudioManager } from './components/AudioManager';
import { SignatureMoment } from './components/SignatureMoment';
import { MobileFallback } from './components/MobileFallback';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { useSceneStore } from './lib/sceneAPI';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useFPSMonitor } from './hooks/useFPSMonitor';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { detectDevice, getRecommendedPerformanceMode, shouldUseMobileFallback } from './utils/detectDevice';

function App() {
  const { setReducedMotion, setPerformanceMode, loadEntitiesFromCMS } = useSceneStore();
  const reducedMotion = useReducedMotion();
  const fpsData = useFPSMonitor();
  const keyboardNav = useKeyboardNavigation();
  const [useMobileFallback, setUseMobileFallback] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof detectDevice> | null>(null);

  // Load entities from CMS on mount
  useEffect(() => {
    loadEntitiesFromCMS();
  }, [loadEntitiesFromCMS]);

  // Device detection on mount
  useEffect(() => {
    const info = detectDevice();
    setDeviceInfo(info);

    // Comprehensive device logging per optimization guide
    console.group('[App] Device Detection');
    console.log('Platform:', info.platform);
    console.log('Device Type:', info.isMobile ? 'Mobile' : info.isTablet ? 'Tablet' : 'Desktop');
    console.log('CPU Cores:', info.cores);
    console.log('Memory (GB):', info.memory || 'Unknown');
    console.log('WebGL:', info.hasWebGL ? '✓' : '✗');
    console.log('WebGL2:', info.hasWebGL2 ? '✓' : '✗');
    console.log('Touch:', info.hasTouch ? '✓' : '✗');
    console.log('Low Power Mode:', info.isLowPowerMode ? '✓' : '✗');
    console.log('Device Category:', info.isHighEnd ? 'High-End' : info.isLowEnd ? 'Low-End' : 'Mid-Range');
    console.groupEnd();

    // Set mobile fallback
    const shouldFallback = shouldUseMobileFallback(info);
    setUseMobileFallback(shouldFallback);

    // Set recommended performance mode ONCE on mount
    const recommendedMode = getRecommendedPerformanceMode(info);
    setPerformanceMode(recommendedMode);

    console.log(`[App] Initial performance mode: ${recommendedMode} | Mobile fallback: ${shouldFallback ? 'YES' : 'NO'}`);

    // Warn if low-end device
    if (info.isLowEnd) {
      console.warn('[App] Low-end device detected. Auto-switched to LOW performance mode.');
      if (info.cores <= 4) console.warn('  → Reason: CPU cores <= 4');
      if (info.memory && info.memory < 4) console.warn('  → Reason: RAM < 4GB');
      if (!info.hasWebGL2) console.warn('  → Reason: No WebGL2 support');
      if (info.isLowPowerMode) console.warn('  → Reason: Battery saver enabled');
    }
  }, [setPerformanceMode]);

  // Update reduced motion state
  useEffect(() => {
    setReducedMotion(reducedMotion);
  }, [reducedMotion, setReducedMotion]);

  // Dynamic performance adjustment - DISABLED to prevent conflicts
  // PerformanceMonitor component handles dynamic degradation instead
  // useEffect(() => {
  //   if (fpsData.isLowPerformance) {
  //     console.log('Low performance detected, reducing quality...');
  //     setPerformanceMode('low');
  //   } else if (fpsData.average < 50) {
  //     setPerformanceMode('medium');
  //   } else {
  //     setPerformanceMode('high');
  //   }
  // }, [fpsData.isLowPerformance, fpsData.average, setPerformanceMode]);

  // Set up global event listeners
  useEffect(() => {
    // ESC key to close panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const { sceneState, closePanel } = useSceneStore.getState();
        if (sceneState === 'panel') {
          closePanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Render mobile fallback if needed
  if (useMobileFallback) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MobileFallback />
        <AnalyticsTracker />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SceneController>
        {/* 3D Canvas */}
        <CanvasShell focusedEntityId={keyboardNav.focusedEntityId} />

        {/* UI Overlays */}
        <Preloader />
        <HUD />
        <PanelView />

        {/* Audio System */}
        <AudioManager />

        {/* Signature Moment */}
        <SignatureMoment />

        {/* Analytics */}
        <AnalyticsTracker />
      </SceneController>

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
    </div>
  );
}

export default App;
