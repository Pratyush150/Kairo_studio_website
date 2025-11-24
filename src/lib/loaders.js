/**
 * Central Loaders Utility
 * Configures and exports DRACO, KTX2, and GLTF loaders for the application
 */

import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Singleton instances
let dracoLoader = null;
let ktx2Loader = null;
let gltfLoader = null;

/**
 * Initialize and configure all loaders
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @returns {Object} Object containing configured loaders
 */
export function createLoaders(renderer) {
  // Initialize DRACO Loader (for compressed geometry)
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder (WASM as fallback)
    dracoLoader.preload();

    console.log('[Loaders] DRACO decoder initialized');
  }

  // Initialize KTX2 Loader (for compressed textures)
  if (!ktx2Loader && renderer) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');
    ktx2Loader.detectSupport(renderer);

    console.log('[Loaders] KTX2 transcoder initialized');
  }

  // Initialize GLTF Loader
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    if (ktx2Loader) {
      gltfLoader.setKTX2Loader(ktx2Loader);
    }

    console.log('[Loaders] GLTF loader initialized with DRACO and KTX2 support');
  }

  return {
    draco: dracoLoader,
    ktx2: ktx2Loader,
    gltf: gltfLoader,
  };
}

/**
 * Dispose of all loaders (cleanup)
 */
export function disposeLoaders() {
  if (dracoLoader) {
    dracoLoader.dispose();
    dracoLoader = null;
  }

  if (ktx2Loader) {
    ktx2Loader.dispose();
    ktx2Loader = null;
  }

  gltfLoader = null;

  console.log('[Loaders] All loaders disposed');
}

/**
 * Load a GLTF model with progress tracking
 * @param {string} url - Path to GLTF file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<GLTF>} Loaded GLTF object
 */
export function loadGLTF(url, onProgress = null) {
  if (!gltfLoader) {
    throw new Error('GLTF loader not initialized. Call createLoaders() first.');
  }

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        console.log(`[Loaders] Successfully loaded: ${url}`);
        resolve(gltf);
      },
      (progress) => {
        if (onProgress) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          onProgress(percentComplete, progress);
        }
      },
      (error) => {
        console.error(`[Loaders] Error loading ${url}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Preload multiple GLTF models
 * @param {Array<string>} urls - Array of GLTF file paths
 * @returns {Promise<Array<GLTF>>} Array of loaded GLTF objects
 */
export async function preloadGLTFs(urls) {
  console.log(`[Loaders] Preloading ${urls.length} GLTF models...`);

  try {
    const models = await Promise.all(urls.map(url => loadGLTF(url)));
    console.log('[Loaders] All models preloaded successfully');
    return models;
  } catch (error) {
    console.error('[Loaders] Error preloading models:', error);
    throw error;
  }
}

/**
 * Get current loaders (if already initialized)
 * @returns {Object|null} Loaders object or null
 */
export function getLoaders() {
  if (!gltfLoader) {
    console.warn('[Loaders] Loaders not yet initialized');
    return null;
  }

  return {
    draco: dracoLoader,
    ktx2: ktx2Loader,
    gltf: gltfLoader,
  };
}

export default {
  createLoaders,
  disposeLoaders,
  loadGLTF,
  preloadGLTFs,
  getLoaders,
};
