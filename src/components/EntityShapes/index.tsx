// Export all entity shapes
export { FractalCrystal } from './FractalCrystal';
export { MetaballBlob } from './MetaballBlob';
export { CubeMatrix } from './CubeMatrix';
export { HelixVortex } from './HelixVortex';

// Simple placeholder shapes for remaining entities
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SimpleEntityProps {
  color: string;
  intensity?: number;
  scale?: number;
}

// Energy Orb with satellites
export function EnergyOrb({ color, intensity = 1.0, scale = 1 }: SimpleEntityProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.01;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Satellites */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 0.4} />
          </mesh>
        );
      })}

      <pointLight intensity={intensity * 0.5} distance={5} color={color} />
    </group>
  );
}

// Network Lattice
export function NetworkLattice({ color, intensity = 1.0, scale = 1 }: SimpleEntityProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
    groupRef.current.scale.setScalar(scale * pulse);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.3}
          wireframe
        />
      </mesh>

      {/* Node spheres at vertices */}
      {[-1, 1].map((x) =>
        [-1, 1].map((y) =>
          [-1, 1].map((z) => (
            <mesh key={`${x}-${y}-${z}`} position={[x * 0.7, y * 0.7, z * 0.7]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity * 0.6} />
            </mesh>
          ))
        )
      )}

      <pointLight intensity={intensity * 0.4} distance={5} color={color} />
    </group>
  );
}

// Holographic Prism
export function HolographicPrism({ color, intensity = 1.0, scale = 1 }: SimpleEntityProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.008;
  });

  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.4}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
          transmission={0.3}
        />
      </mesh>
      <pointLight intensity={intensity * 0.5} distance={5} color={color} />
    </group>
  );
}

// Gateway Ring
export function GatewayRing({ color, intensity = 1.0, scale = 1 }: SimpleEntityProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.006;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh>
        <torusGeometry args={[1, 0.15, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.7, 0.08, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      <pointLight intensity={intensity * 0.8} distance={6} color={color} />
    </group>
  );
}
