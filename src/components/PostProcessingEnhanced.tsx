import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, DepthOfField, Vignette, ToneMapping, GodRays as GodRaysEffect } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface PostProcessingEnhancedProps {
  enabled?: boolean;
}

export function PostProcessingEnhanced({ enabled = true }: PostProcessingEnhancedProps) {
  const { performanceMode, sceneState } = useSceneStore();
  const chromaticAberrationRef = useRef<any>(null);
  const [chromaticOffset, setChromaticOffset] = useState(new THREE.Vector2(0.001, 0.002));

  // Handle explosion sequence chromatic aberration spike
  useEffect(() => {
    const handleExplosion = () => {
      if (!chromaticAberrationRef.current) return;

      console.log('[PostProcessing] Chromatic aberration spike!');

      // Spike up to [0.015, 0.020] then decay
      const timeline = gsap.timeline();

      timeline.to(chromaticOffset, {
        x: 0.015,
        y: 0.020,
        duration: 0.12, // Quick spike
        ease: 'power2.out',
        onUpdate: () => {
          setChromaticOffset(new THREE.Vector2(chromaticOffset.x, chromaticOffset.y));
        },
      });

      timeline.to(chromaticOffset, {
        x: 0.001,
        y: 0.002,
        duration: 0.36, // Slow decay
        ease: 'power2.inOut',
        onUpdate: () => {
          setChromaticOffset(new THREE.Vector2(chromaticOffset.x, chromaticOffset.y));
        },
      });
    };

    window.addEventListener('kairo:explosion-sequence', handleExplosion);
    return () => window.removeEventListener('kairo:explosion-sequence', handleExplosion);
  }, [chromaticOffset]);

  if (!enabled || performanceMode === 'low') return null;

  return (
    <EffectComposer>
      {/* Bloom effect */}
      <Bloom
        intensity={performanceMode === 'high' ? 1.25 : 0.6}
        kernelSize={6}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.9}
        radius={performanceMode === 'high' ? 0.6 : 0.4}
        mipmapBlur
      />

      {/* Film grain effect - Subtle noise overlay for cinematic feel */}
      {performanceMode !== 'low' && (
        <Noise
          premultiply
          blendFunction={BlendFunction.OVERLAY}
          opacity={0.02}
        />
      )}

      {/* Vignette effect - Cinematic dark edges */}
      {performanceMode !== 'low' && (
        <Vignette
          offset={0.3}
          darkness={0.5}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {/* Motion blur during transitions */}
      {performanceMode === 'high' && sceneState === 'transition' && (
        <DepthOfField
          focusDistance={0.05}
          focalLength={0.015}
          bokehScale={3.0}
          height={480}
        />
      )}

      {/* Chromatic aberration with dynamic offset */}
      {performanceMode === 'high' && (
        <ChromaticAberration
          ref={chromaticAberrationRef}
          blendFunction={BlendFunction.NORMAL}
          offset={chromaticOffset}
          radialModulation={false}
          modulationOffset={0}
        />
      )}
    </EffectComposer>
  );
}
