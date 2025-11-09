import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';
import * as THREE from 'three';

export function CameraController() {
  const { camera } = useThree();
  const { sceneState, selectedEntity, entities } = useSceneStore();
  const isAnimating = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Smooth camera position interpolation
  const targetPosition = useRef(new THREE.Vector3(0, 0, 120));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!isAnimating.current) {
      // Smooth interpolation to target
      camera.position.lerp(targetPosition.current, 0.05);
      camera.lookAt(targetLookAt.current);
    }
  });

  // Handle fly-in animation to entity
  useEffect(() => {
    if (sceneState === 'transition' && selectedEntity) {
      const entity = entities.find((e) => e.id === selectedEntity);
      if (!entity) return;

      isAnimating.current = true;

      // Kill any existing animation
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Create smooth camera path
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...entity.position);

      // Calculate curved path (bezier-like approach point)
      const midPoint = new THREE.Vector3()
        .lerpVectors(startPos, endPos, 0.5)
        .add(new THREE.Vector3(0, 20, 30)); // Slight arc

      // Timeline for smooth animation
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
          console.log('[CameraController] Fly-in complete');
        },
      });

      timelineRef.current = tl;

      // Animate camera along curved path
      const pathPoints = [];
      const steps = 20;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Quadratic bezier curve
        const point = new THREE.Vector3();
        point.x =
          (1 - t) * (1 - t) * startPos.x +
          2 * (1 - t) * t * midPoint.x +
          t * t * endPos.x;
        point.y =
          (1 - t) * (1 - t) * startPos.y +
          2 * (1 - t) * t * midPoint.y +
          t * t * endPos.y;
        point.z =
          (1 - t) * (1 - t) * startPos.z +
          2 * (1 - t) * t * midPoint.z +
          t * t * endPos.z;
        pathPoints.push(point);
      }

      // Animate through path points
      let currentStep = 0;
      tl.to(
        {},
        {
          duration: 1.8,
          ease: 'power3.inOut',
          onUpdate: function () {
            const progress = this.progress();
            const stepIndex = Math.floor(progress * (pathPoints.length - 1));
            if (stepIndex < pathPoints.length) {
              camera.position.copy(pathPoints[stepIndex]);
              camera.lookAt(endPos);
            }
          },
        }
      );

      // Trigger particle trail effect
      window.dispatchEvent(
        new CustomEvent('kairo:camera-trail', {
          detail: { path: pathPoints },
        })
      );

      // Trigger transition sound
      window.dispatchEvent(
        new CustomEvent('kairo:play-sound', {
          detail: { type: 'transition' },
        })
      );
    }
  }, [sceneState, selectedEntity, entities, camera]);

  // Handle return to idle view
  useEffect(() => {
    if (sceneState === 'idle' && !selectedEntity) {
      isAnimating.current = true;

      // Kill any existing animation
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      timelineRef.current = tl;

      // Return to overview position
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 120,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    }
  }, [sceneState, selectedEntity, camera]);

  // Handle boom camera rush
  useEffect(() => {
    const handleCameraRush = () => {
      isAnimating.current = true;

      gsap.fromTo(
        camera.position,
        { z: -200 },
        {
          z: 120,
          duration: 0.7,
          ease: 'power3.out',
          onUpdate: () => {
            camera.lookAt(0, 0, 0);
          },
          onComplete: () => {
            isAnimating.current = false;
          },
        }
      );
    };

    window.addEventListener('kairo:camera-rush', handleCameraRush);
    return () => window.removeEventListener('kairo:camera-rush', handleCameraRush);
  }, [camera]);

  return null;
}
