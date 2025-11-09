/**
 * Device detection utilities for Kairoverse
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasWebGL: boolean;
  isHighEnd: boolean;
  platform: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      hasWebGL: false,
      isHighEnd: false,
      platform: 'server',
    };
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const width = window.innerWidth;

  // Mobile detection
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
  const isMobileWidth = width < 768;
  const isMobile = isMobileUA || isMobileWidth;

  // Tablet detection
  const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent.toLowerCase());
  const isTabletWidth = width >= 768 && width < 1024;
  const isTablet = isTabletUA || (isTabletWidth && !isMobile);

  // Desktop
  const isDesktop = !isMobile && !isTablet;

  // Touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // WebGL detection
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  })();

  // High-end device detection
  const isHighEnd = (() => {
    // Check for high RAM (>= 8GB)
    const memory = (navigator as any).deviceMemory;
    const hasHighRAM = memory ? memory >= 8 : false;

    // Check for high CPU cores (>= 4)
    const cores = navigator.hardwareConcurrency || 1;
    const hasHighCPU = cores >= 4;

    // iOS/Safari high-end check
    const isIOSHighEnd = /iPad|iPhone/i.test(userAgent) && width >= 1024;

    // Android high-end check
    const isAndroidHighEnd = /android/i.test(userAgent) && hasHighRAM && hasHighCPU;

    return (isDesktop && hasHighRAM && hasHighCPU) || isIOSHighEnd || isAndroidHighEnd;
  })();

  // Platform
  const platform = (() => {
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
    if (/android/i.test(userAgent)) return 'Android';
    if (/Mac/.test(userAgent)) return 'macOS';
    if (/Win/.test(userAgent)) return 'Windows';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
  })();

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    hasWebGL,
    isHighEnd,
    platform,
  };
}

export function getRecommendedPerformanceMode(deviceInfo: DeviceInfo): 'high' | 'medium' | 'low' {
  if (!deviceInfo.hasWebGL) return 'low';

  if (deviceInfo.isMobile) {
    return deviceInfo.isHighEnd ? 'medium' : 'low';
  }

  if (deviceInfo.isTablet) {
    return deviceInfo.isHighEnd ? 'medium' : 'low';
  }

  // Desktop
  return deviceInfo.isHighEnd ? 'high' : 'medium';
}

export function shouldUseMobileFallback(deviceInfo: DeviceInfo): boolean {
  // Use fallback if:
  // 1. No WebGL support
  // 2. Low-end mobile device
  // 3. Performance mode is forced to low
  return !deviceInfo.hasWebGL || (deviceInfo.isMobile && !deviceInfo.isHighEnd);
}
