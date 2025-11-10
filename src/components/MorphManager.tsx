/**
 * Morph Manager
 * Manages active morph shape and handles interactions
 */

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import { Origin } from './morphs/Origin';
import { Flow } from './morphs/Flow';
import { Network } from './morphs/Network';
import { Portal } from './morphs/Portal';
import { interaction } from '../lib/tokens';
import type { MorphRef } from './morphs/Origin';

export function MorphManager() {
  const activeMorph = useSceneStore((s) => s.activeMorph);
  const hoveredMorph = useSceneStore((s) => s.hoveredMorph);
  const setHoveredMorph = useSceneStore((s) => s.setHoveredMorph);
  const sceneState = useSceneStore((s) => s.sceneState);

  const originRef = useRef<MorphRef>(null);
  const flowRef = useRef<MorphRef>(null);
  const networkRef = useRef<MorphRef>(null);
  const portalRef = useRef<MorphRef>(null);

  const { camera, size } = useThree();

  // Map morph types to refs
  const morphRefs = {
    origin: originRef,
    flow: flowRef,
    network: networkRef,
    portal: portalRef,
  };

  // Trigger appear animation on morph change
  useEffect(() => {
    const ref = morphRefs[activeMorph];
    if (ref.current && sceneState === 'idle') {
      ref.current.appear();
    }
  }, [activeMorph, sceneState]);

  // Trigger zoom animation when entering panel
  useEffect(() => {
    if (sceneState === 'panel') {
      const ref = morphRefs[activeMorph];
      if (ref.current) {
        ref.current.enterZoom();
      }
    }
  }, [sceneState, activeMorph]);

  // Hover pulse on hovered morph
  useEffect(() => {
    if (hoveredMorph) {
      const ref = morphRefs[hoveredMorph];
      if (ref.current) {
        ref.current.hoverPulse(interaction.hoverPulse);
      }
    }
  }, [hoveredMorph]);

  // Raycasting for hover detection
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Simple proximity detection based on screen position
      // In a production app, you'd use raycasting here
      // For now, we'll trigger hover when near center of screen

      const centerX = size.width / 2;
      const centerY = size.height / 2;
      const dist = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      if (dist < interaction.hoverDistance && sceneState === 'idle') {
        setHoveredMorph(activeMorph);
      } else {
        setHoveredMorph(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [activeMorph, sceneState, size, setHoveredMorph]);

  // Only render active morph for performance
  return (
    <group>
      {activeMorph === 'origin' && <Origin ref={originRef} />}
      {activeMorph === 'flow' && <Flow ref={flowRef} />}
      {activeMorph === 'network' && <Network ref={networkRef} />}
      {activeMorph === 'portal' && <Portal ref={portalRef} />}
    </group>
  );
}
