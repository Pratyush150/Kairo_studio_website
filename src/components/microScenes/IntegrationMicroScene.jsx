import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import ModuleMicroScene from './ModuleMicroScene';

/**
 * Integration MicroScene
 * Network hub visualization with connections
 */
export default function IntegrationMicroScene({ active }) {
  const nodesRef = useRef([]);
  const pulseRef = useRef(0);

  useFrame((state, delta) => {
    if (!active) return;

    const time = state.clock.elapsedTime;
    pulseRef.current = Math.sin(time * 2) * 0.5 + 0.5;

    // Pulse nodes
    nodesRef.current.forEach((node, i) => {
      if (node) {
        const scale = 1 + pulseRef.current * 0.2 * ((i % 2) + 0.5);
        node.scale.setScalar(scale);
      }
    });
  });

  if (!active) return null;

  // Node positions (hexagonal pattern)
  const nodePositions = [
    [0, 0.4, 0],       // Top
    [-0.35, 0.2, 0],   // Top-left
    [0.35, 0.2, 0],    // Top-right
    [-0.35, -0.2, 0],  // Bottom-left
    [0.35, -0.2, 0],   // Bottom-right
    [0, -0.4, 0],      // Bottom
  ];

  return (
    <ModuleMicroScene moduleId="integration" active={active} position={[-1.2, -0.3, 0]}>
      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#FFE500"
          emissive="#FFE500"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Connected nodes */}
      {nodePositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (nodesRef.current[i] = el)}
          position={pos}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#FFE500"
            emissive="#FFE500"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Connection lines */}
      {nodePositions.map((pos, i) => {
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(...pos),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`line-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color="#FFE500" transparent opacity={0.6} />
          </line>
        );
      })}

      {/* Data packets orbiting */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const angle = (i / 9) * Math.PI * 2;
        const radius = 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <mesh key={`packet-${i}`} position={[x, y, 0.1]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial color="#FFE500" />
          </mesh>
        );
      })}

      {/* Outer ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.6, 0.01, 16, 64]} />
        <meshBasicMaterial color="#FFE500" transparent opacity={0.4} />
      </mesh>

      {/* Inner pulse ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.02, 16, 32]} />
        <meshBasicMaterial color="#FFE500" transparent opacity={0.6} />
      </mesh>

      {/* API symbols at nodes */}
      {nodePositions.slice(0, 4).map((pos, i) => (
        <mesh key={`api-${i}`} position={[pos[0], pos[1], 0.15]}>
          <ringGeometry args={[0.05, 0.08, 6]} />
          <meshBasicMaterial color="#FFE500" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Module label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color="#FFE500"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        System Integration
      </Text>

      {/* Point light */}
      <pointLight position={[0, 0, 0]} color="#FFE500" intensity={1.5} distance={3} />
    </ModuleMicroScene>
  );
}
