import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Universe = ({ reducedMotion }) => {
  const starsRef1 = useRef();
  const starsRef2 = useRef();
  const nebulaRef = useRef();

  // Generate random star positions
  const stars1 = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  const stars2 = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  // Animate stars with parallax
  useFrame((state) => {
    if (!reducedMotion) {
      if (starsRef1.current) {
        starsRef1.current.rotation.y += 0.0002;
        starsRef1.current.rotation.x += 0.0001;
      }
      if (starsRef2.current) {
        starsRef2.current.rotation.y += 0.0004;
        starsRef2.current.rotation.x += 0.0002;
      }
      // Nebula pulse
      if (nebulaRef.current) {
        const pulse = Math.sin(state.clock.elapsedTime * 0.15) * 0.18 + 1;
        nebulaRef.current.material.opacity = 0.15 * pulse;
      }
    }
  });

  return (
    <group>
      {/* Star layer 1 (slower) */}
      <Points ref={starsRef1} positions={stars1}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>

      {/* Star layer 2 (faster) */}
      <Points ref={starsRef2} positions={stars2}>
        <PointMaterial
          transparent
          color="#4a90e2"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>

      {/* Logo nebula behind hub */}
      <mesh ref={nebulaRef} position={[0, 0, -8]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Background gradient plane */}
      <mesh position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#06070a" />
      </mesh>
    </group>
  );
};

export default Universe;
