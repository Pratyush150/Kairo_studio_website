import { useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type LODLevel = 'high' | 'medium' | 'low';

interface LODConfig {
  highDistance: number;  // Beyond this distance = high detail
  mediumDistance: number; // Beyond this = medium detail
  // Below mediumDistance = low detail
}

const DEFAULT_CONFIG: LODConfig = {
  highDistance: 180, // Entities farther than this use low LOD
  mediumDistance: 100, // Entities farther than this use medium LOD
};

/**
 * Hook to determine LOD level based on distance from camera
 * Optimized to minimize re-renders by using hysteresis and refs
 * @param position - Position of the object in 3D space
 * @param config - Optional LOD distance configuration
 * @returns Current LOD level and distance from camera
 */
export function useLOD(
  position: THREE.Vector3 | [number, number, number],
  config: Partial<LODConfig> = {}
) {
  const { camera } = useThree();
  const [lodLevel, setLodLevel] = useState<LODLevel>('high');
  const currentLevelRef = useRef<LODLevel>('high');
  const frameCountRef = useRef(0);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  useFrame(() => {
    // Only check LOD every 15 frames to reduce overhead (was 10)
    frameCountRef.current++;
    if (frameCountRef.current % 15 !== 0) {
      return;
    }

    const pos = Array.isArray(position)
      ? new THREE.Vector3(...position)
      : position;

    const dist = camera.position.distanceTo(pos);

    // Determine LOD level based on distance with hysteresis
    // Add 10% hysteresis to prevent rapid switching at boundaries
    const hysteresis = 0.1;
    let newLevel: LODLevel;

    if (dist > finalConfig.highDistance * (1 + hysteresis)) {
      newLevel = 'low';
    } else if (dist < finalConfig.highDistance * (1 - hysteresis) && dist > finalConfig.mediumDistance * (1 + hysteresis)) {
      newLevel = 'medium';
    } else if (dist < finalConfig.mediumDistance * (1 - hysteresis)) {
      newLevel = 'high';
    } else {
      // In hysteresis zone, keep current level
      newLevel = currentLevelRef.current;
    }

    // Only update state if level actually changed
    if (newLevel !== currentLevelRef.current) {
      currentLevelRef.current = newLevel;
      setLodLevel(newLevel);
    }
  });

  return { lodLevel, distance: 0 }; // distance removed as it's not used
}

/**
 * Get geometry detail multiplier based on LOD level
 */
export function getLODMultiplier(level: LODLevel): number {
  switch (level) {
    case 'high':
      return 1.0;
    case 'medium':
      return 0.5;
    case 'low':
      return 0.25;
    default:
      return 1.0;
  }
}

/**
 * Calculate geometry segments based on LOD level
 */
export function getLODSegments(baseSegments: number, level: LODLevel): number {
  const multiplier = getLODMultiplier(level);
  return Math.max(4, Math.floor(baseSegments * multiplier));
}
