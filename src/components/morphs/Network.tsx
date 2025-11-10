/**
 * Network Morph (Collaborate)
 * Node graph with instanced spheres and connecting lines
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

interface NetworkProps {
  onClick?: () => void;
}

export const Network = forwardRef<MorphRef, NetworkProps>(({ onClick }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate node positions
  const nodeData = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const count = 12;
    const radius = 20;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      nodes.push(
        new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        )
      );
    }

    return nodes;
  }, []);

  // Generate line geometry connecting nodes
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        const dist = nodeData[i].distanceTo(nodeData[j]);
        if (dist < 25) {
          // Only connect nearby nodes
          positions.push(nodeData[i].x, nodeData[i].y, nodeData[i].z);
          positions.push(nodeData[j].x, nodeData[j].y, nodeData[j].z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [nodeData]);

  // Update instance matrices
  useMemo(() => {
    if (!nodesRef.current) return;
    const dummy = new THREE.Object3D();
    nodeData.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.updateMatrix();
      nodesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    nodesRef.current.instanceMatrix.needsUpdate = true;
  }, [nodeData]);

  // Animate
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  useImperativeHandle(ref, () => ({
    groupRef: { current: groupRef.current } as React.RefObject<THREE.Group>,
    meshRef: { current: nodesRef.current as any } as React.RefObject<THREE.Mesh>,
    appear: () => {
      if (!groupRef.current) return;
      gsap.fromTo(
        groupRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.4)' }
      );
    },
    hoverPulse: (strength: number) => {
      if (!groupRef.current) return;
      gsap.to(groupRef.current.scale, {
        x: 1 + strength * 0.03,
        y: 1 + strength * 0.03,
        z: 1 + strength * 0.03,
        duration: 0.18,
        ease: 'power2.out',
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
      console.log('[Network] Supernova burst triggered');
      if (!groupRef.current) return;

      const tl = gsap.timeline();

      // Burst animation: DRAMATIC nodes collapse then EXPLODE outward
      tl.to(groupRef.current.scale, {
        x: 0.14,
        y: 0.14,
        z: 0.14,
        duration: 0.18,
        ease: 'power3.in',
      })
      .to(groupRef.current.scale, {
        x: 3.5,
        y: 3.5,
        z: 3.5,
        duration: 0.56,
        ease: 'power4.out',
      }, '>')
      .to(groupRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.4,
        ease: 'power2.inOut',
      }, '>-0.1');

      // Dispatch particle burst event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kairo:particle-burst', {
          detail: { position: groupRef.current.position, intensity: 1.0 }
        }));
      }
    },
    idleLoop: () => {
      // Handled in useFrame
    },
  }));

  return (
    <group
      ref={groupRef}
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
      {/* Nodes */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeData.length]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial
          color={colors.accentAmber}
          emissive={colors.accentAmber}
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Lines */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={colors.accentAmber} opacity={0.6} transparent />
      </lineSegments>

      <pointLight intensity={0.8} distance={50} color={colors.accentAmber} />
    </group>
  );
});

Network.displayName = 'Network';
