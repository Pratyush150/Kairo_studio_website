import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ModuleMicroScene Base Component
 * Base class for all module micro-scenes with common functionality
 *
 * @param {Object} props
 * @param {string} props.moduleId - Module identifier
 * @param {boolean} props.active - Whether this micro-scene is active
 * @param {[number, number, number]} props.position - Position offset
 * @param {function} props.children - Child components
 */
export default function ModuleMicroScene({
  moduleId,
  active = false,
  position = [0, 0, 0],
  children,
}) {
  const groupRef = useRef();
  const fadeProgress = useRef(0);

  // Fade in/out based on active state
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetOpacity = active ? 1 : 0;
    fadeProgress.current = THREE.MathUtils.lerp(
      fadeProgress.current,
      targetOpacity,
      delta * 5
    );

    // Apply opacity to all meshes
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.opacity = fadeProgress.current;
            mat.transparent = true;
          });
        } else {
          child.material.opacity = fadeProgress.current;
          child.material.transparent = true;
        }
      }
    });

    // Only render when visible
    groupRef.current.visible = fadeProgress.current > 0.01;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      console.log(`[MicroScene] Disposed ${moduleId} scene`);
    };
  }, [moduleId]);

  return (
    <group ref={groupRef} position={position} visible={false}>
      {children}
    </group>
  );
}
