'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface OrbProps {
  color?: string
  emissiveIntensity?: number
}

export default function Orb({
  color = '#00E5FF',
  emissiveIntensity = 0.5
}: OrbProps) {
  const meshRef = useRef<Mesh>(null)

  // Rotate the orb slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
      meshRef.current.rotation.x += delta * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  )
}
