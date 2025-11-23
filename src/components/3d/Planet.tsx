'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'

interface PlanetProps {
  position: [number, number, number]
  color: string
  scale?: number
  orbitSpeed?: number
  rotationSpeed?: number
  onClick?: () => void
}

export default function Planet({
  position,
  color,
  scale = 0.5,
  orbitSpeed = 0.3,
  rotationSpeed = 0.5,
  onClick
}: PlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Self rotation
      meshRef.current.rotation.y += delta * rotationSpeed

      // Orbital rotation around center
      const time = state.clock.getElapsedTime() * orbitSpeed
      const radius = Math.sqrt(position[0] ** 2 + position[2] ** 2)
      const angle = Math.atan2(position[2], position[0]) + time * 0.1

      meshRef.current.position.x = Math.cos(angle) * radius
      meshRef.current.position.z = Math.sin(angle) * radius
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1 // Floating effect
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={hovered ? scale * 1.2 : scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.3}
        roughness={0.5}
        metalness={0.5}
      />
    </mesh>
  )
}
