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
  const { camera, size, raycaster } = useThree();

  // Use individual selectors to minimize re-renders
  const sceneState = useSceneStore((state) => state.sceneState);
  const performanceMode = useSceneStore((state) => state.performanceMode);

  const mouseRef = useRef(new THREE.Vector2(999, 999)); // Start offscreen
  const mouse3DRef = useRef(new THREE.Vector3());

  // Keep refs in sync for useFrame
  const sceneStateRef = useRef(sceneState);
  sceneStateRef.current = sceneState;

  // Use count directly - performance mode handled by parent via key prop remount
  const particleCount = count;

  // Track mouse position - Throttled for performance
  useEffect(() => {
    let rafId: number | null = null;
    let needsUpdate = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      needsUpdate = true;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (needsUpdate) {
            // Convert to normalized device coordinates (-1 to +1)
            mouseRef.current.x = (lastX / size.width) * 2 - 1;
            mouseRef.current.y = -(lastY / size.height) * 2 + 1;

            // Project mouse position to 3D space at camera's distance
            const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            mouse3DRef.current.copy(camera.position).add(dir.multiplyScalar(distance));

            needsUpdate = false;
          }
          rafId = null;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [camera, size]);

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
          u_mousePosition: { value: new THREE.Vector3() },
          u_attractionRadius: { value: 80.0 },
          u_attractionStrength: { value: 0.15 },
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
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.u_time.value = state.clock.elapsedTime;
    material.uniforms.u_cameraPosition.value.copy(camera.position);
    material.uniforms.u_mousePosition.value.copy(mouse3DRef.current);

    // Adjust opacity based on scene state - frame-aware lerp (use ref for current sceneState)
    if (sceneStateRef.current === 'boom') {
      const lerpFactor = Math.min(1, delta * 3); // ~0.05 at 60fps
      material.uniforms.u_opacity.value = THREE.MathUtils.lerp(
        material.uniforms.u_opacity.value,
        0.3,
        lerpFactor
      );
    } else if (sceneStateRef.current === 'idle' || sceneStateRef.current === 'transition') {
      const lerpFactor = Math.min(1, delta * 1.2); // ~0.02 at 60fps
      material.uniforms.u_opacity.value = THREE.MathUtils.lerp(
        material.uniforms.u_opacity.value,
        1.0,
        lerpFactor
      );
    }

    // Slow rotation - frame-aware
    pointsRef.current.rotation.y += 0.0001 * (delta * 60); // Normalize to 60fps
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
