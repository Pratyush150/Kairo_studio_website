import { useRef, useEffect } from 'react';
import { DepthOfField } from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';
import * as THREE from 'three';

interface DepthOfFieldControllerProps {
  enabled?: boolean;
}

export function DepthOfFieldController({ enabled = true }: DepthOfFieldControllerProps) {
  const depthOfFieldRef = useRef<any>(null);
  const { camera } = useThree();
  const { sceneState, selectedEntity, entities } = useSceneStore();
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Animated values
  const dofParams = useRef({
    focusDistance: 0.0,
    focalLength: 0.02,
    bokehScale: 2.0,
  });

  useEffect(() => {
    if (!enabled || !depthOfFieldRef.current) return;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const target = depthOfFieldRef.current.target;

    if (sceneState === 'transition' && selectedEntity) {
      // During transition: Increase blur, focus ahead
      const entity = entities.find((e) => e.id === selectedEntity);
      if (!entity) return;

      const entityPos = new THREE.Vector3(...entity.position);
      const distanceToEntity = camera.position.distanceTo(entityPos);

      // Animate to blurred state
      animationRef.current = gsap.to(dofParams.current, {
        focusDistance: Math.min(distanceToEntity / 100, 0.8),
        focalLength: 0.01, // Wider aperture = more blur
        bokehScale: 6.0, // Larger bokeh
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (target) {
            target.focusDistance = dofParams.current.focusDistance;
            target.focalLength = dofParams.current.focalLength;
            target.bokehScale = dofParams.current.bokehScale;
          }
        },
      });

      console.log('[DepthOfField] Transitioning to blurred state');
    } else if (sceneState === 'panel' && selectedEntity) {
      // Panel view: Sharp focus on entity
      animationRef.current = gsap.to(dofParams.current, {
        focusDistance: 0.05,
        focalLength: 0.05, // Narrower aperture = sharper
        bokehScale: 1.0, // Smaller bokeh
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (target) {
            target.focusDistance = dofParams.current.focusDistance;
            target.focalLength = dofParams.current.focalLength;
            target.bokehScale = dofParams.current.bokehScale;
          }
        },
      });

      console.log('[DepthOfField] Sharp focus on entity');
    } else if (sceneState === 'idle') {
      // Idle view: Minimal blur, everything in focus
      animationRef.current = gsap.to(dofParams.current, {
        focusDistance: 0.0,
        focalLength: 0.1, // Very narrow aperture
        bokehScale: 1.5,
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (target) {
            target.focusDistance = dofParams.current.focusDistance;
            target.focalLength = dofParams.current.focalLength;
            target.bokehScale = dofParams.current.bokehScale;
          }
        },
      });

      console.log('[DepthOfField] Returning to idle focus');
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [sceneState, selectedEntity, entities, camera, enabled]);

  if (!enabled) return null;

  return (
    <DepthOfField
      ref={depthOfFieldRef}
      focusDistance={dofParams.current.focusDistance}
      focalLength={dofParams.current.focalLength}
      bokehScale={dofParams.current.bokehScale}
      height={480}
    />
  );
}
