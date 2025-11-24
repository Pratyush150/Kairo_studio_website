import React from 'react';
import { OrbitControls } from '@react-three/drei';
import BrainCore from './BrainCore';
import PerformanceStats from './PerformanceStats';

export default function BrainScene() {
  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00E5FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#FF00E5" />
      <pointLight position={[0, -10, 0]} intensity={0.3} color="#FFE500" />

      {/* Subtle directional light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Brain Core Component with LOD */}
      <BrainCore position={[0, 0, 0]} />

      {/* Performance Stats Overlay */}
      <PerformanceStats visible={true} />

      {/* Camera Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
      />
    </>
  );
}
