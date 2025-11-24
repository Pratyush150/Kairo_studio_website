/**
 * Performance Monitoring & Adaptive Quality Utilities
 * Tracks FPS, memory usage, and adjusts quality settings
 */

/**
 * Quality levels for adaptive rendering
 */
export const QUALITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  AUTO: 'auto',
};

/**
 * Quality presets with rendering parameters
 */
export const QUALITY_PRESETS = {
  low: {
    dpr: 1,
    antialias: false,
    shadows: false,
    particleCount: 500,
    lodLevel: 0,
    postprocessing: false,
    maxLights: 2,
  },
  medium: {
    dpr: 1,
    antialias: true,
    shadows: false,
    particleCount: 2000,
    lodLevel: 1,
    postprocessing: false,
    maxLights: 4,
  },
  high: {
    dpr: [1, 1.5],
    antialias: true,
    shadows: true,
    particleCount: 5000,
    lodLevel: 2,
    postprocessing: true,
    maxLights: 6,
  },
};

/**
 * FPS Monitor Class
 * Tracks frames per second and provides statistics
 */
export class FPSMonitor {
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frames = [];
    this.lastTime = performance.now();
    this.fps = 0;
    this.minFPS = Infinity;
    this.maxFPS = 0;
    this.avgFPS = 0;
  }

  /**
   * Update FPS counter (call every frame)
   */
  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const currentFPS = 1000 / delta;
    this.frames.push(currentFPS);

    if (this.frames.length > this.sampleSize) {
      this.frames.shift();
    }

    // Calculate statistics
    this.fps = currentFPS;
    this.avgFPS = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    this.minFPS = Math.min(...this.frames);
    this.maxFPS = Math.max(...this.frames);

    return {
      current: Math.round(currentFPS),
      average: Math.round(this.avgFPS),
      min: Math.round(this.minFPS),
      max: Math.round(this.maxFPS),
    };
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      current: Math.round(this.fps),
      average: Math.round(this.avgFPS),
      min: Math.round(this.minFPS),
      max: Math.round(this.maxFPS),
    };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.frames = [];
    this.minFPS = Infinity;
    this.maxFPS = 0;
    this.avgFPS = 0;
  }

  /**
   * Check if performance is acceptable
   * @param {number} targetFPS - Target FPS (default: 30)
   */
  isPerformanceGood(targetFPS = 30) {
    return this.avgFPS >= targetFPS;
  }
}

/**
 * Quality Manager Class
 * Manages adaptive quality based on performance
 */
export class QualityManager {
  constructor(initialQuality = QUALITY_LEVELS.AUTO) {
    this.currentQuality = initialQuality;
    this.fpsMonitor = new FPSMonitor();
    this.autoAdjust = initialQuality === QUALITY_LEVELS.AUTO;
    this.lastAdjustTime = 0;
    this.adjustCooldown = 5000; // 5 seconds between adjustments
  }

  /**
   * Detect device capabilities and recommend quality
   */
  static detectRecommendedQuality() {
    // Check for mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Check device memory (if available)
    const deviceMemory = navigator.deviceMemory || 4;

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 2;

    // Check for GPU info (if available)
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let gpuTier = 'unknown';

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        gpuTier = renderer.toLowerCase();
      }
    }

    console.log('[QualityManager] Device Info:', {
      isMobile,
      deviceMemory,
      cores,
      gpuTier,
    });

    // Determine quality level
    if (isMobile && deviceMemory < 4) {
      return QUALITY_LEVELS.LOW;
    } else if (isMobile || deviceMemory < 6 || cores < 4) {
      return QUALITY_LEVELS.MEDIUM;
    } else {
      return QUALITY_LEVELS.HIGH;
    }
  }

  /**
   * Get current quality preset
   */
  getPreset() {
    if (this.currentQuality === QUALITY_LEVELS.AUTO) {
      return QUALITY_PRESETS[QualityManager.detectRecommendedQuality()];
    }
    return QUALITY_PRESETS[this.currentQuality];
  }

  /**
   * Set quality level
   * @param {string} quality - Quality level (low, medium, high, auto)
   */
  setQuality(quality) {
    if (!Object.values(QUALITY_LEVELS).includes(quality)) {
      console.warn('[QualityManager] Invalid quality level:', quality);
      return;
    }

    this.currentQuality = quality;
    this.autoAdjust = quality === QUALITY_LEVELS.AUTO;

    console.log('[QualityManager] Quality set to:', quality);
  }

  /**
   * Update performance monitoring and auto-adjust quality if needed
   * @param {number} delta - Frame delta time
   */
  update(delta) {
    const stats = this.fpsMonitor.update();

    // Auto-adjust quality if enabled
    if (this.autoAdjust) {
      const now = performance.now();
      if (now - this.lastAdjustTime > this.adjustCooldown) {
        this.autoAdjustQuality(stats);
        this.lastAdjustTime = now;
      }
    }

    return stats;
  }

  /**
   * Automatically adjust quality based on FPS
   * @param {Object} stats - FPS statistics
   */
  autoAdjustQuality(stats) {
    const currentPreset = this.getPreset();

    // If FPS is consistently low, downgrade
    if (stats.average < 25 && this.currentQuality !== QUALITY_LEVELS.LOW) {
      if (this.currentQuality === QUALITY_LEVELS.HIGH) {
        this.currentQuality = QUALITY_LEVELS.MEDIUM;
        console.log('[QualityManager] Auto-adjusted to MEDIUM (low FPS)');
      } else if (this.currentQuality === QUALITY_LEVELS.MEDIUM) {
        this.currentQuality = QUALITY_LEVELS.LOW;
        console.log('[QualityManager] Auto-adjusted to LOW (very low FPS)');
      }
    }

    // If FPS is consistently high, upgrade
    else if (stats.average > 55 && this.currentQuality !== QUALITY_LEVELS.HIGH) {
      if (this.currentQuality === QUALITY_LEVELS.LOW) {
        this.currentQuality = QUALITY_LEVELS.MEDIUM;
        console.log('[QualityManager] Auto-adjusted to MEDIUM (high FPS)');
      } else if (this.currentQuality === QUALITY_LEVELS.MEDIUM) {
        this.currentQuality = QUALITY_LEVELS.HIGH;
        console.log('[QualityManager] Auto-adjusted to HIGH (very high FPS)');
      }
    }
  }

  /**
   * Get FPS statistics
   */
  getStats() {
    return this.fpsMonitor.getStats();
  }
}

/**
 * Memory Monitor
 * Tracks memory usage (if available)
 */
export class MemoryMonitor {
  constructor() {
    this.supported = !!performance.memory;
  }

  /**
   * Get current memory usage
   */
  getUsage() {
    if (!this.supported) {
      return null;
    }

    const memory = performance.memory;
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
    };
  }

  /**
   * Check if memory usage is concerning
   */
  isMemoryHigh() {
    const usage = this.getUsage();
    return usage ? usage.percentage > 80 : false;
  }
}

/**
 * Create global performance manager instance
 */
let globalQualityManager = null;

export function getQualityManager() {
  if (!globalQualityManager) {
    globalQualityManager = new QualityManager(QUALITY_LEVELS.AUTO);
  }
  return globalQualityManager;
}

export default {
  FPSMonitor,
  QualityManager,
  MemoryMonitor,
  QUALITY_LEVELS,
  QUALITY_PRESETS,
  getQualityManager,
};
