import React, { forwardRef, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Plate = forwardRef(({ plate, index, isActive, onClick, reducedMotion, showTooltip }, ref) => {
  const shadowRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Hexagon shape
  const hexShape = new THREE.Shape();
  const radius = 1;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      hexShape.moveTo(x, y);
    } else {
      hexShape.lineTo(x, y);
    }
  }
  hexShape.closePath();

  // Micro tilt on hover
  useFrame(() => {
    if (ref.current && isActive && hovered && !reducedMotion) {
      const tiltX = (Math.random() - 0.5) * 0.04;
      const tiltZ = (Math.random() - 0.5) * 0.04;
      ref.current.rotation.x += (tiltX - ref.current.rotation.x) * 0.1;
      ref.current.rotation.z += (tiltZ - ref.current.rotation.z) * 0.1;
    } else if (ref.current) {
      ref.current.rotation.x += (0 - ref.current.rotation.x) * 0.1;
      ref.current.rotation.z += (0 - ref.current.rotation.z) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {/* Hexagonal plate */}
      <mesh
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <extrudeGeometry
          args={[
            hexShape,
            {
              depth: 0.1,
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 3
            }
          ]}
        />
        <meshStandardMaterial
          color={isActive ? '#2a3f5f' : '#1a2332'}
          metalness={0.6}
          roughness={0.4}
          emissive={isActive ? '#4a90e2' : '#1a2332'}
          emissiveIntensity={isActive ? 0.2 : 0.05}
        />
      </mesh>

      {/* Plate content */}
      <group position={[0, 0, 0.06]}>
        {/* Title */}
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.18}
          color={isActive ? '#ffffff' : '#b0b8c4'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.6}
        >
          {plate.title}
        </Text>

        {/* Short description */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.09}
          color={isActive ? '#e0e4ea' : '#7a8396'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
          lineHeight={1.3}
        >
          {plate.short}
        </Text>

        {/* Icon placeholder */}
        <mesh position={[0, -0.4, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial
            color="#4a90e2"
            emissive="#4a90e2"
            emissiveIntensity={isActive ? 0.6 : 0.3}
          />
        </mesh>

        {/* Number indicator */}
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.12}
          color="#4a90e2"
          anchorX="center"
          anchorY="middle"
        >
          {index + 1}
        </Text>
      </group>

      {/* Shadow */}
      <mesh
        ref={shadowRef}
        position={[0, -0.48, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isActive ? 0.3 : 0.15}
        />
      </mesh>

      {/* Tooltip */}
      {showTooltip && isActive && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Click to open
        </Text>
      )}
    </group>
  );
});

Plate.displayName = 'Plate';

export default Plate;
