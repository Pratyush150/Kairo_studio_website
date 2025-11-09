import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';

/**
 * Procedural space environment with nebula-like appearance
 * Provides reflections for metallic materials without requiring HDRI files
 */
export function SpaceEnvironment() {
  const { gl, scene } = useThree();

  // Use selector to minimize re-renders
  const performanceMode = useSceneStore((state) => state.performanceMode);

  const envMapRef = useRef<THREE.CubeTexture | null>(null);

  // Create procedural environment cubemap
  const envMap = useMemo(() => {
    if (performanceMode === 'low') return null;

    const size = 512;
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    // Create a simple scene for the environment
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    const envScene = new THREE.Scene();

    // Create nebula-like gradient background
    const geometry = new THREE.SphereGeometry(500, 32, 32);

    // Custom shader for nebula effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('#020312') }, // Deep space blue
        color2: { value: new THREE.Color('#160B33') }, // Purple
        color3: { value: new THREE.Color('#A854FF') }, // Bright purple
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        varying vec3 vPosition;
        varying vec3 vNormal;

        // Simple noise function
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }

        void main() {
          // Create gradient based on position
          vec3 norm = normalize(vPosition);
          float gradient = abs(norm.y);

          // Add some noise for nebula effect
          float n = noise(vPosition * 0.5);

          // Mix colors based on gradient and noise
          vec3 color = mix(color1, color2, gradient);
          color = mix(color, color3, n * 0.3);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    envScene.add(mesh);

    // Add some point lights for star-like reflections
    const stars = 20;
    for (let i = 0; i < stars; i++) {
      const light = new THREE.PointLight(
        i % 2 === 0 ? '#FFFFFF' : '#A854FF',
        Math.random() * 0.5 + 0.3,
        100
      );
      light.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
      );
      envScene.add(light);
    }

    // Render the environment
    cubeCamera.position.set(0, 0, 0);
    cubeCamera.update(gl, envScene);

    // Clean up the temporary scene
    envScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });

    return cubeRenderTarget.texture;
  }, [gl, performanceMode]);

  // Apply environment map to scene
  useMemo(() => {
    if (envMap && scene) {
      scene.environment = envMap;
      scene.environmentIntensity = 0.3;
      envMapRef.current = envMap;
    }
  }, [envMap, scene]);

  // Slow rotation for dynamic reflections
  useFrame(() => {
    if (envMapRef.current && performanceMode === 'high') {
      // Very subtle rotation
      // Note: CubeTexture rotation is handled by updating the scene
    }
  });

  return null; // This component doesn't render anything visible
}
