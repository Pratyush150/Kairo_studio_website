/**
 * Post-processing Effects
 * Bloom and FXAA with FPS-based degradation
 */

import { useState, useEffect } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSceneStore } from '../lib/sceneAPI';
import { useFPSMonitor } from '../hooks/useFPSMonitor';

export function Effects() {
  const performanceMode = useSceneStore((s) => s.performanceMode);
  const [enabledEffects, setEnabledEffects] = useState(true);

  // Monitor FPS and disable effects if needed
  const fpsData = useFPSMonitor((fps) => {
    if (fps < 45 && enabledEffects) {
      console.log('[Effects] Disabling post-processing due to low FPS');
      setEnabledEffects(false);
    }
  });

  // Re-enable effects if FPS improves and stays good
  useEffect(() => {
    if (fpsData.average > 50 && !enabledEffects) {
      const timer = setTimeout(() => {
        console.log('[Effects] Re-enabling post-processing');
        setEnabledEffects(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [fpsData.average, enabledEffects]);

  // Disable effects on low performance mode
  if (performanceMode === 'low' || !enabledEffects) {
    return null;
  }

  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
