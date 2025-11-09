import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import particleVertexShader from '../shaders/particle.vert.glsl';
import particleFragmentShader from '../shaders/particle.frag.glsl';

interface ParticleFieldProps {
  count?: number;
}

export function ParticleField({ count = 8000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const { sceneState, performanceMode } = useSceneStore();

  // Adjust particle count based on performance
  const particleCount = useMemo(() => {
    if (performanceMode === 'low') return Math.min(count, 3000);
    if (performanceMode === 'medium') return Math.min(count, 5000);
    return count;
  }, [count, performanceMode]);

  // Generate particle positions
  const { positions, normals } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const normals = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Create spherical distribution with some randomness
      const radius = 500 + Math.random() * 1000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Normals for displacement
      const normal = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]).normalize();
      normals[i3] = normal.x;
      normals[i3 + 1] = normal.y;
      normals[i3 + 2] = normal.z;
    }

    return { positions, normals };
  }, [particleCount]);

  // Create shader material
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0 },
          u_size: { value: 2.5 },
          u_color: { value: new THREE.Color(0xb5c3ff) },
          u_opacity: { value: 1.0 },
          u_cameraPosition: { value: camera.position },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [camera.position]
  );

  // Animation
  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = state.clock.elapsedTime;
    material.uniforms.u_cameraPosition.value.copy(camera.position);

    // Adjust opacity based on scene state
    if (sceneState === 'boom') {
      material.uniforms.u_opacity.value = THREE.MathUtils.lerp(
        material.uniforms.u_opacity.value,
        0.3,
        0.05
      );
    } else if (sceneState === 'idle' || sceneState === 'transition') {
      material.uniforms.u_opacity.value = THREE.MathUtils.lerp(
        material.uniforms.u_opacity.value,
        1.0,
        0.02
      );
    }

    // Slow rotation
    pointsRef.current.rotation.y += 0.0001;
  });

  // Handle compression event for singularity
  useEffect(() => {
    const handleCompress = () => {
      if (pointsRef.current) {
        const material = pointsRef.current.material as THREE.ShaderMaterial;
        // Animate particle compression
        const startScale = pointsRef.current.scale.x;
        const targetScale = 0.18;

        let progress = 0;
        const animate = () => {
          if (progress < 1) {
            progress += 0.02;
            const scale = THREE.MathUtils.lerp(startScale, targetScale, progress);
            if (pointsRef.current) {
              pointsRef.current.scale.setScalar(scale);
              material.uniforms.u_opacity.value = 1 - progress * 0.7;
            }
            requestAnimationFrame(animate);
          }
        };
        animate();
      }
    };

    window.addEventListener('kairo:particles-compress', handleCompress);
    return () => window.removeEventListener('kairo:particles-compress', handleCompress);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-normal" count={particleCount} array={normals} itemSize={3} />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}
