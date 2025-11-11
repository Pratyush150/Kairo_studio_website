/**
 * Panel Shards
 * Particles that converge to form panel surface
 * Spec: GPU instanced quads that converge then fade
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';

interface ShardParticle {
  startPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  progress: number;
}

export function PanelShards() {
  const isMobile = useSceneStore((s) => s.isMobile);
  const performanceMode = useSceneStore((s) => s.performanceMode);

  const [isActive, setIsActive] = useState(false);
  const [centerPosition, setCenterPosition] = useState<[number, number, number]>([0, 0, 0]);

  const shardInstanceRef = useRef<THREE.InstancedMesh>(null);
  const shardParticles = useRef<ShardParticle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(0);

  // Shard geometry
  const shardGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(1.5, 1.5);
  }, []);

  // Shard material
  const shardMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#A854FF',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Max shard count (ULTRA MINIMAL for performance)
  const maxShards = useMemo(() => {
    if (isMobile) return 15; // Drastically reduced from 40
    return performanceMode === 'low' ? 15 : performanceMode === 'medium' ? 25 : 35; // Drastically reduced from 50/80/120
  }, [isMobile, performanceMode]);

  // Listen for emit-panel-shards event
  useEffect(() => {
    const handleEmitShards = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { position, count } = customEvent.detail;

      console.log('[PanelShards] Emitting', count, 'panel shards');

      setCenterPosition(position);
      setIsActive(true);
      startTime.current = Date.now();

      // Create particles in burst formation
      const particles: ShardParticle[] = [];
      const actualCount = Math.min(count, maxShards);

      for (let i = 0; i < actualCount; i++) {
        // Random start position (burst outward)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 30 + Math.random() * 20;

        const startPos = new THREE.Vector3(
          position[0] + Math.sin(phi) * Math.cos(theta) * radius,
          position[1] + Math.sin(phi) * Math.sin(theta) * radius,
          position[2] + Math.cos(phi) * radius
        );

        // Target position (panel surface in grid)
        const gridX = (i % 12) - 6; // 12 columns
        const gridY = Math.floor(i / 12) - 7.5; // Rows

        const targetPos = new THREE.Vector3(
          position[0] + gridX * 3,
          position[1] + gridY * 2,
          position[2] + 20 // In front of element
        );

        particles.push({
          startPosition: startPos,
          targetPosition: targetPos,
          progress: 0,
        });
      }

      shardParticles.current = particles;

      // Auto-deactivate after 1200ms
      setTimeout(() => {
        setIsActive(false);
        shardParticles.current = [];
      }, 1200);
    };

    window.addEventListener('kairo:emit-panel-shards', handleEmitShards);
    return () => window.removeEventListener('kairo:emit-panel-shards', handleEmitShards);
  }, [maxShards]);

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive || !shardInstanceRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const particles = shardParticles.current;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Update progress (0 to 1 over 800ms)
      particle.progress = Math.min(elapsed / 800, 1);

      // Ease function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - particle.progress, 3);

      // Interpolate position
      const currentPos = particle.startPosition.clone().lerp(particle.targetPosition, eased);

      // Set instance matrix
      dummy.position.copy(currentPos);
      dummy.rotation.x = Math.sin(state.clock.elapsedTime * 4 + i) * 0.2;
      dummy.rotation.y = Math.cos(state.clock.elapsedTime * 3 + i) * 0.2;
      dummy.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.3);
      dummy.updateMatrix();

      shardInstanceRef.current.setMatrixAt(i, dummy.matrix);
    }

    shardInstanceRef.current.instanceMatrix.needsUpdate = true;

    // Fade out after convergence (800-1200ms)
    if (elapsed > 800) {
      const fadeProgress = (elapsed - 800) / 400; // 0 to 1 over 400ms
      const material = shardInstanceRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.8 * (1 - fadeProgress));
    }
  });

  if (!isActive) return null;

  return (
    <instancedMesh
      ref={shardInstanceRef}
      args={[shardGeometry, shardMaterial, maxShards]}
      frustumCulled={false}
    />
  );
}
