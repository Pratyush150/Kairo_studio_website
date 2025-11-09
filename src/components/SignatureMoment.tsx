import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';
import './SignatureMoment.css';

interface SignatureMomentProps {
  idleTimeout?: number; // milliseconds
  momentDuration?: number; // milliseconds
}

export function SignatureMoment({
  idleTimeout = 60000, // 60 seconds
  momentDuration = 10000 // 10 seconds
}: SignatureMomentProps) {
  const { sceneState } = useSceneStore();
  const [isActive, setIsActive] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const momentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Reset idle timer
  const resetIdleTimer = () => {
    lastActivityRef.current = Date.now();

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Only start timer if in idle state
    if (sceneState === 'idle' && !isActive) {
      idleTimerRef.current = setTimeout(() => {
        triggerSignatureMoment();
      }, idleTimeout);
    }
  };

  // Trigger the signature moment
  const triggerSignatureMoment = () => {
    console.log('[SignatureMoment] Activating signature moment!');
    setIsActive(true);

    // Dispatch event to animate entities
    window.dispatchEvent(
      new CustomEvent('kairo:signature-moment', {
        detail: { active: true },
      })
    );

    // Play special sound if audio system is available
    window.dispatchEvent(
      new CustomEvent('kairo:play-sound', {
        detail: { type: 'boom' },
      })
    );

    // End the moment after duration
    momentTimerRef.current = setTimeout(() => {
      endSignatureMoment();
    }, momentDuration);
  };

  // End the signature moment
  const endSignatureMoment = () => {
    console.log('[SignatureMoment] Ending signature moment');
    setIsActive(false);

    // Dispatch event to return entities to normal
    window.dispatchEvent(
      new CustomEvent('kairo:signature-moment', {
        detail: { active: false },
      })
    );

    // Reset idle timer
    resetIdleTimer();
  };

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      // End signature moment if active
      if (isActive) {
        endSignatureMoment();
      } else {
        resetIdleTimer();
      }
    };

    // Track various user interactions
    window.addEventListener('pointermove', handleActivity);
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('wheel', handleActivity);
    window.addEventListener('keydown', handleActivity);

    // Start initial timer
    resetIdleTimer();

    return () => {
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
      window.removeEventListener('keydown', handleActivity);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (momentTimerRef.current) clearTimeout(momentTimerRef.current);
    };
  }, [sceneState, isActive]);

  // Reset timer when scene state changes
  useEffect(() => {
    if (sceneState !== 'idle') {
      // Clear timers if not in idle state
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (isActive) {
        endSignatureMoment();
      }
    } else {
      resetIdleTimer();
    }
  }, [sceneState]);

  if (!isActive) return null;

  return (
    <div className="signature-moment">
      <div className="signature-content">
        <h1 className="signature-title">Kairoverse</h1>
        <p className="signature-tagline">Where Strategy Becomes a Living Idea</p>
      </div>
    </div>
  );
}
