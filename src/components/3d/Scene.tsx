'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

interface SceneProps {
  children: React.ReactNode
  className?: string
}

export default function Scene({ children, className = '' }: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}
