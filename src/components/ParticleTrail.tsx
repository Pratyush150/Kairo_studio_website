import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrailParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export function ParticleTrail() {
  const particlesRef = useRef<THREE.Points>(null);
  const trailParticles = useRef<TrailParticle[]>([]);
  const maxParticles = 500;

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const opacities = new Float32Array(maxParticles);

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute vec3 color;

        varying vec3 v_color;
        varying float v_opacity;

        void main() {
          v_color = color;
          v_opacity = opacity;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 v_color;
        varying float v_opacity;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          // Soft circular particle
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

          // Add glow effect
          float glow = exp(-dist * 6.0);
          vec3 finalColor = v_color + vec3(glow * 0.3);

          gl_FragColor = vec4(finalColor, alpha * v_opacity);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    return { geometry: geom, material: mat };
  }, []);

  // Listen for camera trail events
  useEffect(() => {
    const handleCameraTrail = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { path } = customEvent.detail;

      if (!path || path.length === 0) return;

      // Spawn particles along the path
      path.forEach((point: THREE.Vector3, index: number) => {
        // Spawn multiple particles per point for density
        for (let i = 0; i < 3; i++) {
          if (trailParticles.current.length < maxParticles) {
            const offset = new THREE.Vector3(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            );

            trailParticles.current.push({
              position: point.clone().add(offset),
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
              ),
              life: 1.0,
              maxLife: 1.0 + Math.random() * 0.5,
              size: 2 + Math.random() * 3,
            });
          }
        }
      });

      console.log(`[ParticleTrail] Spawned trail particles: ${trailParticles.current.length}`);
    };

    window.addEventListener('kairo:camera-trail', handleCameraTrail);

    return () => {
      window.removeEventListener('kairo:camera-trail', handleCameraTrail);
    };
  }, []);

  // Update particles each frame
  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    const opacities = geometry.attributes.opacity.array as Float32Array;

    // Update material time
    material.uniforms.u_time.value = state.clock.elapsedTime;

    // Update each particle
    trailParticles.current = trailParticles.current.filter((particle, index) => {
      // Update particle life
      particle.life -= delta * 0.8;

      // Remove dead particles
      if (particle.life <= 0) {
        return false;
      }

      // Update position with velocity
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta * 10)
      );

      // Apply drag
      particle.velocity.multiplyScalar(0.98);

      // Calculate opacity based on life
      const lifeRatio = particle.life / particle.maxLife;
      const opacity = Math.pow(lifeRatio, 2); // Fade out faster at the end

      // Update buffer attributes
      if (index < maxParticles) {
        positions[index * 3] = particle.position.x;
        positions[index * 3 + 1] = particle.position.y;
        positions[index * 3 + 2] = particle.position.z;

        // Color gradient from purple to cyan
        const colorMix = 1.0 - lifeRatio;
        colors[index * 3] = 0.66 * (1 - colorMix) + 0.0 * colorMix; // R
        colors[index * 3 + 1] = 0.33 * (1 - colorMix) + 1.0 * colorMix; // G
        colors[index * 3 + 2] = 1.0; // B

        sizes[index] = particle.size * lifeRatio;
        opacities[index] = opacity;
      }

      return true;
    });

    // Clear remaining slots
    for (let i = trailParticles.current.length; i < maxParticles; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      opacities[i] = 0;
    }

    // Mark attributes for update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
  });

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points ref={particlesRef} geometry={geometry} material={material} />;
}
