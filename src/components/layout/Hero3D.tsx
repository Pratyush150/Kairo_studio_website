'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Loader from '../ui/Loader'

// Dynamically import 3D components (client-side only)
const Scene = dynamic(() => import('../3d/Scene'), { ssr: false })
const HeroOrbit = dynamic(() => import('../3d/HeroOrbit'), { ssr: false })

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Suspense fallback={<Loader />}>
        <Scene>
          <HeroOrbit />
        </Scene>
      </Suspense>
    </div>
  )
}
