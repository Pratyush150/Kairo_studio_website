import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HelixVortexProps {
  color: string;
  intensity?: number;
  scale?: number;
}

export function HelixVortex({ color, intensity = 1.0, scale = 1 }: HelixVortexProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tubeRefs = useRef<THREE.Mesh[]>([]);

  const tubeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: intensity * 0.5,
      metalness: 0.5,
      roughness: 0.4,
      transparent: true,
      opacity: 0.8,
    });
  }, [color, intensity]);

  // Create helix curves
  const helices = useMemo(() => {
    const helixCount = 3;
    const helixData = [];

    for (let h = 0; h < helixCount; h++) {
      const points: THREE.Vector3[] = [];
      const segments = 100;
      const radius = 0.8;
      const height = 3;
      const rotations = 4;
      const phaseOffset = (h / helixCount) * Math.PI * 2;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 * rotations + phaseOffset;
        const y = (t - 0.5) * height;

        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      helixData.push({ curve, phaseOffset });
    }

    return helixData;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Endless rotation
    groupRef.current.rotation.y = time * 0.5;

    // Animate opacity pulse
    tubeRefs.current.forEach((tube, index) => {
      if (tube && tube.material) {
        const mat = tube.material as THREE.MeshStandardMaterial;
        const pulse = Math.sin(time * 2 + index * Math.PI * 0.66) * 0.2 + 0.8;
        mat.opacity = pulse * 0.8;
        mat.emissiveIntensity = intensity * 0.5 * pulse;
      }
    });
  });

  return (
    <group ref={groupRef} scale={scale}>
      {helices.map((helix, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) tubeRefs.current[index] = el;
          }}
        >
          <tubeGeometry args={[helix.curve, 100, 0.08, 8, false]} />
          <primitive object={tubeMaterial.clone()} attach="material" />
        </mesh>
      ))}

      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.8}
        />
      </mesh>

      <pointLight intensity={intensity * 0.6} distance={5} color={color} />
    </group>
  );
}
