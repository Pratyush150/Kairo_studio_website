/**
 * Morph Manager
 * SINGLE ELEMENT MODE - Only active element visible at origin
 * Others hidden/offscreen
 *
 * User clicks active element to open content (not to navigate)
 * Navigation via drag/swipe/keyboard
 */

import { useRef, useEffect } from 'react';
import { useSceneStore, sceneAPI, ELEMENT_ORDER } from '../lib/sceneAPI';
import type { MorphRef } from './morphs/Origin';
import { Origin } from './morphs/Origin';
import { Flow } from './morphs/Flow';
import { Network } from './morphs/Network';
import { Portal } from './morphs/Portal';
import type { MorphType } from '../lib/tokens';

export function MorphManager() {
  const activeElement = useSceneStore((s) => s.activeElement);
  const sceneState = useSceneStore((s) => s.sceneState);
  const panelOpen = useSceneStore((s) => s.panelOpen);

  const originRef = useRef<MorphRef>(null);
  const flowRef = useRef<MorphRef>(null);
  const networkRef = useRef<MorphRef>(null);
  const portalRef = useRef<MorphRef>(null);

  // Map morph types to refs
  const getRef = (morphType: MorphType) => {
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

  // Handle element click - Opens content (NOT navigation)
  const handleElementClick = () => {
    if (sceneState !== 'ELEMENT_ACTIVE') {
      console.log('[MorphManager] Click ignored - not in ELEMENT_ACTIVE state');
      return;
    }

    console.log('[MorphManager] Element clicked - opening content');
    sceneAPI.openActiveElement();
  };

  // Listen for spawn-element event (from star burst timeline)
  useEffect(() => {
    const handleSpawnElement = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { element } = customEvent.detail;

      console.log('[MorphManager] Spawning element:', element);

      const ref = getRef(element);
      if (ref.current) {
        // Trigger appear animation
        ref.current.appear();
      }
    };

    window.addEventListener('kairo:spawn-element', handleSpawnElement);
    return () => window.removeEventListener('kairo:spawn-element', handleSpawnElement);
  }, []);

  // Listen for element animation events (from open timeline)
  useEffect(() => {
    const handleElementAnimate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, scale, emissiveIntensity, duration, ease } = customEvent.detail;

      const ref = getRef(activeElement);
      if (!ref.current) return;

      const groupRef = (ref.current as any).groupRef?.current;
      const meshRef = (ref.current as any).meshRef?.current;

      if (!groupRef) return;

      const gsap = (window as any).gsap;
      if (!gsap) return;

      if (type === 'slap-compress') {
        gsap.to(groupRef.scale, {
          x: scale.x,
          y: scale.y,
          z: scale.z,
          duration,
          ease,
        });
      } else if (type === 'slap-expand') {
        gsap.to(groupRef.scale, {
          x: scale.x,
          y: scale.y,
          z: scale.z,
          duration,
          ease,
        });
      } else if (type === 'compression') {
        gsap.to(groupRef.scale, {
          x: scale.x,
          y: scale.y,
          z: scale.z,
          duration,
          ease,
        });

        if (meshRef?.material && emissiveIntensity) {
          const material = meshRef.material;
          if ('emissiveIntensity' in material) {
            gsap.to(material, {
              emissiveIntensity,
              duration,
              ease,
            });
          }
        }
      } else if (type === 'supernova-burst') {
        // Trigger existing supernova burst
        if (ref.current.supernovaBurst) {
          ref.current.supernovaBurst();
        }
      }
    };

    window.addEventListener('kairo:element-animate', handleElementAnimate);
    return () => window.removeEventListener('kairo:element-animate', handleElementAnimate);
  }, [activeElement]);

  // Show element during: ELEMENT_ACTIVE, STAR_BURST, OPENING_CONTENT
  // Hide during: TRANSITING, CONTENT_OPEN, CLOSING_CONTENT
  const showElement =
    sceneState === 'ELEMENT_ACTIVE' ||
    sceneState === 'STAR_BURST' ||
    sceneState === 'OPENING_CONTENT';

  return (
    <group visible={showElement}>
      {/* Origin - only visible when active */}
      {(activeElement === 'origin' || activeElement === 'services' || activeElement === 'strategy') && (
        <group position={[0, 0, 0]}>
          <Origin ref={originRef} onClick={handleElementClick} />
        </group>
      )}

      {/* Flow (Work) - only visible when active */}
      {(activeElement === 'work' || activeElement === 'demos') && (
        <group position={[0, 0, 0]}>
          <Flow ref={flowRef} onClick={handleElementClick} />
        </group>
      )}

      {/* Network - only visible when active */}
      {activeElement === 'network' && (
        <group position={[0, 0, 0]}>
          <Network ref={networkRef} onClick={handleElementClick} />
        </group>
      )}

      {/* Portal - only visible when active */}
      {(activeElement === 'portal' || activeElement === 'reviews') && (
        <group position={[0, 0, 0]}>
          <Portal ref={portalRef} onClick={handleElementClick} />
        </group>
      )}
    </group>
  );
}
