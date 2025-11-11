/**
 * Tunnel Effect
 * Animated ring/tunnel during transit between elements
 * Spec: 900ms duration, rotating rings, particle streaks
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

export function TunnelEffect() {
  const performanceMode = useSceneStore((s) => s.performanceMode);
  const isMobile = useSceneStore((s) => s.isMobile);

  const [isActive, setIsActive] = useState(false);
  const [midPoint, setMidPoint] = useState<[number, number, number]>([0, 0, 0]);

  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const startTime = useRef(0);
  const progress = useRef(0);

  // Ring geometry - reused
  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(35, 2.5, 8, 32);
  }, []);

  // Particle streaks - ULTRA MINIMAL for performance
  const particleGeometry = useMemo(() => {
    const count = isMobile ? 15 : performanceMode === 'low' ? 20 : performanceMode === 'medium' ? 30 : 50; // Drastically reduced from 50/200
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 20 + Math.random() * 15;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      velocities[i] = 40 + Math.random() * 20; // Random velocity
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    return geo;
  }, [isMobile, performanceMode]);

  // Listen for spawn-tunnel event
  useEffect(() => {
    const handleSpawnTunnel = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { midPoint: mid } = customEvent.detail;

      console.log('[TunnelEffect] Spawning tunnel at', mid);
      setMidPoint(mid);
      setIsActive(true);
      startTime.current = Date.now();
      progress.current = 0;

      // Animate rings in
      if (ring1Ref.current && ring2Ref.current && ring3Ref.current) {
        gsap.killTweensOf([ring1Ref.current.scale, ring2Ref.current.scale, ring3Ref.current.scale]);

        // Start from 0
        ring1Ref.current.scale.set(0, 0, 0);
        ring2Ref.current.scale.set(0, 0, 0);
        ring3Ref.current.scale.set(0, 0, 0);

        // Animate to 1
        gsap.to(ring1Ref.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(ring2Ref.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.3,
          delay: 0.1,
          ease: 'power2.out',
        });
        gsap.to(ring3Ref.current.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.3,
          delay: 0.2,
          ease: 'power2.out',
        });
      }

      // Auto-deactivate after 920ms
      setTimeout(() => {
        console.log('[TunnelEffect] Tunnel complete, fading out');

        // Fade out
        if (ring1Ref.current && ring2Ref.current && ring3Ref.current) {
          gsap.to(ring1Ref.current.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.2,
            ease: 'power2.in',
          });
          gsap.to(ring2Ref.current.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.2,
            delay: 0.05,
            ease: 'power2.in',
          });
          gsap.to(ring3Ref.current.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.2,
            delay: 0.1,
            ease: 'power2.in',
            onComplete: () => setIsActive(false),
          });
        }
      }, 920);
    };

    window.addEventListener('kairo:spawn-tunnel', handleSpawnTunnel);
    return () => window.removeEventListener('kairo:spawn-tunnel', handleSpawnTunnel);
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive) return;

    const elapsed = Date.now() - startTime.current;
    progress.current = Math.min(elapsed / 920, 1);

    // Rotate rings at different speeds
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 2;
      ring1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 2.5;
      ring2Ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 1.5) * 0.1;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 1.5;
      ring3Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.8) * 0.12;
    }

    // Animate particles forward
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      const velocities = particlesRef.current.geometry.attributes.velocity;

      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        const velocity = velocities.getX(i);

        // Move forward
        positions.setZ(i, z + delta * velocity);

        // Wrap around
        if (positions.getZ(i) > 100) {
          positions.setZ(i, -100);
        }
      }

      positions.needsUpdate = true;
    }

    // Fade opacity based on progress
    if (groupRef.current) {
      if (progress.current < 0.15) {
        // Fade in
        groupRef.current.children.forEach((child) => {
          if ('material' in child) {
            const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | THREE.PointsMaterial;
            if ('opacity' in material) {
              material.opacity = progress.current / 0.15;
            }
          }
        });
      } else if (progress.current > 0.85) {
        // Fade out
        groupRef.current.children.forEach((child) => {
          if ('material' in child) {
            const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | THREE.PointsMaterial;
            if ('opacity' in material) {
              material.opacity = (1 - progress.current) / 0.15;
            }
          }
        });
      }
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={midPoint}>
      {/* Ring 1 - Cyan */}
      <mesh ref={ring1Ref} geometry={ringGeometry}>
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ring 2 - Purple (offset) */}
      <mesh ref={ring2Ref} position={[0, 0, -40]} geometry={ringGeometry}>
        <meshBasicMaterial
          color="#A854FF"
          transparent
          opacity={0}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ring 3 - Violet (offset) */}
      <mesh ref={ring3Ref} position={[0, 0, -80]} geometry={ringGeometry}>
        <meshBasicMaterial
          color="#FF00E5"
          transparent
          opacity={0}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle streaks */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={isMobile ? 2 : 3}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
