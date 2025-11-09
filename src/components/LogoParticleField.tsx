import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';

interface LogoParticleFieldProps {
  count?: number;
  logoPosition?: [number, number, number];
}

export function LogoParticleField({
  count = 12000,
  logoPosition = [0, 0, 0]
}: LogoParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();

  const isHovered = useRef(false);
  const attractionStrength = useRef(110); // G constant

  // Use count directly - performance mode handled by parent via key prop remount
  const particleCount = count;

  // Generate particles in spherical shell around logo
  const { positions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0x00FFFF), // Cyan
      new THREE.Color(0xA854FF), // Violet
      new THREE.Color(0xFFC857), // Amber
      new THREE.Color(0x50FFC8), // Turquoise
      new THREE.Color(0xFFFFFF), // White
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spherical shell distribution (300-500 unit radius)
      const radius = 300 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = logoPosition[0] + radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = logoPosition[1] + radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = logoPosition[2] + radius * Math.cos(phi);

      // Initial orbital velocity (perpendicular to radius)
      const speed = 0.5 + Math.random() * 0.5;
      velocities[i3] = -Math.sin(theta) * speed;
      velocities[i3 + 1] = Math.cos(theta) * speed;
      velocities[i3 + 2] = Math.random() * 0.2 - 0.1;

      // Random color from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r + (Math.random() - 0.5) * 0.1;
      colors[i3 + 1] = color.g + (Math.random() - 0.5) * 0.1;
      colors[i3 + 2] = color.b + (Math.random() - 0.5) * 0.1;

      // Random size (screen-proportional)
      sizes[i] = 0.6 + Math.random() * 1.6; // 0.6px - 2.2px
    }

    return { positions, velocities, colors, sizes };
  }, [particleCount, logoPosition]);

  // Create shader material for particles
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_logoPosition: { value: new THREE.Vector3(...logoPosition) },
        u_attractionStrength: { value: 110 },
        u_hoverActive: { value: 0 },
      },
      vertexShader: `
        uniform float u_time;
        uniform vec3 u_logoPosition;
        uniform float u_attractionStrength;

        attribute vec3 velocity;
        attribute vec3 color;
        attribute float size;

        varying vec3 v_color;
        varying float v_alpha;

        // Perlin noise function (simplified)
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }

        void main() {
          v_color = color;

          // Apply Perlin drift
          vec3 driftOffset = vec3(
            noise(position * 0.01 + u_time * 0.1),
            noise(position * 0.01 + u_time * 0.1 + 100.0),
            noise(position * 0.01 + u_time * 0.1 + 200.0)
          ) * 2.0 - 1.0;

          vec3 pos = position + driftOffset * 5.0;

          // Gravitational attraction toward logo
          vec3 toLogo = u_logoPosition - pos;
          float dist = length(toLogo);
          float epsilon = 10.0;
          float force = -u_attractionStrength * (1.0 / (dist + epsilon));
          force = clamp(force, -10.0, 10.0); // F_max = 10

          vec3 attractionVelocity = normalize(toLogo) * force * 0.01;
          pos += attractionVelocity;

          // Distance-based alpha
          float distanceRatio = clamp(dist / 500.0, 0.0, 1.0);
          v_alpha = 1.0 - distanceRatio * 0.7;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Screen-proportional size
          gl_PointSize = size * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 v_color;
        varying float v_alpha;

        void main() {
          // Circular particle
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          if (dist > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          float glow = exp(-dist * 6.0);

          vec3 finalColor = v_color + vec3(glow * 0.2);

          gl_FragColor = vec4(finalColor, alpha * v_alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [logoPosition]);

  // Listen for hover state changes
  useEffect(() => {
    const handleHover = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { active } = customEvent.detail;

      isHovered.current = active;

      if (active) {
        // Increase attraction by 35%
        attractionStrength.current = 110 * 1.35;
        gsap.to(shaderMaterial.uniforms.u_attractionStrength, {
          value: attractionStrength.current,
          duration: 0.18,
        });
      } else {
        attractionStrength.current = 110;
        gsap.to(shaderMaterial.uniforms.u_attractionStrength, {
          value: 110,
          duration: 0.24,
        });
      }
    };

    window.addEventListener('kairo:logo-hover', handleHover);
    return () => window.removeEventListener('kairo:logo-hover', handleHover);
  }, [shaderMaterial]);

  // Handle explosion
  useEffect(() => {
    const handleExplosion = () => {
      if (!pointsRef.current) return;

      const geometry = pointsRef.current.geometry;
      const positionAttr = geometry.attributes.position;

      // Particle burst outward
      gsap.to(positionAttr.array, {
        duration: 0.72,
        ease: 'power3.out',
        onUpdate: () => {
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const dx = positions[i3] - logoPosition[0];
            const dy = positions[i3 + 1] - logoPosition[1];
            const dz = positions[i3 + 2] - logoPosition[2];

            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const force = 50 / (dist + 1);

            positionAttr.array[i3] += (dx / dist) * force;
            positionAttr.array[i3 + 1] += (dy / dist) * force;
            positionAttr.array[i3 + 2] += (dz / dist) * force;
          }

          positionAttr.needsUpdate = true;
        },
      });
    };

    window.addEventListener('kairo:particle-explosion', handleExplosion);
    return () => window.removeEventListener('kairo:particle-explosion', handleExplosion);
  }, [particleCount, logoPosition, positions]);

  // Animation loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    shaderMaterial.uniforms.u_time.value = state.clock.elapsedTime;

    // Slow orbital rotation - frame-aware
    pointsRef.current.rotation.y += 0.0001 * (delta * 60); // Normalize to 60fps
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-velocity"
          count={particleCount}
          array={velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}
