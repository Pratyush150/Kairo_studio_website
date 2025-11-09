import { useEffect, useRef, useState } from 'react';

interface FPSData {
  current: number;
  average: number;
  isLowPerformance: boolean;
}

export function useFPSMonitor(): FPSData {
  const [fpsData, setFpsData] = useState<FPSData>({
    current: 60,
    average: 60,
    isLowPerformance: false,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const rafId = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);

        // Keep history of last 30 samples
        fpsHistory.current.push(fps);
        if (fpsHistory.current.length > 30) {
          fpsHistory.current.shift();
        }

        const average = Math.round(
          fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
        );

        // Consider low performance if average FPS < 40 for sustained period
        const isLowPerformance = fpsHistory.current.length >= 10 && average < 40;

        setFpsData({ current: fps, average, isLowPerformance });

        frameCount.current = 0;
        lastTime.current = now;
      }

      frameCount.current++;
      rafId.current = requestAnimationFrame(measureFPS);
    };

    rafId.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return fpsData;
}
