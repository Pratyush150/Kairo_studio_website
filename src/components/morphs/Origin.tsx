/**
 * Origin Morph (About)
 * Crystalline sculpture with plasma effect
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

export const Origin = forwardRef<MorphRef, {}>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Crystalline geometry
  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(20, 2);
    // Add some randomness to vertices for crystalline look
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const noise = Math.random() * 0.3;
      positions.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Plasma material
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: colors.accentViolet,
        emissive: colors.accentViolet,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.1,
        transmission: 0.2,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    []
  );

  // Idle loop animation
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.003;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  useImperativeHandle(ref, () => ({
    appear: () => {
      if (!groupRef.current) return;
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' }
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

      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
        gsap.to(mat, {
          emissiveIntensity: 0.4 + strength * 0.3,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
        });
      }
    },
    enterZoom: () => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    },
    idleLoop: () => {
      // Already handled in useFrame
    },
  }));

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <pointLight intensity={1.2} distance={60} color={colors.accentViolet} />
    </group>
  );
});

Origin.displayName = 'Origin';
