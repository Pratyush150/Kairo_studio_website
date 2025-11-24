import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BrainScene from './BrainScene';
import LowResPlaceholder from './LowResPlaceholder';
import FallbackHero from './FallbackHero';

export default function CanvasRoot() {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('[CanvasRoot] WebGL not supported, using fallback');
      setUseFallback(true);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.log('[CanvasRoot] Reduced motion detected, using fallback');
      setUseFallback(true);
      return;
    }

    // Device capability detection (basic)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

    if (isMobile && hasLowMemory) {
      console.log('[CanvasRoot] Low-end device detected, consider fallback');
      // For now, we'll still try to render but with lower quality
    }

    console.log('[CanvasRoot] WebGL supported, rendering 3D scene');
  }, []);

  // Show fallback hero if needed
  if (useFallback) {
    return <FallbackHero />;
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        console.log('[CanvasRoot] Canvas created successfully');
        console.log('[CanvasRoot] Renderer:', gl.capabilities);
      }}
    >
      <Suspense fallback={<LowResPlaceholder />}>
        <BrainScene />
      </Suspense>
    </Canvas>
  );
}
