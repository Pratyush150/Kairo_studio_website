import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import metaballVertexShader from '../../shaders/metaball.vert.glsl';
import metaballFragmentShader from '../../shaders/metaball.frag.glsl';

interface MetaballBlobProps {
  color: string;
  intensity?: number;
  scale?: number;
}

export function MetaballBlob({ color, intensity = 1.0, scale = 1 }: MetaballBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(color) },
        u_intensity: { value: intensity },
        u_opacity: { value: 0.85 },
      },
      vertexShader: metaballVertexShader,
      fragmentShader: metaballFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color, intensity]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = state.clock.elapsedTime;

    // Slow rotation and morphing
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.2;
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <icosahedronGeometry args={[1, 4]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
