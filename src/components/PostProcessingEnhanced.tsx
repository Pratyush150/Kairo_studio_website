import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
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

      {/* Vignette effect - Cinematic dark edges (only in high mode) */}
      {performanceMode === 'high' && (
        <Vignette
          offset={0.35}
          darkness={0.4}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
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
