import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FractalCrystalProps {
  color: string;
  intensity?: number;
  scale?: number;
}

export function FractalCrystal({ color, intensity = 1.0, scale = 1 }: FractalCrystalProps) {
  const groupRef = useRef<THREE.Group>(null);

  const crystalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: intensity * 0.3,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
      transmission: 0.1,
      thickness: 0.5,
    });
  }, [color, intensity]);

  // Create cluster of crystals
  const crystals = useMemo(() => {
    const count = 8;
    const items = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.4;
      const height = 1 + Math.random() * 0.5;

      items.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 0.5,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
          number,
          number,
          number
        ],
        scale: [0.3, height, 0.3] as [number, number, number],
      });
    }

    return items;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Slow rotation
    groupRef.current.rotation.y += 0.002;

    // Pulsing effect on each crystal
    groupRef.current.children.forEach((child, index) => {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.05 + 1;
      child.scale.y = crystals[index].scale[1] * pulse;
    });
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Center core */}
      <mesh>
        <octahedronGeometry args={[0.4, 0]} />
        <primitive object={crystalMaterial} attach="material" />
      </mesh>

      {/* Surrounding crystals */}
      {crystals.map((crystal, index) => (
        <mesh
          key={index}
          position={crystal.position}
          rotation={crystal.rotation}
          scale={crystal.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <primitive object={crystalMaterial} attach="material" />
        </mesh>
      ))}

      {/* Inner glow point light */}
      <pointLight intensity={intensity * 0.5} distance={5} color={color} />
    </group>
  );
}
