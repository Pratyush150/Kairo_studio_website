import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSceneStore } from '../lib/sceneAPI';
import { useTouchGestures } from '../hooks/useTouchGestures';
import gsap from 'gsap';
import * as THREE from 'three';

export function EnhancedCameraController() {
  const { camera, size } = useThree();

  // Use individual selectors to minimize re-renders
  const sceneState = useSceneStore((state) => state.sceneState);
  const selectedEntity = useSceneStore((state) => state.selectedEntity);
  const entities = useSceneStore((state) => state.entities);
  const reducedMotion = useSceneStore((state) => state.reducedMotion);

  const isAnimating = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);

  // Keep refs in sync to avoid stale closures in useFrame
  const sceneStateRef = useRef(sceneState);
  const reducedMotionRef = useRef(reducedMotion);
  sceneStateRef.current = sceneState;
  reducedMotionRef.current = reducedMotion;

  // Enable touch gestures for mobile
  useTouchGestures();

  // Mouse tracking state
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  // Camera rig for orbital rotation
  const cameraRig = useRef(new THREE.Group());
  const [cameraRigInitialized, setCameraRigInitialized] = useState(false);

  // Zoom state
  const targetZoom = useRef(120);
  const currentZoom = useRef(120);

  // Smooth camera position interpolation
  const targetPosition = useRef(new THREE.Vector3(0, 0, 120));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize camera rig
  useEffect(() => {
    if (!cameraRigInitialized) {
      cameraRig.current.add(camera);
      setCameraRigInitialized(true);
    }
  }, [camera, cameraRigInitialized]);

  // Mouse move tracking for parallax
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (sceneState !== 'idle' || reducedMotion) return;

      // Normalize mouse position to -1 to 1
      mousePos.current.x = (event.clientX / size.width) * 2 - 1;
      mousePos.current.y = -(event.clientY / size.height) * 2 + 1;

      // Map to rotation within ±0.08 radians
      targetRotation.current.x = mousePos.current.y * 0.08;
      targetRotation.current.y = mousePos.current.x * 0.08;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [sceneState, size, reducedMotion]);

  // Scroll wheel zoom
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (sceneState !== 'idle') return;

      event.preventDefault();

      // Adjust zoom
      const delta = event.deltaY * 0.1;
      targetZoom.current = Math.max(60, Math.min(260, targetZoom.current + delta));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [sceneState]);

  // Animation frame
  useFrame((state, delta) => {
    if (!cameraRigInitialized) return;

    // Only run orbital animation when NOT animating and in idle state (use refs for current values)
    if (!isAnimating.current && sceneStateRef.current === 'idle' && !reducedMotionRef.current) {
      // Orbital rotation (very slow) - frame-aware
      cameraRig.current.rotation.y += 0.0002 * (delta * 60); // Normalize to 60fps

      // Mouse parallax effect - frame-aware lerp
      const lerpFactor = Math.min(1, delta * 7.2); // ~0.12 at 60fps
      currentRotation.current.x = THREE.MathUtils.lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        lerpFactor
      );
      currentRotation.current.y = THREE.MathUtils.lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        lerpFactor
      );

      cameraRig.current.rotation.x = currentRotation.current.x;
      cameraRig.current.rotation.y += currentRotation.current.y * delta;

      // Zoom interpolation - frame-aware
      const zoomLerpFactor = Math.min(1, delta * 6); // ~0.1 at 60fps
      currentZoom.current = THREE.MathUtils.lerp(
        currentZoom.current,
        targetZoom.current,
        zoomLerpFactor
      );

      // Apply zoom to camera position
      const zoomVector = new THREE.Vector3(0, 0, currentZoom.current);
      camera.position.copy(zoomVector);
    }

    // Only lerp to target position when not in idle or when animating (use ref for current sceneState)
    if (isAnimating.current || sceneStateRef.current !== 'idle') {
      camera.position.lerp(targetPosition.current, Math.min(1, delta * 3));
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
          console.log('[EnhancedCameraController] Fly-in complete');
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
      tl.to(
        {},
        {
          duration: 1.6, // Spec: 900-1200ms, using 1600ms for smooth
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

      // Reset zoom
      targetZoom.current = 120;
      currentZoom.current = 120;
    }
  }, [sceneState, selectedEntity, camera]);

  // Handle boom camera rush
  useEffect(() => {
    const handleCameraRush = () => {
      isAnimating.current = true;

      // Kill any hover tweens
      if (hoverTweenRef.current) {
        hoverTweenRef.current.kill();
        hoverTweenRef.current = null;
      }

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

  // Handle entity hover - dolly in
  useEffect(() => {
    const handleEntityHover = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { entityId, active } = customEvent.detail;

      if (sceneState !== 'idle' || isAnimating.current) return;

      // Kill previous hover tween to prevent conflicts
      if (hoverTweenRef.current) {
        hoverTweenRef.current.kill();
      }

      if (active) {
        // Dolly in z -= 8 (duration 220ms)
        hoverTweenRef.current = gsap.to(camera.position, {
          z: camera.position.z - 8,
          duration: 0.22,
          ease: 'power2.out',
        });
      } else {
        // Return to current zoom
        hoverTweenRef.current = gsap.to(camera.position, {
          z: currentZoom.current,
          duration: 0.22,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('kairo:entity-hover', handleEntityHover);
    return () => {
      window.removeEventListener('kairo:entity-hover', handleEntityHover);
      // Clean up on unmount
      if (hoverTweenRef.current) {
        hoverTweenRef.current.kill();
      }
    };
  }, [sceneState, camera]);

  return null;
}
