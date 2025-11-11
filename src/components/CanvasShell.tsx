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
import { CorridorTransit } from './CorridorTransit';
import { TimelineOrchestrator } from './TimelineOrchestrator';
import { TunnelEffect } from './TunnelEffect';
import { StarBurst } from './StarBurst';
import { RadialRings } from './RadialRings';
import { PanelShards } from './PanelShards';

export function CanvasShell() {
  const { isMobile, isTablet } = useResponsive();
  const performanceMode = useSceneStore((s) => s.performanceMode);

  // SSR guard
  if (typeof window === 'undefined') return null;

  // Calculate pixel ratio based on device and performance mode - ULTRA LOW for performance
  const pixelRatio = isMobile || isTablet
    ? 0.5 // Ultra low for mobile (reduced from 0.75)
    : performanceMode === 'low'
    ? 0.6 // Ultra low for desktop low mode
    : performanceMode === 'medium'
    ? 0.75 // Reduced for medium
    : Math.min(window.devicePixelRatio, perfSettings.pixelRatio.desktop);

  // Disable antialiasing on low/medium performance modes
  const antialias = performanceMode === 'high';

  return (
    <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1 }}>
      <Canvas
        camera={{
          position: [0, 0, 180],
          fov: 50,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: false, // Disabled for performance
          alpha: true,
          powerPreference: 'low-power', // Always use low-power
        }}
        dpr={pixelRatio}
        shadows={false} // Disabled completely for performance
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        {/* Background color */}
        <color attach="background" args={['#06070A']} />

        {/* Lighting - ULTRA MINIMAL for performance */}
        <ambientLight intensity={0.8} />
        {/* All other lights disabled for performance */}

        {/* Main Scene */}
        <Suspense fallback={null}>
          {/* Timeline Orchestrator (wires timelines to scene) */}
          <TimelineOrchestrator />

          {/* Performance Monitor */}
          <PerformanceMonitor />

          {/* Camera System */}
          <CameraRig>
            {/* Logo */}
            <KairoLogo />

            {/* Morph Shapes (single active element) */}
            <MorphManager />

            {/* Particle Layer */}
            <ParticleLayer />

            {/* Transit Effects */}
            <TunnelEffect />

            {/* Star Burst Effect */}
            <StarBurst />

            {/* Radial Rings (Shock Waves) */}
            <RadialRings />

            {/* Panel Shards (Convergence) */}
            <PanelShards />

            {/* Legacy Corridor Transit (can be removed) */}
            {/* <CorridorTransit /> */}
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
