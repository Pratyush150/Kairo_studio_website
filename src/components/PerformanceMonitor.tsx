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
  targetFPS = 40, // Reduced from 45 to be less aggressive
  degradeThreshold = 5000, // Increased from 3000ms to 5000ms
  sampleSize = 90 // Increased from 60 to 90 for better averaging
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

  // Memory monitoring
  const logMemory = useRef(
    throttle(() => {
      const memory = getMemoryUsage();
      if (memory) {
        console.log(`[PerformanceMonitor] Memory: ${memory.used}MB / ${memory.total}MB`);

        // Warn if memory usage is high
        const usagePercent = (memory.used / memory.total) * 100;
        if (usagePercent > 80) {
          console.warn(`[PerformanceMonitor] High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }
    }, 10000) // Log every 10 seconds
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

        // Use ref to get current mode (avoid stale closure)
        const currentMode = performanceModeRef.current;

        // Degrade performance mode
        if (currentMode === 'high') {
          setPerformanceMode('medium');
          console.log('[PerformanceMonitor] Switched to medium performance mode');
        } else if (currentMode === 'medium') {
          setPerformanceMode('low');
          console.log('[PerformanceMonitor] Switched to low performance mode');
        }

        // Emit analytics event
        window.dispatchEvent(new CustomEvent('kairo:performance-degrade', {
          detail: { fps: avgFPS, timestamp: Date.now(), mode: currentMode }
        }));

        // Reset after delay to prevent rapid switching
        setTimeout(() => {
          lowFPSStartTime.current = null;
          hasDegrad.current = false;
        }, 5000); // Wait 5 seconds before allowing another degrade
      }
    } else {
      // Reset if FPS recovers
      lowFPSStartTime.current = null;
    }

    // Periodic memory logging
    logMemory.current();
  });

  return null;
}
