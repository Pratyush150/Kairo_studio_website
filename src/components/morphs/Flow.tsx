/**
 * Flow Morph (Work)
 * Flowing ribbon mesh with displacement
 */

import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors } from '../../lib/tokens';
import gsap from 'gsap';

export interface MorphRef {
  appear: () => void;
  hoverPulse: (strength: number) => void;
  enterZoom: () => void;
  idleLoop: () => void;
  supernovaBurst: () => void;
  groupRef?: React.RefObject<THREE.Group>;
  meshRef?: React.RefObject<THREE.Mesh>;
}

interface FlowProps {
  onClick?: () => void;
}

export const Flow = forwardRef<MorphRef, FlowProps>(({ onClick }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Ribbon geometry - Reduced segments for better performance
  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(18, 4, 16, 64); // Reduced from 32,100 to 16,64
  }, []);

  // Custom shader material for flowing effect
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(colors.accentCyan) },
        u_emissive: { value: 0.5 },
      },
      vertexShader: `
        uniform float u_time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          // Wave displacement
          vec3 pos = position;
          float wave = sin(pos.x * 0.5 + u_time) * cos(pos.y * 0.5 + u_time * 0.7);
          pos += normal * wave * 0.3;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_emissive;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Fresnel rim
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 2.0);

          vec3 color = u_color + fresnel * vec3(1.0) * 0.3;
          gl_FragColor = vec4(color * (1.0 + u_emissive), 1.0);
        }
      `,
    });
  }, []);

  // Animate shader time
  useFrame((state) => {
    if (!groupRef.current || !materialRef.current) return;
    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    groupRef.current.rotation.y += 0.002;
  });

  useImperativeHandle(ref, () => ({
    groupRef: { current: groupRef.current } as React.RefObject<THREE.Group>,
    meshRef: { current: meshRef.current } as React.RefObject<THREE.Mesh>,
    appear: () => {
      if (!groupRef.current) return;
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: 'power3.out' }
      );
    },
    hoverPulse: (strength: number) => {
      if (!groupRef.current || !materialRef.current) return;
      gsap.to(groupRef.current.scale, {
        x: 1 + strength * 0.03,
        y: 1 + strength * 0.03,
        z: 1 + strength * 0.03,
        duration: 0.18,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });

      gsap.to(materialRef.current.uniforms.u_emissive, {
        value: 0.5 + strength * 0.4,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
      });
    },
    enterZoom: () => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 1.4,
        ease: 'power3.inOut',
      });
    },
    supernovaBurst: () => {
      console.log('[Flow] Supernova burst triggered');
      if (!groupRef.current || !materialRef.current) return;

      const tl = gsap.timeline();

      // Burst animation: DRAMATIC compress then EXPLODE
      tl.to(groupRef.current.scale, {
        x: 0.14,
        y: 0.14,
        z: 0.14,
        duration: 0.18,
        ease: 'power3.in',
      })
      .to(materialRef.current.uniforms.u_emissive, {
        value: 1.6,
        duration: 0.18,
        ease: 'power3.in',
      }, '<')
      .to(groupRef.current.scale, {
        x: 3.5,
        y: 3.5,
        z: 3.5,
        duration: 0.56,
        ease: 'power4.out',
      }, '>')
      .to(materialRef.current.uniforms.u_emissive, {
        value: 2.5,
        duration: 0.2,
        ease: 'power4.out',
      }, '<')
      .to(materialRef.current.uniforms.u_emissive, {
        value: 0.5,
        duration: 0.4,
        ease: 'power2.out',
      }, '>-0.2')
      .to(groupRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.4,
        ease: 'power2.inOut',
      }, '<');

      // Dispatch particle burst event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kairo:particle-burst', {
          detail: { position: groupRef.current.position, intensity: 1.0 }
        }));
      }
    },
    idleLoop: () => {
      // Already handled in useFrame
    },
  }));

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <primitive ref={materialRef} object={material} attach="material" />
      </mesh>
      <pointLight intensity={1.0} distance={60} color={colors.accentCyan} />
    </group>
  );
});

Flow.displayName = 'Flow';
