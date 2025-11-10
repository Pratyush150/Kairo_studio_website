/**
 * Morphing Canvas Shell
 * Main r3f Canvas container with scene setup
 */

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Preload } from '@react-three/drei';
import { useResponsive } from '../hooks/useResponsive';
import { useSceneStore } from '../lib/sceneAPI';
import { performance as perfSettings } from '../lib/tokens';
import { KairoLogo } from './KairoLogo';
import { MorphManager } from './MorphManager';
import { ParticleLayer } from './ParticleLayer';
import { Effects } from './Effects';
import { CameraRig } from './CameraRig';
import { PerformanceMonitor } from './PerformanceMonitor';

export function CanvasShell() {
  const { isMobile, isTablet } = useResponsive();
  const performanceMode = useSceneStore((s) => s.performanceMode);

  // SSR guard
  if (typeof window === 'undefined') return null;

  // Calculate pixel ratio based on device and performance mode
  const pixelRatio = isMobile || isTablet
    ? perfSettings.pixelRatio.mobile
    : performanceMode === 'low'
    ? 1
    : Math.min(window.devicePixelRatio, perfSettings.pixelRatio.desktop);

  return (
    <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1 }}>
      <Canvas
        camera={{
          position: [0, 0, 120],
          fov: 45,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={pixelRatio}
        shadows={performanceMode === 'high'}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        {/* Background color */}
        <color attach="background" args={['#06070A']} />

        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          color="#ffffff"
        />
        <pointLight
          position={[-10, -10, -5]}
          intensity={0.3}
          color="#00E5FF"
        />

        {/* Main Scene */}
        <Suspense fallback={null}>
          {/* Performance Monitor */}
          <PerformanceMonitor />

          {/* Camera System */}
          <CameraRig>
            {/* Logo */}
            <KairoLogo />

            {/* Morph Shapes */}
            <MorphManager />

            {/* Particle Layer */}
            <ParticleLayer />
          </CameraRig>

          {/* Post-processing Effects */}
          <Effects />

          {/* Preload assets */}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
