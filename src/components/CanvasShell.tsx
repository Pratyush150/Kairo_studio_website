import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { KairoLogo } from './KairoLogo';
import { ParticleField } from './ParticleField';
import { Entity } from './Entity';
import { useSceneStore } from '../lib/sceneAPI';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function CanvasShell() {
  const { entities, sceneState, performanceMode } = useSceneStore();
  const reducedMotion = useReducedMotion();
  const controlsRef = useRef<any>(null);

  // SSR guard
  if (typeof window === 'undefined') return null;

  // Disable controls during transitions
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = sceneState === 'idle';
    }
  }, [sceneState]);

  return (
    <Canvas
      shadows
      dpr={[1, performanceMode === 'high' ? 2 : 1]}
      camera={{
        position: [0, 0, 120],
        fov: 45,
        near: 0.1,
        far: 2000,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      {/* Background color */}
      <color attach="background" args={['#020312']} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#020312', 400, 1500]} />

      {/* Lights */}
      <ambientLight intensity={0.3} color="#160B33" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#FFFFFF" castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#A854FF" />

      <Suspense fallback={null}>
        {/* Main scene elements */}
        <KairoLogo />
        <ParticleField count={performanceMode === 'low' ? 3000 : 8000} />

        {/* Entities */}
        {entities.map((entity) => (
          <Entity key={entity.id} data={entity} />
        ))}

        {/* Camera controls */}
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={80}
          maxDistance={200}
          rotateSpeed={reducedMotion ? 0 : 0.5}
          zoomSpeed={0.8}
          dampingFactor={0.05}
          enabled={sceneState === 'idle'}
        />

        {/* Post-processing effects */}
        {performanceMode !== 'low' && (
          <EffectComposer>
            <Bloom
              intensity={performanceMode === 'high' ? 1.4 : 0.9}
              kernelSize={6}
              luminanceThreshold={0.12}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            {performanceMode === 'high' && (
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.001, 0.002)}
              />
            )}
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
