/**
 * Star Burst Effect
 * Breaking star that bursts and spawns element
 * Spec: 700ms duration, compress → explode → spawn element
 * GPU instanced particles (max 240 desktop, 160 mobile)
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface ShardParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

export function StarBurst() {
  const performanceMode = useSceneStore((s) => s.performanceMode);
  const isMobile = useSceneStore((s) => s.isMobile);

  const [starActive, setStarActive] = useState(false);
  const [starPosition, setStarPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [shardsActive, setShardsActive] = useState(false);

  const starRef = useRef<THREE.Mesh>(null);
  const shardInstanceRef = useRef<THREE.InstancedMesh>(null);
  const shardParticles = useRef<ShardParticle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Star geometry
  const starGeometry = useMemo(() => {
    return new THREE.SphereGeometry(12, 16, 16);
  }, []);

  // Star material
  const starMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#FFD700',
      transparent: true,
      opacity: 1,
    });
  }, []);

  // Shard geometry (small quads for GPU instancing)
  const shardGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 2);
  }, []);

  // Shard material
  const shardMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#FFD700',
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Max shard count
  const maxShards = useMemo(() => {
    return isMobile ? 160 : 240;
  }, [isMobile]);

  // ===== EVENT: Create Star =====
  useEffect(() => {
    const handleCreateStar = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { position } = customEvent.detail;

      console.log('[StarBurst] Creating star at', position);
      setStarPosition(position);
      setStarActive(true);

      // Reset star
      if (starRef.current) {
        starRef.current.scale.set(1, 1, 1);
        if (starRef.current.material instanceof THREE.MeshBasicMaterial) {
          starRef.current.material.opacity = 1;
          starRef.current.material.emissiveIntensity = 0;
        }
      }
    };

    window.addEventListener('kairo:create-star', handleCreateStar);
    return () => window.removeEventListener('kairo:create-star', handleCreateStar);
  }, []);

  // ===== EVENT: Compress Star =====
  useEffect(() => {
    const handleStarCompress = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { scale, emissiveIntensity, duration } = customEvent.detail;

      console.log('[StarBurst] Compressing star');

      if (starRef.current) {
        gsap.to(starRef.current.scale, {
          x: scale.x,
          y: scale.y,
          z: scale.z,
          duration,
          ease: 'cubic-bezier(.34,1.56,.64,1)',
        });

        if (starRef.current.material instanceof THREE.MeshBasicMaterial) {
          gsap.to(starRef.current.material, {
            emissiveIntensity,
            duration,
            ease: 'cubic-bezier(.34,1.56,.64,1)',
          });
        }
      }
    };

    window.addEventListener('kairo:star-compress', handleStarCompress);
    return () => window.removeEventListener('kairo:star-compress', handleStarCompress);
  }, []);

  // ===== EVENT: Explode Star =====
  useEffect(() => {
    const handleStarExplode = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { scale, duration } = customEvent.detail;

      console.log('[StarBurst] Exploding star');

      if (starRef.current) {
        gsap.to(starRef.current.scale, {
          x: scale.x,
          y: scale.y,
          z: scale.z,
          duration,
          ease: 'cubic-bezier(.34,1.56,.64,1)',
        });

        if (starRef.current.material instanceof THREE.MeshBasicMaterial) {
          gsap.to(starRef.current.material, {
            emissiveIntensity: 2.0,
            duration: duration * 0.3,
            ease: 'power4.out',
          });
        }
      }
    };

    window.addEventListener('kairo:star-explode', handleStarExplode);
    return () => window.removeEventListener('kairo:star-explode', handleStarExplode);
  }, []);

  // ===== EVENT: Emit Shards =====
  useEffect(() => {
    const handleEmitShards = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { position, count } = customEvent.detail;

      console.log('[StarBurst] Emitting', count, 'shard particles');

      // Create particles
      const particles: ShardParticle[] = [];
      const actualCount = Math.min(count, maxShards);

      for (let i = 0; i < actualCount; i++) {
        // Random direction
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 20 + Math.random() * 30;

        const velocity = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        );

        particles.push({
          position: new THREE.Vector3(position[0], position[1], position[2]),
          velocity,
          lifetime: 0,
          maxLifetime: 900, // 900ms fade per spec
        });
      }

      shardParticles.current = particles;
      setShardsActive(true);

      // Auto-deactivate after 1000ms
      setTimeout(() => {
        setShardsActive(false);
        shardParticles.current = [];
      }, 1000);
    };

    window.addEventListener('kairo:emit-shards', handleEmitShards);
    return () => window.removeEventListener('kairo:emit-shards', handleEmitShards);
  }, [maxShards]);

  // ===== EVENT: Fade Star =====
  useEffect(() => {
    const handleStarFade = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { duration } = customEvent.detail;

      console.log('[StarBurst] Fading star');

      if (starRef.current && starRef.current.material instanceof THREE.MeshBasicMaterial) {
        gsap.to(starRef.current.material, {
          opacity: 0,
          duration,
          ease: 'power2.out',
          onComplete: () => {
            setStarActive(false);
          },
        });
      }
    };

    window.addEventListener('kairo:star-fade', handleStarFade);
    return () => window.removeEventListener('kairo:star-fade', handleStarFade);
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    // Update shard particles
    if (shardsActive && shardInstanceRef.current) {
      const particles = shardParticles.current;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Update lifetime
        particle.lifetime += delta * 1000; // Convert to ms

        if (particle.lifetime >= particle.maxLifetime) {
          // Particle dead
          continue;
        }

        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Apply gravity
        particle.velocity.y -= 9.8 * delta;

        // Fade based on lifetime
        const lifeProgress = particle.lifetime / particle.maxLifetime;
        const opacity = 1 - lifeProgress;

        // Set instance matrix
        dummy.position.copy(particle.position);
        dummy.scale.setScalar(1 - lifeProgress * 0.5); // Shrink as fades
        dummy.updateMatrix();
        shardInstanceRef.current.setMatrixAt(i, dummy.matrix);

        // Set color/opacity (would need custom shader for per-instance opacity)
        // For now we'll use material opacity which affects all
      }

      shardInstanceRef.current.instanceMatrix.needsUpdate = true;

      // Update material opacity based on oldest particle
      if (particles.length > 0) {
        const avgLifeProgress = particles.reduce((sum, p) => sum + p.lifetime / p.maxLifetime, 0) / particles.length;
        const material = shardInstanceRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, 1 - avgLifeProgress);
      }
    }

    // Make star pulse slightly
    if (starActive && starRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      starRef.current.scale.x += pulse;
      starRef.current.scale.y += pulse;
      starRef.current.scale.z += pulse;
    }
  });

  return (
    <>
      {/* Star */}
      {starActive && (
        <mesh ref={starRef} position={starPosition} geometry={starGeometry} material={starMaterial}>
          <pointLight intensity={2} distance={80} color="#FFD700" />
        </mesh>
      )}

      {/* Shard particles (GPU instanced) */}
      {shardsActive && (
        <instancedMesh
          ref={shardInstanceRef}
          args={[shardGeometry, shardMaterial, maxShards]}
          frustumCulled={false}
        />
      )}
    </>
  );
}
