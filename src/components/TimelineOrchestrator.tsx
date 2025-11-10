/**
 * Timeline Orchestrator
 * Wires timeline system to Three.js scene
 * Listens for events and triggers appropriate timelines
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { timelineManager } from '../lib/timelines';

export function TimelineOrchestrator() {
  const { camera, scene } = useThree();

  // Set timeline context
  useEffect(() => {
    timelineManager.setContext({
      camera,
      scene,
      postprocess: {
        chromatic: { amount: 0 }, // Placeholder - will be wired to actual postprocessing
      },
    });
  }, [camera, scene]);

  // Listen for transit-start event
  useEffect(() => {
    const handleTransitStart = () => {
      console.log('[TimelineOrchestrator] Transit start - playing transit timeline');
      timelineManager.playTransit();
    };

    window.addEventListener('kairo:transit-start', handleTransitStart);
    return () => window.removeEventListener('kairo:transit-start', handleTransitStart);
  }, []);

  // Listen for element-opening event
  useEffect(() => {
    const handleElementOpening = () => {
      console.log('[TimelineOrchestrator] Element opening - playing open timeline');
      timelineManager.playOpen();
    };

    window.addEventListener('kairo:element-opening', handleElementOpening);
    return () => window.removeEventListener('kairo:element-opening', handleElementOpening);
  }, []);

  // Listen for content-closing event
  useEffect(() => {
    const handleContentClosing = () => {
      console.log('[TimelineOrchestrator] Content closing - playing close timeline');
      timelineManager.playClose();
    };

    window.addEventListener('kairo:content-closing', handleContentClosing);
    return () => window.removeEventListener('kairo:content-closing', handleContentClosing);
  }, []);

  // This component doesn't render anything
  return null;
}
