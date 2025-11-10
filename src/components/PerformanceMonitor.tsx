import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import { getMemoryUsage, throttle } from '../lib/fpsOptimizations';

interface PerformanceMonitorProps {
  targetFPS?: number;
  degradeThreshold?: number;
  sampleSize?: number;
}

export function PerformanceMonitor({
  targetFPS = 45, // Per optimization guide: degrade if < 45 FPS for 3s
  degradeThreshold = 3000, // Per optimization guide: 3 seconds threshold
  sampleSize = 60 // Reduced from 180 to 60 for memory optimization (1 second at 60fps)
}: PerformanceMonitorProps) {
  // Use separate selectors to avoid re-renders from unrelated state changes
  const performanceMode = useSceneStore((state) => state.performanceMode);
  const setPerformanceMode = useSceneStore((state) => state.setPerformanceMode);

  const fpsHistory = useRef<number[]>([]);
  const lastTime = useRef(performance.now());
  const lowFPSStartTime = useRef<number | null>(null);
  const hasDegrad = useRef(false);
  const performanceModeRef = useRef(performanceMode);

  // Keep ref in sync with state
  performanceModeRef.current = performanceMode;

  // Memory monitoring - reduced frequency
  const logMemory = useRef(
    throttle(() => {
      const memory = getMemoryUsage();
      if (memory) {
        // Only log if usage is high to reduce console spam
        const usagePercent = (memory.used / memory.total) * 100;
        if (usagePercent > 85) {
          console.warn(`[PerformanceMonitor] High memory: ${memory.used}MB / ${memory.total}MB (${usagePercent.toFixed(1)}%)`);
        }
      }
    }, 15000) // Log every 15 seconds (reduced frequency)
  );

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

    // Check if performance is consistently low (per optimization guide)
    if (avgFPS < targetFPS && fpsHistory.current.length >= sampleSize) {
      if (lowFPSStartTime.current === null) {
        lowFPSStartTime.current = now;
      }

      const lowFPSDuration = now - lowFPSStartTime.current;

      // Degrade if low FPS for more than threshold (3 seconds per guide)
      if (lowFPSDuration > degradeThreshold && !hasDegrad.current) {
        console.warn(`[PerformanceMonitor] Low FPS detected (avg: ${avgFPS.toFixed(1)}fps < ${targetFPS}fps for ${(lowFPSDuration/1000).toFixed(1)}s). Auto-degrading.`);

        hasDegrad.current = true;

        // Use ref to get current mode (avoid stale closure)
        const currentMode = performanceModeRef.current;

        // Step-wise degrade per optimization guide
        // step1: high → medium (reduce bloom, lower render resolution)
        // step2: medium → low (reduce particles, disable heavy effects)
        if (currentMode === 'high') {
          setPerformanceMode('medium');
          console.log('[PerformanceMonitor] Step 1: high → medium (reduced bloom, lower DPR)');
        } else if (currentMode === 'medium') {
          setPerformanceMode('low');
          console.log('[PerformanceMonitor] Step 2: medium → low (minimal particles, no post-processing)');
        } else {
          console.warn('[PerformanceMonitor] Already at lowest performance mode. Cannot degrade further.');
        }

        // Emit analytics event
        window.dispatchEvent(new CustomEvent('kairo:performance-degrade', {
          detail: {
            fps: avgFPS,
            timestamp: Date.now(),
            fromMode: currentMode,
            toMode: currentMode === 'high' ? 'medium' : 'low',
            duration: lowFPSDuration
          }
        }));

        // Reset after delay to prevent rapid switching (but shorter for responsiveness)
        setTimeout(() => {
          lowFPSStartTime.current = null;
          hasDegrad.current = false;
        }, 3000); // Wait 3 seconds before allowing another degrade
      }
    } else {
      // Reset if FPS recovers
      if (lowFPSStartTime.current !== null) {
        console.log(`[PerformanceMonitor] FPS recovered to ${avgFPS.toFixed(1)}fps`);
      }
      lowFPSStartTime.current = null;
    }

    // Periodic memory logging
    logMemory.current();
  });

  return null;
}
