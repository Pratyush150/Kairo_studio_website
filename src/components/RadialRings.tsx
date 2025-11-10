/**
 * Radial Rings (Shock Waves)
 * Expanding rings during supernova burst
 * Spec: 3 rings expanding outward with fade
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface RingData {
  mesh: THREE.Mesh;
  startTime: number;
  duration: number;
  maxScale: number;
}

export function RadialRings() {
  const [activeRings, setActiveRings] = useState<RingData[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  // Listen for spawn-radial-rings event
  useEffect(() => {
    const handleSpawnRings = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { position, count } = customEvent.detail;

      console.log('[RadialRings] Spawning', count, 'radial rings at', position);

      const rings: RingData[] = [];

      // Create rings
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.RingGeometry(1, 2, 32);
        const material = new THREE.MeshBasicMaterial({
          color: i === 0 ? '#00E5FF' : i === 1 ? '#A854FF' : '#FF00E5',
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1], position[2]);
        mesh.rotation.x = Math.PI / 2; // Horizontal ring

        // Add to scene
        if (groupRef.current) {
          groupRef.current.add(mesh);
        }

        const ringData: RingData = {
          mesh,
          startTime: Date.now() + i * 80, // Stagger by 80ms
          duration: 600, // 600ms expansion
          maxScale: 25 + i * 5, // Increase max scale for each ring
        };

        rings.push(ringData);

        // Animate scale and opacity
        gsap.fromTo(
          mesh.scale,
          { x: 0, y: 0, z: 0 },
          {
            x: ringData.maxScale,
            y: ringData.maxScale,
            z: ringData.maxScale,
            duration: ringData.duration / 1000,
            delay: i * 0.08,
            ease: 'power2.out',
          }
        );

        gsap.fromTo(
          material,
          { opacity: 0 },
          {
            opacity: 0.8,
            duration: 0.15,
            delay: i * 0.08,
            ease: 'power2.out',
          }
        );

        gsap.to(material, {
          opacity: 0,
          duration: 0.3,
          delay: i * 0.08 + 0.3,
          ease: 'power2.in',
          onComplete: () => {
            // Remove from scene
            if (groupRef.current) {
              groupRef.current.remove(mesh);
            }
            geometry.dispose();
            material.dispose();
          },
        });
      }

      setActiveRings(rings);

      // Clear after all animations complete
      setTimeout(() => {
        setActiveRings([]);
      }, 1000);
    };

    window.addEventListener('kairo:spawn-radial-rings', handleSpawnRings);
    return () => window.removeEventListener('kairo:spawn-radial-rings', handleSpawnRings);
  }, []);

  // Animation loop (optional - could add rotation)
  useFrame((state, delta) => {
    if (activeRings.length > 0 && groupRef.current) {
      // Slight rotation for visual interest
      groupRef.current.rotation.z += delta * 0.5;
    }
  });

  return <group ref={groupRef} />;
}
