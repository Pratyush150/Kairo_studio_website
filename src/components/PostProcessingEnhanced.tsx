import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, DepthOfField, Vignette, ToneMapping, GodRays as GodRaysEffect } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface PostProcessingEnhancedProps {
  enabled?: boolean;
  lightSource?: THREE.Mesh | THREE.PointLight | null;
}

export function PostProcessingEnhanced({ enabled = true, lightSource }: PostProcessingEnhancedProps) {
  // Use individual selectors to minimize re-renders
  const performanceMode = useSceneStore((state) => state.performanceMode);
  const sceneState = useSceneStore((state) => state.sceneState);

  const { scene } = useThree();
  const chromaticAberrationRef = useRef<any>(null);
  const chromaticOffsetRef = useRef(new THREE.Vector2(0.001, 0.002));
  const [chromaticOffset, setChromaticOffset] = useState(new THREE.Vector2(0.001, 0.002));
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);
  const explosionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Find the sun mesh in the scene for GodRays
  useEffect(() => {
    const timer = setTimeout(() => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.SphereGeometry) {
          // Check if it has the transparent material (our sun mesh)
          const material = object.material as THREE.MeshBasicMaterial;
          if (material && material.transparent && material.opacity === 0) {
            console.log('[PostProcessing] Found sun mesh for GodRays');
            setSunMesh(object);
          }
        }
      });
    }, 1000); // Wait for scene to load
    return () => clearTimeout(timer);
  }, [scene]);

  // Handle explosion sequence chromatic aberration spike
  useEffect(() => {
    const handleExplosion = () => {
      if (!chromaticAberrationRef.current) return;

      console.log('[PostProcessing] Chromatic aberration spike!');

      // Kill any existing timeline
      if (explosionTimelineRef.current) {
        explosionTimelineRef.current.kill();
      }

      // Spike up to [0.015, 0.020] then decay
      // Use a proxy object to avoid stale closure
      const offsetProxy = {
        x: chromaticOffsetRef.current.x,
        y: chromaticOffsetRef.current.y,
      };

      const timeline = gsap.timeline();
      explosionTimelineRef.current = timeline;

      timeline.to(offsetProxy, {
        x: 0.015,
        y: 0.020,
        duration: 0.12, // Quick spike
        ease: 'power2.out',
        onUpdate: () => {
          chromaticOffsetRef.current.set(offsetProxy.x, offsetProxy.y);
          setChromaticOffset(new THREE.Vector2(offsetProxy.x, offsetProxy.y));
        },
      });

      timeline.to(offsetProxy, {
        x: 0.001,
        y: 0.002,
        duration: 0.36, // Slow decay
        ease: 'power2.inOut',
        onUpdate: () => {
          chromaticOffsetRef.current.set(offsetProxy.x, offsetProxy.y);
          setChromaticOffset(new THREE.Vector2(offsetProxy.x, offsetProxy.y));
        },
        onComplete: () => {
          explosionTimelineRef.current = null;
        },
      });
    };

    window.addEventListener('kairo:explosion-sequence', handleExplosion);
    return () => {
      window.removeEventListener('kairo:explosion-sequence', handleExplosion);
      // Cleanup on unmount
      if (explosionTimelineRef.current) {
        explosionTimelineRef.current.kill();
      }
    };
  }, []); // Removed chromaticOffset from dependencies

  if (!enabled || performanceMode === 'low') return null;

  return (
    <EffectComposer>
      {/* Bloom effect - Optimized */}
      <Bloom
        intensity={performanceMode === 'high' ? 1.0 : 0.5}
        kernelSize={performanceMode === 'high' ? 4 : 2}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.8}
        radius={performanceMode === 'high' ? 0.5 : 0.35}
        mipmapBlur={performanceMode === 'high'}
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

      {/* Depth of Field during transitions - Reduced quality for performance */}
      {performanceMode === 'high' && sceneState === 'transition' && (
        <DepthOfField
          focusDistance={0.05}
          focalLength={0.015}
          bokehScale={2.0}
          height={360}
        />
      )}

      {/* God Rays - Volumetric lighting (DISABLED for performance - re-enable manually if needed) */}
      {false && performanceMode === 'high' && sunMesh && sceneState === 'idle' && (
        <GodRaysEffect
          sun={sunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={40}
          density={0.94}
          decay={0.90}
          weight={0.3}
          exposure={0.5}
          clampMax={1}
          kernelSize={KernelSize.VERY_SMALL}
          blur={false}
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
