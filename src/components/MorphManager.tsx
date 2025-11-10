/**
 * Morph Manager
 * Manages active morph shape and handles interactions
 */

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useSceneStore, sceneAPI } from '../lib/sceneAPI';
import { Origin } from './morphs/Origin';
import { Flow } from './morphs/Flow';
import { Network } from './morphs/Network';
import { Portal } from './morphs/Portal';
import { interaction, morphs } from '../lib/tokens';
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

  // Map morph types to their corresponding refs (many-to-one mapping)
  const getRef = (morphType: typeof activeMorph) => {
    switch (morphType) {
      case 'origin':
      case 'services':
      case 'strategy':
        return originRef;
      case 'work':
      case 'demos':
        return flowRef;
      case 'network':
        return networkRef;
      case 'portal':
      case 'reviews':
        return portalRef;
      default:
        return originRef;
    }
  };

  // Trigger appear animation on morph change
  useEffect(() => {
    const ref = getRef(activeMorph);
    if (ref.current && sceneState === 'idle') {
      ref.current.appear();
    }
  }, [activeMorph, sceneState]);

  // Trigger zoom animation when entering panel
  useEffect(() => {
    if (sceneState === 'panel') {
      const ref = getRef(activeMorph);
      if (ref.current) {
        ref.current.enterZoom();
      }
    }
  }, [sceneState, activeMorph]);

  // Hover pulse on hovered morph
  useEffect(() => {
    if (hoveredMorph) {
      const ref = getRef(hoveredMorph);
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

  // Listen for supernova burst event
  useEffect(() => {
    const handleSupernovaBurst = () => {
      console.log('[MorphManager] Supernova burst event received');
      const ref = getRef(activeMorph);
      if (ref.current) {
        console.log('[MorphManager] Triggering burst on', activeMorph);
        ref.current.supernovaBurst();
      }
    };

    window.addEventListener('kairo:supernova-burst', handleSupernovaBurst);
    return () => window.removeEventListener('kairo:supernova-burst', handleSupernovaBurst);
  }, [activeMorph]);

  // Map morph types to their corresponding shapes
  // We have 8 panel types but only 4 physical shapes
  const getMorphShape = () => {
    switch (activeMorph) {
      case 'origin':
      case 'services':
      case 'strategy':
        return <Origin ref={originRef} onClick={() => sceneAPI.openPanel(morphs[activeMorph].slug)} />;

      case 'work':
      case 'demos':
        return <Flow ref={flowRef} onClick={() => sceneAPI.openPanel(morphs[activeMorph].slug)} />;

      case 'network':
        return <Network ref={networkRef} onClick={() => sceneAPI.openPanel(morphs[activeMorph].slug)} />;

      case 'portal':
      case 'reviews':
        return <Portal ref={portalRef} onClick={() => sceneAPI.openPanel(morphs[activeMorph].slug)} />;

      default:
        return <Origin ref={originRef} onClick={() => sceneAPI.openPanel(morphs.origin.slug)} />;
    }
  };

  // Only render active morph for performance
  return <group>{getMorphShape()}</group>;
}
