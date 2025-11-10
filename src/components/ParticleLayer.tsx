/**
 * Particle Layer
 * GPU-based particle system with depth sorting
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import { useResponsive } from '../hooks/useResponsive';
import { performance as perfSettings } from '../lib/tokens';

export function ParticleLayer() {
  const pointsRef = useRef<THREE.Points>(null);
  const { isMobile } = useResponsive();
  const performanceMode = useSceneStore((s) => s.performanceMode);

  // Calculate particle count based on device and performance mode
  const count = useMemo(() => {
    if (isMobile) return perfSettings.particles.mobile;

    switch (performanceMode) {
      case 'high':
        return perfSettings.particles.desktop;
      case 'medium':
        return Math.floor(perfSettings.particles.desktop * 0.6);
      case 'low':
        return perfSettings.particles.mobile;
      default:
        return perfSettings.particles.desktop;
    }
  }, [isMobile, performanceMode]);

  // Generate particle geometry
  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute particles in a large sphere
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return { geometry: geo, velocities };
  }, [count]);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around boundary
      const radius = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2
      );

      if (radius > 300) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 100;

        positions[i * 3] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = newRadius * Math.cos(phi);
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={1.5}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
