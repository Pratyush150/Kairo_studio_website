import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createLoaders } from '../lib/loaders';
import { getQualityManager } from '../utils/perf';
import FiberMaterial, { FiberWireframeMaterial } from './FiberMaterial';
import ParticleStreams from './ParticleStreams';
import ModuleHotspot from './ModuleHotspot';
import { getAllModules } from '../lib/moduleData';

/**
 * BrainCore Component
 * Manages the central brain model with progressive LOD loading
 *
 * @param {Object} props
 * @param {[number, number, number]} props.position - Position in 3D space
 * @param {string} props.activeModule - Currently active module ID
 * @param {function} props.onModuleClick - Module click handler
 */
export default function BrainCore({
  position = [0, 0, 0],
  activeModule = null,
  onModuleClick = () => {},
}) {
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
      {/* Core sphere with LOD-based detail and custom shader */}
      <mesh>
        <icosahedronGeometry args={[1, lodParams.coreDetail]} />
        <FiberMaterial
          baseColor="#1a1a2e"
          emissiveColor="#00E5FF"
          speed={1.0}
          displacement={0.15}
          emissiveIntensity={1.8}
          pulseFrequency={2.0}
        />
      </mesh>

      {/* Outer wireframe with animated shader */}
      <mesh>
        <icosahedronGeometry args={[1.05, lodParams.outerDetail]} />
        <FiberWireframeMaterial
          color="#00E5FF"
          opacity={0.3}
          speed={0.8}
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

      {/* Brain folds - more at higher LOD with custom shader */}
      {brainFolds.map((fold, i) => (
        <mesh
          key={i}
          position={fold.position}
          rotation={fold.rotation}
          scale={0.5}
        >
          <torusKnotGeometry args={[0.2, 0.05, lodParams.moduleDetail, 4, 2, 3]} />
          <FiberMaterial
            baseColor="#0a0a15"
            emissiveColor="#00E5FF"
            speed={0.8 + i * 0.1}
            displacement={0.08}
            emissiveIntensity={2.0}
            pulseFrequency={1.5 + i * 0.3}
          />
        </mesh>
      ))}

      {/* Interactive Module Hotspots */}
      {getAllModules().map((module) => (
        <ModuleHotspot
          key={module.id}
          moduleId={module.id}
          name={module.name}
          shortName={module.shortName}
          position={module.position}
          color={module.color}
          onClick={onModuleClick}
          active={activeModule === module.id}
          lodLevel={currentLOD}
        />
      ))}

      {/* Point lights for glow effect */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#00E5FF"
        distance={3}
      />

      {/* GPU Particle Streams - only show at LOD 1+ */}
      {currentLOD >= 1 && (
        <>
          <ParticleStreams
            count={currentLOD === 1 ? 1000 : 2000}
            speed={0.3}
            size={8.0}
            randomness={0.05}
          />
          {/* Additional particle streams along module connections */}
          {[0, 120, 240].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <ParticleStreams
                key={`particle-${i}`}
                position={[Math.cos(rad) * 0.3, 0, Math.sin(rad) * 0.3]}
                count={currentLOD === 1 ? 300 : 500}
                speed={0.4 + i * 0.1}
                size={6.0}
                randomness={0.08}
              />
            );
          })}
        </>
      )}

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
