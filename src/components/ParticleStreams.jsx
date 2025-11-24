import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  particleVertexShader,
  particleFragmentShader,
  particleShaderUniforms,
  generateParticleAttributes,
} from '../lib/shaders/particleShader';
import { getQualityManager } from '../utils/perf';

/**
 * ParticleStreams Component
 * GPU-accelerated particle system flowing along brain fibers
 *
 * @param {Object} props
 * @param {number} props.count - Number of particles (auto-adjusted by quality)
 * @param {number} props.speed - Animation speed
 * @param {number} props.size - Particle size
 * @param {number} props.randomness - Position randomness
 */
export default function ParticleStreams({
  count = null, // Auto-detect based on quality
  speed = 0.3,
  size = 8.0,
  randomness = 0.05,
  ...props
}) {
  const pointsRef = useRef();
  const qualityManager = getQualityManager();

  // Auto-adjust particle count based on quality
  const particleCount = useMemo(() => {
    if (count !== null) return count;

    const qualitySettings = {
      low: 500,
      medium: 2000,
      high: 5000,
      auto: 2000,
    };

    return qualitySettings[qualityManager.currentQuality] || 2000;
  }, [count, qualityManager.currentQuality]);

  // Generate particle attributes
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Generate positions (will be overridden by shader)
    const positions = new Float32Array(particleCount * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Generate particle attributes
    const { progress, speed: speedAttr, offset } = generateParticleAttributes(particleCount);

    geo.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speedAttr, 1));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 3));

    // Create shader material
    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        ...particleShaderUniforms,
        uSpeed: { value: speed },
        uSize: { value: size },
        uRandomness: { value: randomness },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    return { geometry: geo, material: mat };
  }, [particleCount, speed, size, randomness]);

  // Animate particles
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Cleanup
  React.useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points ref={pointsRef} geometry={geometry} material={material} {...props} />;
}

/**
 * MultiStreamParticles Component
 * Multiple particle streams along different paths
 */
export function MultiStreamParticles({ streamCount = 3, ...props }) {
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < streamCount; i++) {
      const angle = (i / streamCount) * Math.PI * 2;
      pos.push([
        Math.cos(angle) * 0.3,
        0,
        Math.sin(angle) * 0.3,
      ]);
    }
    return pos;
  }, [streamCount]);

  return (
    <group>
      {positions.map((pos, i) => (
        <ParticleStreams
          key={i}
          position={pos}
          speed={0.3 + i * 0.1}
          size={8.0 - i * 1.0}
          {...props}
        />
      ))}
    </group>
  );
}
