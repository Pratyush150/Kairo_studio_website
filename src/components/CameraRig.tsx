/**
 * Camera Rig
 * Handles camera movement, parallax, and transitions
 */

import { useRef, useEffect, ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { interaction } from '../lib/tokens';
import * as THREE from 'three';
import gsap from 'gsap';

interface CameraRigProps {
  children: ReactNode;
}

export function CameraRig({ children }: CameraRigProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const sceneState = useSceneStore((s) => s.sceneState);
  const reducedMotion = useReducedMotion();

  // Mouse/touch parallax effect
  useEffect(() => {
    if (reducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Normalize to -1 to 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion]);

  // Smooth camera rotation with lerp (only in ELEMENT_ACTIVE state)
  useFrame(() => {
    if (!groupRef.current || reducedMotion || sceneState !== 'ELEMENT_ACTIVE') return;

    // Lerp target towards mouse position
    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * interaction.cameraLerp;
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * interaction.cameraLerp;

    // Apply subtle rotation to group for parallax effect
    groupRef.current.rotation.y = targetRef.current.x * 0.05;
    groupRef.current.rotation.x = targetRef.current.y * 0.03;
  });

  // Camera transitions based on scene state
  // NOTE: TRANSITING and STAR_BURST states are handled by timelines.ts, NOT here!
  // Only handle ELEMENT_ACTIVE, CONTENT_OPEN, and CLOSING_CONTENT states
  useEffect(() => {
    // ELEMENT_ACTIVE: Default viewing position
    if (sceneState === 'ELEMENT_ACTIVE') {
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 180,
        duration: 1.0,
        ease: 'power3.out',
      });
    }
    // CONTENT_OPEN: Zoom in for panel view (handled by open timeline camera movement)
    // CLOSING_CONTENT: Return to element view (handled by close timeline)
    // TRANSITING: Handled by transit timeline (motion path through tunnel)
    // STAR_BURST: Handled by star burst timeline
  }, [sceneState, camera]);

  // Element opening camera shake + burst dolly
  useEffect(() => {
    const handleElementOpening = () => {
      if (reducedMotion) return;

      console.log('[CameraRig] Element opening - camera shake sequence');

      // Timeline synced with element opening animations
      const tl = gsap.timeline();

      // Slap reaction: small shake (0-240ms)
      tl.to(camera.position, {
        x: '+=1.5',
        y: '+=0.8',
        duration: 0.08,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      });

      // Compression phase: dolly forward (240-420ms)
      tl.to(camera.position, {
        z: 45,
        duration: 0.18,
        ease: 'power3.in',
      }, 0.24);

      // Burst explosion: dramatic shake + recoil (420-700ms)
      tl.to(camera.position, {
        x: '+=3',
        y: '+=2',
        duration: 0.1,
        ease: 'power4.out',
      }, 0.42)
      .to(camera.position, {
        x: '-=3',
        y: '-=2',
        z: 60, // Pull back to panel viewing distance
        duration: 0.28,
        ease: 'power2.out',
      }, 0.52);
    };

    window.addEventListener('kairo:element-opening', handleElementOpening);
    return () => window.removeEventListener('kairo:element-opening', handleElementOpening);
  }, [camera, reducedMotion]);

  return <group ref={groupRef}>{children}</group>;
}
