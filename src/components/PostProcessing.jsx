import React, { useMemo } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { getQualityManager } from '../utils/perf';

/**
 * PostProcessing Component
 * Adds visual polish with bloom, chromatic aberration, and vignette
 *
 * @param {Object} props
 * @param {boolean} props.enabled - Enable/disable effects
 * @param {number} props.scrollProgress - Scroll progress for dynamic effects
 * @param {string} props.quality - Quality preset (low, medium, high, auto)
 */
export default function PostProcessing({
  enabled = true,
  scrollProgress = 0,
  quality = 'auto',
}) {
  const qualityManager = getQualityManager();

  // Determine quality level
  const effectQuality = useMemo(() => {
    if (quality === 'auto') {
      return qualityManager.currentQuality;
    }
    return quality;
  }, [quality, qualityManager.currentQuality]);

  // Quality-based settings
  const settings = useMemo(() => {
    const presets = {
      low: {
        bloomEnabled: true,
        bloomIntensity: 0.3,
        bloomLuminanceThreshold: 0.9,
        bloomLuminanceSmoothing: 0.4,
        bloomRadius: 0.3,
        chromaticAberrationEnabled: false,
        chromaticAberrationOffset: 0,
        vignetteEnabled: true,
        vignetteOpacity: 0.3,
      },
      medium: {
        bloomEnabled: true,
        bloomIntensity: 0.5,
        bloomLuminanceThreshold: 0.8,
        bloomLuminanceSmoothing: 0.5,
        bloomRadius: 0.5,
        chromaticAberrationEnabled: true,
        chromaticAberrationOffset: 0.001,
        vignetteEnabled: true,
        vignetteOpacity: 0.4,
      },
      high: {
        bloomEnabled: true,
        bloomIntensity: 0.8,
        bloomLuminanceThreshold: 0.7,
        bloomLuminanceSmoothing: 0.6,
        bloomRadius: 0.8,
        chromaticAberrationEnabled: true,
        chromaticAberrationOffset: 0.002,
        vignetteEnabled: true,
        vignetteOpacity: 0.5,
      },
    };

    return presets[effectQuality] || presets.medium;
  }, [effectQuality]);

  // Dynamic bloom intensity based on scroll
  const dynamicBloomIntensity = useMemo(() => {
    // Increase bloom slightly as you scroll
    return settings.bloomIntensity * (1 + scrollProgress * 0.3);
  }, [settings.bloomIntensity, scrollProgress]);

  if (!enabled) return null;

  return (
    <EffectComposer>
      {/* Bloom Effect - Thresholded for emissive materials */}
      {settings.bloomEnabled && (
        <Bloom
          intensity={dynamicBloomIntensity}
          luminanceThreshold={settings.bloomLuminanceThreshold}
          luminanceSmoothing={settings.bloomLuminanceSmoothing}
          radius={settings.bloomRadius}
          blendFunction={BlendFunction.SCREEN}
          mipmapBlur
        />
      )}

      {/* Chromatic Aberration - Subtle color fringing */}
      {settings.chromaticAberrationEnabled && (
        <ChromaticAberration
          offset={new THREE.Vector2(
            settings.chromaticAberrationOffset,
            settings.chromaticAberrationOffset
          )}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {/* Vignette - Darkens edges */}
      {settings.vignetteEnabled && (
        <Vignette
          offset={0.3}
          darkness={settings.vignetteOpacity}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
}

/**
 * Get recommended postprocessing quality based on performance
 */
export function getRecommendedPostProcessingQuality() {
  const qualityManager = getQualityManager();
  const stats = qualityManager.getStats();

  // Disable heavy effects if FPS is low
  if (stats.average < 30) {
    return 'low';
  } else if (stats.average < 45) {
    return 'medium';
  }
  return 'high';
}
