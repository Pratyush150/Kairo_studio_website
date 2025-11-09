import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

export function KairoLogo() {
  const logoGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const { sceneState } = useSceneStore();

  // Core material with emissive properties
  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xa854ff,
        emissive: 0xa854ff,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  );

  // Glow material
  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xa854ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      }),
    []
  );

  // Breathing pulse animation
  useFrame((state) => {
    if (!logoGroupRef.current || sceneState === 'boom') return;

    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
    logoGroupRef.current.scale.setScalar(breathe);

    // Update emissive intensity
    if (coreMeshRef.current) {
      const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  // Handle pulse event
  useEffect(() => {
    const handlePulse = (event: Event) => {
      const customEvent = event as CustomEvent;
      const intensity = customEvent.detail?.intensity || 1.5;

      if (coreMeshRef.current) {
        const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat, {
          emissiveIntensity: intensity,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      }

      if (logoGroupRef.current) {
        gsap.to(logoGroupRef.current.scale, {
          x: 1.3,
          y: 1.3,
          z: 1.3,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      }
    };

    window.addEventListener('kairo:logo-pulse', handlePulse);
    return () => window.removeEventListener('kairo:logo-pulse', handlePulse);
  }, []);

  // Handle explode event
  useEffect(() => {
    const handleExplode = () => {
      if (!logoGroupRef.current) return;

      // Flash bright
      if (coreMeshRef.current) {
        const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat, {
          emissiveIntensity: 3.0,
          duration: 0.1,
          onComplete: () => {
            gsap.to(mat, {
              emissiveIntensity: 0,
              duration: 0.3,
            });
          },
        });
      }

      // Scale down and fade
      gsap.to(logoGroupRef.current.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: 0.3,
        ease: 'power3.in',
      });

      if (glowMeshRef.current) {
        const glowMat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        gsap.to(glowMat, {
          opacity: 0,
          duration: 0.3,
        });
      }

      // Create explosion particles
      createExplosionParticles();
    };

    window.addEventListener('kairo:logo-explode', handleExplode);
    return () => window.removeEventListener('kairo:logo-explode', handleExplode);
  }, []);

  const createExplosionParticles = () => {
    // This would create a burst of particles
    // For now, we'll use a custom event that the ParticleField can listen to
    window.dispatchEvent(
      new CustomEvent('kairo:create-explosion', {
        detail: { position: [0, 0, 0], count: 500 },
      })
    );
  };

  // Reset on state change
  useEffect(() => {
    if (sceneState === 'idle' && logoGroupRef.current) {
      gsap.to(logoGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      if (coreMeshRef.current) {
        const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
        gsap.to(mat, {
          emissiveIntensity: 0.5,
          duration: 0.5,
        });
      }

      if (glowMeshRef.current) {
        const glowMat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        gsap.to(glowMat, {
          opacity: 0.3,
          duration: 0.5,
        });
      }
    }
  }, [sceneState]);

  if (sceneState === 'boom' || sceneState === 'idle' || sceneState === 'transition') {
    // Hide logo after boom
    return null;
  }

  return (
    <group ref={logoGroupRef} position={[0, 0, 0]}>
      {/* Core sphere */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[15, 32, 32]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      {/* Glow sphere (larger, behind) */}
      <mesh ref={glowMeshRef} scale={1.3}>
        <sphereGeometry args={[15, 32, 32]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Point light for illumination */}
      <pointLight intensity={2} distance={100} color={0xa854ff} />
    </group>
  );
}
