import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import ModuleMicroScene from './ModuleMicroScene';

/**
 * SaaS MicroScene
 * Cloud-based architecture visualization with floating servers
 */
export default function SaaSMicroScene({ active }) {
  const serversRef = useRef([]);

  useFrame((state) => {
    if (!active) return;

    // Animate floating servers
    serversRef.current.forEach((server, i) => {
      if (server) {
        const time = state.clock.elapsedTime;
        server.position.y = Math.sin(time + i * 0.5) * 0.15;
        server.rotation.y = time * 0.3 + i;
      }
    });
  });

  if (!active) return null;

  return (
    <ModuleMicroScene moduleId="saas" active={active} position={[0, 1.3, 0]}>
      {/* Central cloud core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Floating server nodes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            ref={(el) => (serversRef.current[i] = el)}
            position={[x, 0, z]}
          >
            <boxGeometry args={[0.15, 0.2, 0.15]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* Connection lines */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, 0, z),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`line-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color="#00E5FF" transparent opacity={0.4} />
          </line>
        );
      })}

      {/* Orbiting data particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={`particle-${i}`} position={[x, 0, z]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
        );
      })}

      {/* Module label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color="#00E5FF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        SaaS Solutions
      </Text>

      {/* Point light */}
      <pointLight position={[0, 0, 0]} color="#00E5FF" intensity={1.5} distance={3} />
    </ModuleMicroScene>
  );
}
