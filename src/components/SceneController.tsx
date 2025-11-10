import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface SceneControllerProps {
  onLoadComplete?: () => void;
  children?: React.ReactNode;
}

export function SceneController({ onLoadComplete, children }: SceneControllerProps) {
  console.log('[SceneController] Component rendering');

  // Use Zustand selectors to subscribe to state
  const setSceneState = useSceneStore((state) => state.setSceneState);
  const setLoadingProgress = useSceneStore((state) => state.setLoadingProgress);
  const sceneState = useSceneStore((state) => state.sceneState);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: Log scene state changes
  useEffect(() => {
    console.log(`[SceneController] Scene state changed to: ${sceneState}`);
  }, [sceneState]);

  // Simulate loading
  useEffect(() => {
    console.log('[SceneController] useEffect executing');

    // Prevent duplicate intervals if effect runs multiple times
    if (intervalRef.current) {
      console.log('[SceneController] Already loading, skipping...');
      return;
    }

    console.log('[SceneController] Starting loading sequence...');

    // Safety timeout - force idle state after 5 seconds if something goes wrong
    // Only set if not already set to prevent duplicates in strict mode
    if (!safetyTimeoutRef.current) {
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn('[SceneController] Safety timeout triggered! Forcing idle state...');
        const currentState = useSceneStore.getState().sceneState;
        if (currentState !== 'idle') {
          console.error(`[SceneController] Scene was stuck in '${currentState}' state`);
          setSceneState('idle');
          setLoadingProgress(100);
          if (onLoadComplete) {
            onLoadComplete();
          }
        }
        safetyTimeoutRef.current = null;
      }, 5000);
    }

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
      console.log('[SceneController] Cleanup: clearing interval and safety timeout');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [setLoadingProgress, setSceneState, onLoadComplete]);

  const playEntrySequence = () => {
    console.log('[SceneController] Playing entry sequence (singularity → boom → idle)');

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('[SceneController] Entry sequence complete, setting state to idle');
        setSceneState('idle');

        // Clear safety timeout since we completed successfully
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }

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
