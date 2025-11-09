import { useEffect } from 'react';
import { CanvasShell } from './components/CanvasShell';
import { Preloader } from './components/Preloader';
import { SceneController } from './components/SceneController';
import { HUD } from './components/HUD';
import { PanelView } from './components/PanelView';
import { AudioManager } from './components/AudioManager';
import { useSceneStore } from './lib/sceneAPI';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useFPSMonitor } from './hooks/useFPSMonitor';

function App() {
  const { setReducedMotion, setPerformanceMode } = useSceneStore();
  const reducedMotion = useReducedMotion();
  const fpsData = useFPSMonitor();

  // Update reduced motion state
  useEffect(() => {
    setReducedMotion(reducedMotion);
  }, [reducedMotion, setReducedMotion]);

  // Dynamic performance adjustment
  useEffect(() => {
    if (fpsData.isLowPerformance) {
      console.log('Low performance detected, reducing quality...');
      setPerformanceMode('low');
    } else if (fpsData.average < 50) {
      setPerformanceMode('medium');
    } else {
      setPerformanceMode('high');
    }
  }, [fpsData.isLowPerformance, fpsData.average, setPerformanceMode]);

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
        <CanvasShell />

        {/* UI Overlays */}
        <Preloader />
        <HUD />
        <PanelView />

        {/* Audio System */}
        <AudioManager />
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
