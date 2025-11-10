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
    if (sceneState === 'morphing' || sceneState === 'transitioning') {
      // Animate camera closer during morph transition
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 80,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    } else if (sceneState === 'idle') {
      // Return to wide view to see all balls
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 180, // Further back to see all balls in circle
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
    } else if (sceneState === 'ball-opening') {
      // During ball opening: dramatic camera rush forward
      gsap.to(camera.position, {
        z: 60,
        duration: 0.42, // During compression phase
        ease: 'power3.in',
      });
    }
  }, [sceneState, camera]);

  // Ball opening camera shake + burst dolly
  useEffect(() => {
    const handleBallOpening = () => {
      console.log('[CameraRig] Ball opening - triggering camera animations');

      // Timeline synced with ball animations
      const tl = gsap.timeline();

      // Slap reaction: small shake (0-240ms)
      tl.to(camera.position, {
        x: '+=2',
        y: '+=1',
        duration: 0.08,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      });

      // Compression phase: dolly forward (240-420ms)
      tl.to(camera.position, {
        z: 40,
        duration: 0.18,
        ease: 'power3.in',
      }, 0.24);

      // Burst explosion: dramatic shake + recoil (420-920ms)
      tl.to(camera.position, {
        x: '+=5',
        y: '+=3',
        duration: 0.1,
        ease: 'power4.out',
      }, 0.42)
      .to(camera.position, {
        x: '-=5',
        y: '-=3',
        z: 50, // Pull back slightly
        duration: 0.4,
        ease: 'elastic.out(1, 0.4)',
      }, 0.52);
    };

    window.addEventListener('kairo:ball-opening', handleBallOpening);
    return () => window.removeEventListener('kairo:ball-opening', handleBallOpening);
  }, [camera]);

  return <group ref={groupRef}>{children}</group>;
}
