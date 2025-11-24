import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import ModuleMicroScene from './ModuleMicroScene';

/**
 * Automation MicroScene
 * Workflow visualization with connected gears and flow
 */
export default function AutomationMicroScene({ active }) {
  const gearsRef = useRef([]);
  const flowParticlesRef = useRef([]);

  useFrame((state) => {
    if (!active) return;

    const time = state.clock.elapsedTime;

    // Rotate gears
    gearsRef.current.forEach((gear, i) => {
      if (gear) {
        gear.rotation.z = time * (i % 2 === 0 ? 1 : -1);
      }
    });

    // Animate flow particles
    flowParticlesRef.current.forEach((particle, i) => {
      if (particle) {
        const progress = (time * 0.5 + i * 0.2) % 1;
        const x = (progress - 0.5) * 1.6;
        particle.position.x = x;
        particle.position.y = Math.sin(progress * Math.PI) * 0.2;
      }
    });
  });

  if (!active) return null;

  return (
    <ModuleMicroScene moduleId="automation" active={active} position={[1.2, -0.3, 0]}>
      {/* Gear system */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh
          key={i}
          ref={(el) => (gearsRef.current[i] = el)}
          position={[x, 0, 0]}
        >
          <torusGeometry args={[0.15, 0.05, 8, 6]} />
          <meshStandardMaterial
            color="#FF00E5"
            emissive="#FF00E5"
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Flow path particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <mesh
          key={`flow-${i}`}
          ref={(el) => (flowParticlesRef.current[i] = el)}
          position={[0, 0, 0.2]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#FF00E5" />
        </mesh>
      ))}

      {/* Central processor core */}
      <mesh position={[0, 0, -0.2]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#FF00E5"
          emissive="#FF00E5"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Input/Output nodes */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={`io-${i}`} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
          <meshStandardMaterial
            color="#FF00E5"
            emissive="#FF00E5"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Connection beams */}
      {[-0.4, 0.4].map((x, i) => {
        const points = [
          new THREE.Vector3(x - 0.4, 0, 0),
          new THREE.Vector3(x + 0.4, 0, 0),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`beam-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color="#FF00E5" transparent opacity={0.5} linewidth={2} />
          </line>
        );
      })}

      {/* Module label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color="#FF00E5"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Process Automation
      </Text>

      {/* Point light */}
      <pointLight position={[0, 0, 0]} color="#FF00E5" intensity={1.5} distance={3} />
    </ModuleMicroScene>
  );
}
