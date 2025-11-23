'use client'

import { useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export default function PerformanceMonitor() {
  const { gl } = useThree()
  const [fps, setFps] = useState(60)
  let frames = 0
  let lastTime = performance.now()

  useFrame(() => {
    frames++
    const currentTime = performance.now()

    if (currentTime >= lastTime + 1000) {
      const currentFps = Math.round((frames * 1000) / (currentTime - lastTime))
      setFps(currentFps)
      frames = 0
      lastTime = currentTime

      // Auto-adjust quality based on FPS
      if (currentFps < 30) {
        // Reduce pixel ratio for better performance
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1))
      }
    }
  })

  return null
}
