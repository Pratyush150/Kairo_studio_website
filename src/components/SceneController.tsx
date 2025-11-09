import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface SceneControllerProps {
  onLoadComplete?: () => void;
  children?: React.ReactNode;
}

export function SceneController({ onLoadComplete, children }: SceneControllerProps) {
  const { setSceneState, setLoadingProgress } = useSceneStore();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasInitialized = useRef(false);

  // Simulate loading
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLoadingProgress(100);

        // Trigger entry sequence after brief pause
        setTimeout(() => {
          playEntrySequence();
        }, 300);
      } else {
        setLoadingProgress(Math.min(progress, 95));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const playEntrySequence = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setSceneState('idle');
        if (onLoadComplete) {
          onLoadComplete();
        }
      },
    });

    timelineRef.current = tl;

    // Phase 1: Singularity compression (T0 → T400)
    tl.to(
      {},
      {
        duration: 0.3,
        onStart: () => {
          setSceneState('singularity');
          // Trigger logo pulse
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('kairo:logo-pulse', { detail: { intensity: 1.8 } }));
          }
        },
      }
    );

    // Phase 2: Particle compression
    tl.to(
      {},
      {
        duration: 0.5,
        onStart: () => {
          window.dispatchEvent(new CustomEvent('kairo:particles-compress'));
        },
      },
      '-=0.2'
    );

    // Phase 3: The Boom (T400 → T1200)
    tl.to(
      {},
      {
        duration: 0.72,
        onStart: () => {
          setSceneState('boom');
          window.dispatchEvent(new CustomEvent('kairo:logo-explode'));
          window.dispatchEvent(new CustomEvent('kairo:camera-rush'));
          window.dispatchEvent(new CustomEvent('kairo:postprocess-peak'));
        },
      }
    );

    // Phase 4: Entities spawn with stagger
    tl.to(
      {},
      {
        duration: 0.5,
        onStart: () => {
          window.dispatchEvent(new CustomEvent('kairo:spawn-entities'));
        },
      }
    );
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return <>{children}</>;
}
