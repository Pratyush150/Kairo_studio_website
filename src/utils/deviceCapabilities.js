/**
 * Device Capabilities Detection
 * Enhanced detection for optimal quality settings
 */

/**
 * Detect device capabilities
 * @returns {Object} Device capabilities and recommended settings
 */
export function detectDeviceCapabilities() {
  const capabilities = {
    // Device info
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isTablet: /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768,
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),

    // Hardware
    deviceMemory: navigator.deviceMemory || 4,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,

    // Screen
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,

    // Network
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    effectiveType: (navigator.connection || {}).effectiveType || '4g',

    // WebGL
    webgl: null,
    maxTextureSize: 0,
    maxAnisotropy: 0,
  };

  // WebGL capabilities
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (gl) {
      capabilities.webgl = gl.getParameter(gl.VERSION);
      capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

      const ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
                  gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
      if (ext) {
        capabilities.maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      }
    }
  } catch (e) {
    console.warn('[DeviceCapabilities] WebGL detection failed:', e);
  }

  return capabilities;
}

/**
 * Get performance tier based on device capabilities
 * @param {Object} capabilities - Device capabilities
 * @returns {string} Performance tier (low, medium, high)
 */
export function getPerformanceTier(capabilities = null) {
  if (!capabilities) {
    capabilities = detectDeviceCapabilities();
  }

  let score = 0;

  // Memory score (max 30 points)
  if (capabilities.deviceMemory >= 8) score += 30;
  else if (capabilities.deviceMemory >= 4) score += 20;
  else if (capabilities.deviceMemory >= 2) score += 10;

  // CPU score (max 25 points)
  if (capabilities.hardwareConcurrency >= 8) score += 25;
  else if (capabilities.hardwareConcurrency >= 4) score += 18;
  else if (capabilities.hardwareConcurrency >= 2) score += 10;

  // Device type score (max 20 points)
  if (!capabilities.isMobile) score += 20;
  else if (capabilities.isTablet) score += 12;
  else score += 5;

  // Screen score (max 15 points)
  if (capabilities.screenWidth >= 1920) score += 15;
  else if (capabilities.screenWidth >= 1280) score += 10;
  else if (capabilities.screenWidth >= 768) score += 5;

  // WebGL score (max 10 points)
  if (capabilities.maxTextureSize >= 16384) score += 10;
  else if (capabilities.maxTextureSize >= 8192) score += 7;
  else if (capabilities.maxTextureSize >= 4096) score += 4;

  // Determine tier
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Get recommended settings based on capabilities
 * @param {Object} capabilities - Device capabilities
 * @returns {Object} Recommended settings
 */
export function getRecommendedSettings(capabilities = null) {
  if (!capabilities) {
    capabilities = detectDeviceCapabilities();
  }

  const tier = getPerformanceTier(capabilities);

  const settingsPresets = {
    low: {
      quality: 'low',
      dpr: 1,
      antialias: false,
      shadows: false,
      particleCount: 500,
      lodLevel: 0,
      postprocessing: {
        bloom: true,
        chromaticAberration: false,
        vignette: true,
      },
    },
    medium: {
      quality: 'medium',
      dpr: Math.min(capabilities.pixelRatio, 1.5),
      antialias: true,
      shadows: false,
      particleCount: 2000,
      lodLevel: 1,
      postprocessing: {
        bloom: true,
        chromaticAberration: true,
        vignette: true,
      },
    },
    high: {
      quality: 'high',
      dpr: Math.min(capabilities.pixelRatio, 2),
      antialias: true,
      shadows: true,
      particleCount: 5000,
      lodLevel: 2,
      postprocessing: {
        bloom: true,
        chromaticAberration: true,
        vignette: true,
      },
    },
  };

  return {
    ...settingsPresets[tier],
    tier,
    capabilities,
  };
}

/**
 * Log device capabilities to console
 */
export function logDeviceCapabilities() {
  const capabilities = detectDeviceCapabilities();
  const tier = getPerformanceTier(capabilities);
  const settings = getRecommendedSettings(capabilities);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Device Capabilities Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Device Type:', capabilities.isMobile ? 'Mobile' : 'Desktop');
  console.log('Memory:', capabilities.deviceMemory, 'GB');
  console.log('CPU Cores:', capabilities.hardwareConcurrency);
  console.log('Screen:', `${capabilities.screenWidth}x${capabilities.screenHeight}`);
  console.log('Pixel Ratio:', capabilities.pixelRatio);
  console.log('WebGL:', capabilities.webgl || 'Not detected');
  console.log('Max Texture:', capabilities.maxTextureSize);
  console.log('Connection:', capabilities.effectiveType);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Performance Tier:', tier.toUpperCase());
  console.log('Recommended Settings:', settings);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return { capabilities, tier, settings };
}
