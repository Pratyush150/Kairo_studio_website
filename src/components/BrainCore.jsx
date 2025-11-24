import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createLoaders } from '../lib/loaders';
import { getQualityManager } from '../utils/perf';

/**
 * BrainCore Component
 * Manages the central brain model with progressive LOD loading
 */
export default function BrainCore({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const { gl } = useThree();

  const [currentLOD, setCurrentLOD] = useState(0);
  const [loadersReady, setLoadersReady] = useState(false);
  const [targetLOD, setTargetLOD] = useState(2); // Ultimate target is LOD 2

  const qualityManager = getQualityManager();

  // Initialize loaders on mount
  useEffect(() => {
    try {
      const loaders = createLoaders(gl);
      console.log('[BrainCore] Loaders initialized:', loaders);
      setLoadersReady(true);
    } catch (error) {
      console.error('[BrainCore] Error initializing loaders:', error);
    }
  }, [gl]);

  // Progressive LOD loading: LOD0 → LOD1 → LOD2
  useEffect(() => {
    // Start with LOD 0 immediately
    setCurrentLOD(0);
    console.log('[BrainCore] Starting with LOD 0 (low detail)');

    // Upgrade to LOD 1 after 2 seconds (simulating asset load time)
    const lod1Timer = setTimeout(() => {
      console.log('[BrainCore] Upgrading to LOD 1 (medium detail)');
      setCurrentLOD(1);
    }, 2000);

    // Upgrade to LOD 2 after 4 seconds (if performance allows)
    const lod2Timer = setTimeout(() => {
      const stats = qualityManager.getStats();
      if (stats.average >= 40) {
        console.log('[BrainCore] Upgrading to LOD 2 (high detail)');
        setCurrentLOD(2);
      } else {
        console.log('[BrainCore] Staying at LOD 1 (performance constraint)');
      }
    }, 4000);

    return () => {
      clearTimeout(lod1Timer);
      clearTimeout(lod2Timer);
    };
  }, [qualityManager]);

  // Animate rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // LOD-specific geometry parameters
  const lodParams = useMemo(() => {
    const params = {
      0: { // Low detail
        coreDetail: 1,
        outerDetail: 1,
        innerDetail: 1,
        ringSegments: 16,
        moduleDetail: 8,
        folds: 2,
      },
      1: { // Medium detail
        coreDetail: 2,
        outerDetail: 2,
        innerDetail: 2,
        ringSegments: 32,
        moduleDetail: 16,
        folds: 4,
      },
      2: { // High detail
        coreDetail: 3,
        outerDetail: 3,
        innerDetail: 3,
        ringSegments: 64,
        moduleDetail: 24,
        folds: 8,
      },
    };
    return params[currentLOD];
  }, [currentLOD]);

  // Generate brain "folds" based on LOD
  const brainFolds = useMemo(() => {
    const folds = [];
    for (let i = 0; i < lodParams.folds; i++) {
      const angle = (i / lodParams.folds) * Math.PI * 2;
      folds.push({
        position: [
          Math.cos(angle) * 0.8,
          Math.sin(angle * 1.5) * 0.3,
          Math.sin(angle) * 0.8,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      });
    }
    return folds;
  }, [lodParams.folds]);

  return (
    <group ref={groupRef} position={position}>
      {/* Core sphere with LOD-based detail */}
      <mesh>
        <icosahedronGeometry args={[1, lodParams.coreDetail]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#00E5FF"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Outer wireframe */}
      <mesh>
        <icosahedronGeometry args={[1.05, lodParams.outerDetail]} />
        <meshBasicMaterial
          color="#00E5FF"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <icosahedronGeometry args={[0.9, lodParams.innerDetail]} />
        <meshBasicMaterial
          color="#FF00E5"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Rotating ring with LOD-based segments */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, lodParams.ringSegments]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Brain folds - more at higher LOD */}
      {brainFolds.map((fold, i) => (
        <mesh
          key={i}
          position={fold.position}
          rotation={fold.rotation}
          scale={0.5}
        >
          <torusKnotGeometry args={[0.2, 0.05, lodParams.moduleDetail, 4, 2, 3]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={0.3}
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Module hotspot indicators */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.3;
        const z = Math.sin(rad) * 1.3;

        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.08, lodParams.moduleDetail, lodParams.moduleDetail]} />
            <meshBasicMaterial
              color={i === 0 ? '#00E5FF' : i === 1 ? '#FF00E5' : '#FFE500'}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* Point lights for glow effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#00E5FF"
        distance={3}
      />

      {/* LOD indicator (temporary - for debugging) */}
      {currentLOD < targetLOD && (
        <mesh position={[0, -1.8, 0]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
