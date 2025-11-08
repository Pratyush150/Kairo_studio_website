import React, { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Circle, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Hub = forwardRef(({ onPointerMove, reducedMotion }, ref) => {
  const meshRef = useRef();

  // Slow rotation
  useFrame((state) => {
    if (!reducedMotion && meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // 360° / 120s
    }
  });

  return (
    <group ref={ref}>
      {/* Main hub disc */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        onPointerMove={onPointerMove}
      >
        <cylinderGeometry args={[5.2, 5.2, 0.2, 64]} />
        <meshStandardMaterial
          color="#1a1f2e"
          metalness={0.7}
          roughness={0.3}
          emissive="#0a0d14"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Radial markings */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 6;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0, -0.39, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05, 0.08, 32]} />
              <meshStandardMaterial
                color="#4a90e2"
                emissive="#4a90e2"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        );
      })}

      {/* Center logo glow */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial
          color="#4a90e2"
          emissive="#4a90e2"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Hit area (invisible) for pointer detection */}
      <mesh
        position={[0, -0.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerMove={onPointerMove}
      >
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
});

Hub.displayName = 'Hub';

export default Hub;
