import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CubeMatrixProps {
  color: string;
  intensity?: number;
  scale?: number;
}

export function CubeMatrix({ color, intensity = 1.0, scale = 1 }: CubeMatrixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const cubeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: intensity * 0.4,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: false,
    });
  }, [color, intensity]);

  // Create 3D grid of cubes
  const { count, offsets } = useMemo(() => {
    const gridSize = 3;
    const spacing = 0.8;
    const count = gridSize * gridSize * gridSize;
    const offsets: [number, number, number][] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          offsets.push([
            (x - gridSize / 2 + 0.5) * spacing,
            (y - gridSize / 2 + 0.5) * spacing,
            (z - gridSize / 2 + 0.5) * spacing,
          ]);
        }
      }
    }

    return { count, offsets };
  }, []);

  // Set up instance matrices
  useFrame((state) => {
    if (!instancedMeshRef.current || !groupRef.current) return;

    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    offsets.forEach((offset, i) => {
      // Expanding/contracting animation
      const wave = Math.sin(time * 2 + i * 0.5) * 0.1 + 1;
      const [x, y, z] = offset;

      dummy.position.set(x * wave, y * wave, z * wave);
      dummy.rotation.x = time * 0.5 + i * 0.1;
      dummy.rotation.y = time * 0.7 + i * 0.15;

      const scaleWave = Math.sin(time * 3 + i * 0.3) * 0.1 + 0.9;
      dummy.scale.setScalar(0.25 * scaleWave);

      dummy.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // Group rotation
    groupRef.current.rotation.y += 0.004;
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={cubeMaterial} attach="material" />
      </instancedMesh>

      {/* Data lines effect */}
      <lineSegments>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              2.5,
              2.5,
              2.5
            ),
          ]}
        />
        <lineBasicMaterial color={color} opacity={0.3} transparent />
      </lineSegments>

      <pointLight intensity={intensity * 0.4} distance={6} color={color} />
    </group>
  );
}
