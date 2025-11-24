/**
 * Asset Manifest System
 * Manages asset paths, LOD levels, and loading priorities
 */

/**
 * Asset Manifest
 * Maps logical asset names to actual file paths and metadata
 */
export const ASSET_MANIFEST = {
  // Brain Core Models (LOD levels)
  brainCore: {
    lod0: {
      path: '/assets/models/brain_core.lod0.glb',
      size: 0, // Will be populated by build script
      priority: 'high', // Load immediately
      description: 'Brain core - Low poly (preload)',
    },
    lod1: {
      path: '/assets/models/brain_core.lod1.glb',
      size: 0,
      priority: 'medium', // Load after initial render
      description: 'Brain core - Medium poly',
    },
    lod2: {
      path: '/assets/models/brain_core.lod2.glb',
      size: 0,
      priority: 'low', // Load on demand or after everything else
      description: 'Brain core - High poly',
    },
  },

  // Module Models
  modules: {
    saas: {
      path: '/assets/models/module_saas.glb',
      size: 0,
      priority: 'lazy', // Load only when user interacts
      description: 'SaaS module detail model',
    },
    automation: {
      path: '/assets/models/module_automation.glb',
      size: 0,
      priority: 'lazy',
      description: 'Automation module detail model',
    },
    integration: {
      path: '/assets/models/module_integration.glb',
      size: 0,
      priority: 'lazy',
      description: 'Integration module detail model',
    },
  },

  // Textures
  textures: {
    fiberBase: {
      path: '/assets/textures/fiber_base.ktx2',
      size: 0,
      priority: 'medium',
      description: 'Base emissive fiber texture',
    },
    aoBase: {
      path: '/assets/textures/ao_base.ktx2',
      size: 0,
      priority: 'medium',
      description: 'Ambient occlusion texture',
    },
  },
};

/**
 * Get assets by priority level
 * @param {string} priority - Priority level (high, medium, low, lazy)
 * @returns {Array} Array of asset objects with metadata
 */
export function getAssetsByPriority(priority) {
  const assets = [];

  const traverse = (obj, category) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value.path && value.priority === priority) {
        assets.push({
          category,
          name: key,
          ...value,
        });
      } else if (typeof value === 'object' && !value.path) {
        traverse(value, category || key);
      }
    });
  };

  traverse(ASSET_MANIFEST);
  return assets;
}

/**
 * Get asset path by logical name
 * @param {string} category - Asset category (e.g., 'brainCore', 'modules')
 * @param {string} name - Asset name (e.g., 'lod0', 'saas')
 * @returns {string|null} Asset path or null if not found
 */
export function getAssetPath(category, name) {
  const asset = ASSET_MANIFEST[category]?.[name];
  return asset?.path || null;
}

/**
 * Get all high-priority assets (for preloading)
 * @returns {Array<string>} Array of asset paths
 */
export function getPreloadAssets() {
  return getAssetsByPriority('high').map(asset => asset.path);
}

/**
 * Get loading queue (ordered by priority)
 * @returns {Array} Ordered array of assets to load
 */
export function getLoadingQueue() {
  const priorities = ['high', 'medium', 'low'];
  const queue = [];

  priorities.forEach(priority => {
    const assets = getAssetsByPriority(priority);
    queue.push(...assets);
  });

  return queue;
}

/**
 * Validate that asset exists in manifest
 * @param {string} category - Asset category
 * @param {string} name - Asset name
 * @returns {boolean} True if asset exists
 */
export function assetExists(category, name) {
  return !!ASSET_MANIFEST[category]?.[name];
}

/**
 * Get total estimated download size (in bytes)
 * @returns {number} Total size in bytes
 */
export function getTotalAssetSize() {
  let totalSize = 0;

  const traverse = (obj) => {
    Object.values(obj).forEach(value => {
      if (value.size) {
        totalSize += value.size;
      } else if (typeof value === 'object' && !value.path) {
        traverse(value);
      }
    });
  };

  traverse(ASSET_MANIFEST);
  return totalSize;
}

export default {
  ASSET_MANIFEST,
  getAssetsByPriority,
  getAssetPath,
  getPreloadAssets,
  getLoadingQueue,
  assetExists,
  getTotalAssetSize,
};
