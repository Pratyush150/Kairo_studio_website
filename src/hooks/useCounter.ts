/**
 * useCounter Hook
 * Animated counter with IntersectionObserver for performance
 */

import { useEffect, useRef, useState } from 'react';

interface UseCounterOptions {
  end: number;
  start?: number;
  duration?: number; // ms
  delay?: number; // ms
  suffix?: string;
  prefix?: string;
  decimals?: number;
  easing?: (t: number) => number;
  threshold?: number; // IntersectionObserver threshold
}

export function useCounter({
  end,
  start = 0,
  duration = 800,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  easing = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // easeInOutCubic
  threshold = 0.5,
}: UseCounterOptions) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (hasStarted) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasStarted, threshold]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now() + delay;
    const range = end - start;

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easing(progress);
      const current = start + range * easedProgress;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [hasStarted, start, end, duration, delay, easing]);

  const formattedCount = `${prefix}${count.toFixed(decimals)}${suffix}`;

  return { count, formattedCount, ref: elementRef, hasStarted };
}
