'use client'

import { useRouter } from 'next/navigation'
import { OrbitControls, Environment } from '@react-three/drei'
import Orb from './Orb'
import Planet from './Planet'
import ParticleField from './ParticleField'
import PerformanceMonitor from './PerformanceMonitor'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'

const planets = [
  {
    id: 'automation',
    slug: 'automation',
    position: [3, 0.5, 0] as [number, number, number],
    color: '#00E5FF',
    scale: 0.6,
  },
  {
    id: 'marketing',
    slug: 'marketing',
    position: [2, -0.5, 2.5] as [number, number, number],
    color: '#FF6B6B',
    scale: 0.5,
  },
  {
    id: 'saas',
    slug: 'saas-ai',
    position: [-2.5, 0.3, 2] as [number, number, number],
    color: '#00E5FF',
    scale: 0.55,
  },
  {
    id: 'branding',
    slug: 'branding',
    position: [-3, -0.2, -1] as [number, number, number],
    color: '#FF6B6B',
    scale: 0.5,
  },
  {
    id: 'strategy',
    slug: 'strategy',
    position: [1, 0.8, -3] as [number, number, number],
    color: '#00E5FF',
    scale: 0.5,
  },
]

export default function HeroOrbit() {
  const { maxParticles } = useDeviceCapability()
  const router = useRouter()

  const handlePlanetClick = (slug: string) => {
    router.push(`/services/${slug}`)
  }

  return (
    <>
      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00E5FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF6B6B" />

      {/* Environment */}
      <Environment preset="night" />

      {/* Particle background */}
      <ParticleField count={maxParticles} />

      {/* Central Orb */}
      <Orb color="#00E5FF" emissiveIntensity={0.8} />

      {/* Orbiting Planets */}
      {planets.map((planet) => (
        <Planet
          key={planet.id}
          position={planet.position}
          color={planet.color}
          scale={planet.scale}
          onClick={() => handlePlanetClick(planet.slug)}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  )
}
