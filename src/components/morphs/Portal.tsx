/**
 * Portal Morph (Contact)
 * Hollow torus with particle vortex inside
 */

import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors } from '../../lib/tokens';
import gsap from 'gsap';

export interface MorphRef {
  appear: () => void;
  hoverPulse: (strength: number) => void;
  enterZoom: () => void;
  idleLoop: () => void;
}

export const Portal = forwardRef<MorphRef, {}>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Torus geometry
  const torusGeometry = useMemo(() => {
    return new THREE.TorusGeometry(16, 3, 24, 64);
  }, []);

  // Vortex particles
  const particleGeometry = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 8;
      const radius = t * 12;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (t - 0.5) * 20;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  // Animate
  useFrame((state) => {
    if (!groupRef.current || !particlesRef.current) return;
    groupRef.current.rotation.y += 0.005;
    particlesRef.current.rotation.y -= 0.01;
  });

  useImperativeHandle(ref, () => ({
    appear: () => {
      if (!groupRef.current) return;
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: 'power3.out' }
      );
    },
    hoverPulse: (strength: number) => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.scale, {
        x: 1 + strength * 0.03,
        y: 1 + strength * 0.03,
        z: 1 + strength * 0.03,
        duration: 0.18,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    },
    enterZoom: () => {
      if (!groupRef.current) return;
      // Tunnel fly-through effect
      gsap.to(groupRef.current.scale, {
        x: 3,
        y: 3,
        z: 3,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    },
    idleLoop: () => {
      // Handled in useFrame
    },
  }));

  return (
    <group ref={groupRef}>
      {/* Torus ring */}
      <mesh ref={torusRef} geometry={torusGeometry}>
        <meshStandardMaterial
          color={colors.softBeige}
          emissive={colors.softBeige}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner vortex particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          color={colors.softBeige}
          size={0.4}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <pointLight intensity={1.0} distance={60} color={colors.softBeige} />
    </group>
  );
});

Portal.displayName = 'Portal';
