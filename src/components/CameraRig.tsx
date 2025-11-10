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

  // Smooth camera rotation with lerp
  useFrame(() => {
    if (!groupRef.current || reducedMotion || sceneState !== 'idle') return;

    // Lerp target towards mouse position
    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * interaction.cameraLerp;
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * interaction.cameraLerp;

    // Apply rotation to group
    groupRef.current.rotation.y = targetRef.current.x * 0.1;
    groupRef.current.rotation.x = targetRef.current.y * 0.05;
  });

  // Camera fly-in transitions
  useEffect(() => {
    if (sceneState === 'morphing') {
      // Animate camera closer during morph transition
      gsap.to(camera.position, {
        z: 80,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    } else if (sceneState === 'idle') {
      // Return to default position
      gsap.to(camera.position, {
        z: 120,
        duration: 1.2,
        ease: 'power3.out',
      });
    } else if (sceneState === 'panel') {
      // Zoom in for panel view
      gsap.to(camera.position, {
        z: 50,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    }
  }, [sceneState, camera]);

  return <group ref={groupRef}>{children}</group>;
}
