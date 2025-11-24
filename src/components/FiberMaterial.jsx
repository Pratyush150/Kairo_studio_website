import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  fiberVertexShader,
  fiberFragmentShader,
  fiberShaderUniforms,
} from '../lib/shaders/fiberShader';

/**
 * FiberMaterial Component
 * Custom shader material for animated emissive brain fibers
 *
 * @param {Object} props
 * @param {THREE.Color|string} props.baseColor - Base fiber color
 * @param {THREE.Color|string} props.emissiveColor - Emissive glow color
 * @param {number} props.speed - Animation speed multiplier
 * @param {number} props.displacement - Displacement strength
 * @param {number} props.emissiveIntensity - Glow intensity
 * @param {number} props.pulseFrequency - Pulse animation frequency
 */
export default function FiberMaterial({
  baseColor = '#1a1a2e',
  emissiveColor = '#00E5FF',
  speed = 1.0,
  displacement = 0.1,
  emissiveIntensity = 1.5,
  pulseFrequency = 2.0,
  ...props
}) {
  const materialRef = useRef();

  // Create shader material with uniforms
  const material = useMemo(() => {
    const color = new THREE.Color(baseColor);
    const emissive = new THREE.Color(emissiveColor);

    return new THREE.ShaderMaterial({
      vertexShader: fiberVertexShader,
      fragmentShader: fiberFragmentShader,
      uniforms: {
        ...fiberShaderUniforms,
        uBaseColor: { value: color.toArray() },
        uEmissiveColor: { value: emissive.toArray() },
        uSpeed: { value: speed },
        uDisplacement: { value: displacement },
        uEmissiveIntensity: { value: emissiveIntensity },
        uPulseFrequency: { value: pulseFrequency },
      },
      transparent: false,
      side: THREE.FrontSide,
      glslVersion: THREE.GLSL3,
    });
  }, [baseColor, emissiveColor, speed, displacement, emissiveIntensity, pulseFrequency]);

  // Animate uTime uniform
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <primitive ref={materialRef} object={material} attach="material" {...props} />;
}

/**
 * FiberWireframeMaterial Component
 * Wireframe version for outer brain shell
 */
export function FiberWireframeMaterial({
  color = '#00E5FF',
  opacity = 0.3,
  speed = 1.0,
  ...props
}) {
  const materialRef = useRef();

  const material = useMemo(() => {
    const wireColor = new THREE.Color(color);

    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uSpeed;
        varying vec3 vPosition;

        void main() {
          vPosition = position;

          // Subtle breathing animation
          float breathe = sin(uTime * uSpeed * 0.5) * 0.02;
          vec3 newPosition = position * (1.0 + breathe);

          vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec3 vPosition;

        void main() {
          gl_FragColor = vec4(uColor, uOpacity);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uColor: { value: wireColor.toArray() },
        uOpacity: { value: opacity },
      },
      transparent: true,
      wireframe: true,
      side: THREE.FrontSide,
    });
  }, [color, opacity, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <primitive ref={materialRef} object={material} attach="material" {...props} />;
}
