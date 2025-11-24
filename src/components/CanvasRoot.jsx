import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import BrainScene from './BrainScene';
// import FallbackHero from './FallbackHero';

export default function CanvasRoot() {
  // const isLow = false; // TODO: Implement via QualityManager
  // if (isLow) return <FallbackHero />;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
    >
      <Suspense
        fallback={
          <Html center>
            <div style={{ color: '#00E5FF', fontSize: '20px' }}>
              Loading Cerebral Machine...
            </div>
          </Html>
        }
      >
        <BrainScene />
      </Suspense>
    </Canvas>
  );
}
