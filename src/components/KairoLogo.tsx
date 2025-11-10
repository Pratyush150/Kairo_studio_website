/**
 * Kairo Logo
 * Initial logo that ripples and morphs into Origin shape
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import { colors } from '../lib/tokens';
import gsap from 'gsap';

export function KairoLogo() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const sceneState = useSceneStore((s) => s.sceneState);

  // Logo material with emissive violet
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.accentViolet,
        emissive: colors.accentViolet,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.3,
      }),
    []
  );

  // Breathing animation
  useFrame((state) => {
    if (!groupRef.current || sceneState !== 'loading') return;

    const breathe = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 + 1;
    groupRef.current.scale.setScalar(breathe);

    // Rotate slowly
    groupRef.current.rotation.y += 0.005;
  });

  // Ripple effect on load complete
  useEffect(() => {
    if (sceneState === 'idle' && groupRef.current) {
      // Ripple animation
      gsap.timeline()
        .to(groupRef.current.scale, {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          duration: 0.4,
          ease: 'power2.out',
        })
        .to(groupRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });

      // Flash emissive
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat, {
          emissiveIntensity: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
      }
    }
  }, [sceneState]);

  // Fade out during morphing or panel states
  useEffect(() => {
    if ((sceneState === 'morphing' || sceneState === 'panel') && groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: 'power3.in',
      });
    } else if (sceneState === 'idle' && groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, [sceneState]);

  // Hide completely when not loading or idle
  if (sceneState !== 'loading' && sceneState !== 'idle') {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[12, 32, 32]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Rim light */}
      <mesh scale={1.15}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color={colors.accentViolet}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        intensity={1.5}
        distance={80}
        color={colors.accentViolet}
      />
    </group>
  );
}
