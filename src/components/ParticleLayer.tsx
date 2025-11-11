/**
 * Particle Layer
 * GPU-based particle system with depth sorting + supernova burst effects
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import { useResponsive } from '../hooks/useResponsive';
import { performance as perfSettings } from '../lib/tokens';

interface BurstParticle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

interface BurstRing {
  id: number;
  position: THREE.Vector3;
  scale: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function ParticleLayer() {
  const pointsRef = useRef<THREE.Points>(null);
  const { isMobile } = useResponsive();
  const performanceMode = useSceneStore((s) => s.performanceMode);

  // Burst effects state
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [burstRings, setBurstRings] = useState<BurstRing[]>([]);
  const burstIdCounter = useRef(0);

  // Calculate particle count - ULTRA MINIMAL for performance
  const count = useMemo(() => {
    if (isMobile) return 20; // Ultra minimal for mobile

    switch (performanceMode) {
      case 'high':
        return 50; // Drastically reduced from 200
      case 'medium':
        return 30; // Drastically reduced from 120
      case 'low':
        return 15; // Drastically reduced from 50
      default:
        return 50;
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

  // Listen for particle burst events
  useEffect(() => {
    const handleBurst = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { position, intensity = 1.0 } = customEvent.detail;

      console.log('[ParticleLayer] Burst triggered at:', position, 'intensity:', intensity);

      // Calculate burst particle count based on performance mode - DRASTICALLY REDUCED
      const burstCount = performanceMode === 'low' ? 10 : performanceMode === 'medium' ? 20 : 30;

      // Create burst particles
      const newParticles: BurstParticle[] = [];
      for (let i = 0; i < burstCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 20 + Math.random() * 30 * intensity;

        newParticles.push({
          id: burstIdCounter.current++,
          position: new THREE.Vector3(position.x, position.y, position.z),
          velocity: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.sin(phi) * Math.sin(theta) * speed,
            Math.cos(phi) * speed
          ),
          life: 1.0,
          maxLife: 0.8 + Math.random() * 0.4,
          size: 2 + Math.random() * 3,
        });
      }

      setBurstParticles((prev) => [...prev, ...newParticles]);

      // Create burst rings (shock waves)
      const ringCount = performanceMode === 'low' ? 1 : 3;
      const newRings: BurstRing[] = [];
      for (let i = 0; i < ringCount; i++) {
        newRings.push({
          id: burstIdCounter.current++,
          position: new THREE.Vector3(position.x, position.y, position.z),
          scale: 0.1,
          opacity: 1.0,
          life: 1.0,
          maxLife: 0.6 + i * 0.1,
        });
      }

      setBurstRings((prev) => [...prev, ...newRings]);
    };

    window.addEventListener('kairo:particle-burst', handleBurst);
    return () => window.removeEventListener('kairo:particle-burst', handleBurst);
  }, [performanceMode]);

  // Animate particles - Throttled for performance
  const frameCounter = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Update every 3rd frame for better performance (more aggressive throttling)
    frameCounter.current++;
    if (frameCounter.current % 3 !== 0) return;

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around boundary - Optimized calculation
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const radiusSq = x * x + y * y + z * z;

      if (radiusSq > 90000) { // 300^2 to avoid sqrt
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 100;

        positions[i * 3] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = newRadius * Math.cos(phi);
      }
    }

    geometry.attributes.position.needsUpdate = true;

    // Update burst particles
    setBurstParticles((prev) => {
      return prev
        .map((p) => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
          velocity: p.velocity.clone().multiplyScalar(0.98), // Drag
          life: p.life - delta / p.maxLife,
        }))
        .filter((p) => p.life > 0);
    });

    // Update burst rings
    setBurstRings((prev) => {
      return prev
        .map((r) => ({
          ...r,
          scale: r.scale + delta * 50,
          opacity: r.life,
          life: r.life - delta / r.maxLife,
        }))
        .filter((r) => r.life > 0);
    });
  });

  return (
    <>
      {/* Background particles */}
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

      {/* Burst particles */}
      {burstParticles.map((particle) => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[particle.size * particle.life, 4, 4]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={particle.life * 0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Burst rings (shock waves) */}
      {burstRings.map((ring) => (
        <mesh key={ring.id} position={ring.position}>
          <ringGeometry args={[ring.scale, ring.scale + 2, 32]} />
          <meshBasicMaterial
            color="#A854FF"
            transparent
            opacity={ring.opacity * 0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
