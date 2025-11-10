/**
 * Corridor Transit
 * Animated corridor/tunnel effect when navigating between balls
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';

export function CorridorTransit() {
  const corridorTransitActive = useSceneStore((s) => s.corridorTransitActive);
  const performanceMode = useSceneStore((s) => s.performanceMode);

  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const progress = useRef(0);
  const startTime = useRef(0);

  // Ring geometry
  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(25, 2, 8, 32);
  }, []);

  // Particle streaks
  const particleGeometry = useMemo(() => {
    const count = performanceMode === 'low' ? 50 : 200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 20 + Math.random() * 10;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [performanceMode]);

  // Reset on transit start
  useEffect(() => {
    if (corridorTransitActive) {
      progress.current = 0;
      startTime.current = Date.now();

      // Play transit sound
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kairo:play-ball-sound', {
          detail: { type: 'transit', volume: 0.6 }
        }));
      }
    }
  }, [corridorTransitActive]);

  // Animation
  useFrame((state, delta) => {
    if (!corridorTransitActive || !ringRef.current || !particlesRef.current) return;

    // Progress over 920ms
    const elapsed = Date.now() - startTime.current;
    progress.current = Math.min(elapsed / 920, 1);

    // Rotate ring
    ringRef.current.rotation.z += delta * 3;
    ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;

    // Fade in/out
    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    if (progress.current < 0.2) {
      material.opacity = progress.current / 0.2;
    } else if (progress.current > 0.8) {
      material.opacity = (1 - progress.current) / 0.2;
    } else {
      material.opacity = 1;
    }

    // Animate particles
    particlesRef.current.position.z += delta * 50;
    if (particlesRef.current.position.z > 50) {
      particlesRef.current.position.z = -50;
    }
  });

  if (!corridorTransitActive) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Ring tunnel - positioned in front of camera */}
      <mesh ref={ringRef} position={[0, 0, -30]} geometry={ringGeometry}>
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle streaks */}
      <points ref={particlesRef} position={[0, 0, -50]} geometry={particleGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={3}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Additional ring for depth */}
      <mesh position={[0, 0, -60]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[35, 2.5, 8, 32]} />
        <meshBasicMaterial
          color="#A854FF"
          transparent
          opacity={0.4}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
