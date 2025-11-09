import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface FocusIndicatorProps {
  position: [number, number, number];
  color: string;
  active: boolean;
}

export function FocusIndicator({ position, color, active }: FocusIndicatorProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef({ scale: 1, opacity: 0 });

  // Animate in/out when active changes
  useEffect(() => {
    if (!ringRef.current) return;

    if (active) {
      // Fade in
      gsap.to(pulseRef.current, {
        opacity: 0.8,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      // Fade out
      gsap.to(pulseRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [active]);

  // Pulsing animation
  useFrame((state) => {
    if (!ringRef.current || !active) return;

    const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
    ringRef.current.scale.setScalar(pulse);
  });

  // Update position
  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.position.set(...position);
    }
  }, [position]);

  if (!active) return null;

  return (
    <mesh ref={ringRef} position={position}>
      {/* Outer ring */}
      <ringGeometry args={[6, 7, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={pulseRef.current.opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
