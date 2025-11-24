import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createLoaders } from '../lib/loaders';

/**
 * BrainCore Component
 * Manages the central brain model with progressive LOD loading
 */
export default function BrainCore({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const { gl } = useThree();

  const [currentLOD, setCurrentLOD] = useState(0);
  const [loadersReady, setLoadersReady] = useState(false);

  // Initialize loaders on mount
  useEffect(() => {
    try {
      const loaders = createLoaders(gl);
      console.log('[BrainCore] Loaders initialized:', loaders);
      setLoadersReady(true);
    } catch (error) {
      console.error('[BrainCore] Error initializing loaders:', error);
    }
  }, [gl]);

  // Animate rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // For now, render a procedural brain-like structure
  // This will be replaced with actual GLTF models
  return (
    <group ref={groupRef} position={position}>
      {/* Core sphere */}
      <mesh>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#00E5FF"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Outer wireframe */}
      <mesh>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshBasicMaterial
          color="#00E5FF"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshBasicMaterial
          color="#FF00E5"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Rotating ring (equator) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Module hotspot indicators (3 points) */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.3;
        const z = Math.sin(rad) * 1.3;

        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial
              color={i === 0 ? '#00E5FF' : i === 1 ? '#FF00E5' : '#FFE500'}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* Point lights for glow effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#00E5FF"
        distance={3}
      />
    </group>
  );
}
