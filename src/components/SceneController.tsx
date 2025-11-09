import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface SceneControllerProps {
  onLoadComplete?: () => void;
  children?: React.ReactNode;
}

export function SceneController({ onLoadComplete, children }: SceneControllerProps) {
  console.log('[SceneController] Component rendering');

  // Use Zustand selectors to only subscribe to actions (stable references, no re-renders)
  const setSceneState = useSceneStore((state) => state.setSceneState);
  const setLoadingProgress = useSceneStore((state) => state.setLoadingProgress);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate loading
  useEffect(() => {
    console.log('[SceneController] useEffect executing');

    // Prevent duplicate intervals if effect runs multiple times
    if (intervalRef.current) {
      console.log('[SceneController] Already loading, skipping...');
      return;
    }

    console.log('[SceneController] Starting loading sequence...');

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setLoadingProgress(100);
        console.log('[SceneController] Loading complete, triggering entry sequence');

        // Trigger entry sequence after brief pause
        setTimeout(() => {
          playEntrySequence();
        }, 300);
      } else {
        const currentProgress = Math.min(progress, 95);
        setLoadingProgress(currentProgress);
        console.log(`[SceneController] Loading progress: ${Math.round(currentProgress)}%`);
      }
    }, 100);

    return () => {
      console.log('[SceneController] Cleanup: clearing interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [setLoadingProgress]);

  const playEntrySequence = () => {
    console.log('[SceneController] Playing entry sequence (singularity → boom → idle)');

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('[SceneController] Entry sequence complete, setting state to idle');
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
          console.log('[SceneController] Phase 1: Singularity compression');
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
