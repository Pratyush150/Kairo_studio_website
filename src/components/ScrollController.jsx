import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useScrollProgress } from '../hooks/useScrollProgress';
import * as THREE from 'three';

/**
 * ScrollController Component
 * Maps scroll progress to 3D scene parameters
 *
 * @param {Object} props
 * @param {boolean} props.enabled - Enable scroll control (disabled when module active)
 * @param {function} props.onProgressChange - Callback with scroll data
 */
export default function ScrollController({ enabled = true, onProgressChange }) {
  const { camera } = useThree();
  const scroll = useScrollProgress({ sections: 4, enabled });

  // Notify parent of scroll changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(scroll);
    }
  }, [scroll.scrollProgress, scroll.currentSection, onProgressChange]);

  // Apply scroll-based camera effects
  useFrame((state, delta) => {
    if (!enabled) return;

    const progress = scroll.scrollProgress;

    // Camera distance based on scroll (closer as you scroll)
    const targetDistance = 5 - progress * 2; // 5 → 3
    const currentDistance = camera.position.length();
    const newDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, delta * 2);

    // Maintain camera direction but change distance
    const direction = camera.position.clone().normalize();
    camera.position.copy(direction.multiplyScalar(newDistance));

    // Slight vertical offset based on scroll
    const targetY = Math.sin(progress * Math.PI) * 1.5; // 0 → 1.5 → 0
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 2);

    // Rotate camera around Y axis based on section
    const targetRotation = scroll.currentSection * (Math.PI / 4); // 45° per section
    const currentRotation = Math.atan2(camera.position.x, camera.position.z);
    const newRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, delta * 1.5);

    const distance = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    camera.position.x = Math.sin(newRotation) * distance;
    camera.position.z = Math.cos(newRotation) * distance;

    camera.lookAt(0, 0, 0);
  });

  return null; // This component doesn't render anything
}

/**
 * Get speed multiplier based on scroll progress
 * @param {number} progress - Scroll progress (0-1)
 * @returns {number} Speed multiplier
 */
export function getScrollSpeedMultiplier(progress) {
  // Speed increases with scroll: 0.5 → 2.0
  return 0.5 + progress * 1.5;
}

/**
 * Get animation intensity based on scroll
 * @param {number} progress - Scroll progress (0-1)
 * @returns {number} Intensity (0-1)
 */
export function getScrollIntensity(progress) {
  // Sin wave for smooth pulsing
  return Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
}
