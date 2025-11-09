/**
 * Device detection utilities for Kairoverse
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  isHighEnd: boolean;
  isLowEnd: boolean;
  platform: string;
  cores: number;
  memory: number | null;
  isLowPowerMode: boolean;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      hasWebGL: false,
      hasWebGL2: false,
      isHighEnd: false,
      isLowEnd: false,
      platform: 'server',
      cores: 1,
      memory: null,
      isLowPowerMode: false,
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
  const canvas = document.createElement('canvas');
  const hasWebGL = (() => {
    try {
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  })();

  // WebGL2 detection (required for best performance)
  const hasWebGL2 = (() => {
    try {
      return !!(
        window.WebGL2RenderingContext &&
        canvas.getContext('webgl2')
      );
    } catch (e) {
      return false;
    }
  })();

  // Hardware specs
  const cores = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || null;

  // Low power mode detection (battery saver)
  const isLowPowerMode = (() => {
    // Check for battery API
    const nav = navigator as any;
    if (nav.getBattery) {
      // Async but we'll handle it separately
      return false; // Will be updated async
    }
    // Check for connection.saveData (Chrome data saver)
    if (nav.connection && nav.connection.saveData) {
      return true;
    }
    return false;
  })();

  // Low-end device detection (stricter criteria)
  const isLowEnd = (() => {
    // Strict low-end criteria per optimization guide
    if (cores <= 4) return true; // <= 4 cores = auto low mode
    if (memory !== null && memory < 4) return true; // < 4GB RAM = low mode
    if (!hasWebGL2) return true; // No WebGL2 = low mode
    if (isLowPowerMode) return true; // Battery saver = low mode
    return false;
  })();

  // High-end device detection (only the best devices)
  const isHighEnd = (() => {
    // Must have WebGL2, good RAM, and good cores
    if (!hasWebGL2) return false;
    if (cores < 8) return false; // Need 8+ cores for high mode
    if (memory !== null && memory < 8) return false; // Need 8GB+ RAM

    // iOS/Safari high-end check (recent iPads/iPhones)
    const isIOSHighEnd = /iPad|iPhone/i.test(userAgent) && width >= 1024 && cores >= 6;

    // Android high-end check
    const isAndroidHighEnd = /android/i.test(userAgent) && memory && memory >= 6 && cores >= 8;

    return (isDesktop && memory && memory >= 8 && cores >= 8) || isIOSHighEnd || isAndroidHighEnd;
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
    hasWebGL2,
    isHighEnd,
    isLowEnd,
    platform,
    cores,
    memory,
    isLowPowerMode,
  };
}

export function getRecommendedPerformanceMode(deviceInfo: DeviceInfo): 'high' | 'medium' | 'low' {
  // Fail-safe checks per optimization guide
  if (!deviceInfo.hasWebGL) return 'low';
  if (deviceInfo.isLowEnd) return 'low'; // Auto low mode for <= 4 cores, < 4GB RAM, no WebGL2, or battery saver

  // Mobile devices
  if (deviceInfo.isMobile) {
    return deviceInfo.isHighEnd ? 'medium' : 'low';
  }

  // Tablet devices
  if (deviceInfo.isTablet) {
    return deviceInfo.isHighEnd ? 'medium' : 'low';
  }

  // Desktop devices
  if (deviceInfo.isHighEnd) {
    return 'high'; // Only true high-end (8+ cores, 8GB+ RAM, WebGL2)
  }

  // Default to medium for mid-range desktops
  return 'medium';
}

export function shouldUseMobileFallback(deviceInfo: DeviceInfo): boolean {
  // Use fallback if:
  // 1. No WebGL support
  // 2. Low-end mobile device
  // 3. Performance mode is forced to low
  return !deviceInfo.hasWebGL || (deviceInfo.isMobile && !deviceInfo.isHighEnd);
}
