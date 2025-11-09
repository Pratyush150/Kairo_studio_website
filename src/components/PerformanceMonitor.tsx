import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';

interface PerformanceMonitorProps {
  targetFPS?: number;
  degradeThreshold?: number;
  sampleSize?: number;
}

export function PerformanceMonitor({
  targetFPS = 45,
  degradeThreshold = 3000, // 3 seconds
  sampleSize = 60
}: PerformanceMonitorProps) {
  const { performanceMode, setPerformanceMode } = useSceneStore();

  const fpsHistory = useRef<number[]>([]);
  const lastTime = useRef(performance.now());
  const lowFPSStartTime = useRef<number | null>(null);
  const hasDegrad = useRef(false);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    const fps = 1000 / delta;

    lastTime.current = now;

    // Add to history
    fpsHistory.current.push(fps);
    if (fpsHistory.current.length > sampleSize) {
      fpsHistory.current.shift();
    }

    // Calculate average FPS
    const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;

    // Check if performance is consistently low
    if (avgFPS < targetFPS && fpsHistory.current.length >= sampleSize) {
      if (lowFPSStartTime.current === null) {
        lowFPSStartTime.current = now;
      }

      const lowFPSDuration = now - lowFPSStartTime.current;

      // Degrade if low FPS for more than threshold
      if (lowFPSDuration > degradeThreshold && !hasDegrad.current) {
        console.warn(`[PerformanceMonitor] Low FPS detected (avg: ${avgFPS.toFixed(1)}fps). Degrading performance mode.`);

        hasDegrad.current = true;

        // Degrade performance mode
        if (performanceMode === 'high') {
          setPerformanceMode('medium');
          console.log('[PerformanceMonitor] Switched to medium performance mode');
        } else if (performanceMode === 'medium') {
          setPerformanceMode('low');
          console.log('[PerformanceMonitor] Switched to low performance mode');
        }

        // Emit analytics event
        window.dispatchEvent(new CustomEvent('kairo:performance-degrade', {
          detail: { fps: avgFPS, timestamp: Date.now(), mode: performanceMode }
        }));

        // Reset
        lowFPSStartTime.current = null;
        hasDegrad.current = false;
      }
    } else {
      // Reset if FPS recovers
      lowFPSStartTime.current = null;
    }
  });

  return null;
}
