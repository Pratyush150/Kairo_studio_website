'use client'

import { useState, useEffect } from 'react'

export interface DeviceCapability {
  isMobile: boolean
  isLowEnd: boolean
  pixelRatio: number
  maxParticles: number
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>({
    isMobile: false,
    isLowEnd: false,
    pixelRatio: 1,
    maxParticles: 500,
  })

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    // Estimate device capability based on hardware concurrency and device type
    const cores = navigator.hardwareConcurrency || 2
    const isLowEnd = cores < 4 || isMobile

    // Adjust settings based on device
    const pixelRatio = isLowEnd
      ? Math.min(window.devicePixelRatio, 1)
      : Math.min(window.devicePixelRatio, 2)

    const maxParticles = isLowEnd ? 200 : isMobile ? 300 : 500

    setCapability({
      isMobile,
      isLowEnd,
      pixelRatio,
      maxParticles,
    })
  }, [])

  return capability
}
