/**
 * Advanced FPS Optimization Utilities
 * Memory pooling, texture compression, and performance helpers
 */

import * as THREE from 'three';

/**
 * Object pool for reusing THREE.js objects
 */
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset?: (obj: T) => void;

  constructor(factory: () => T, reset?: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T) {
    if (this.reset) {
      this.reset(obj);
    }
    this.pool.push(obj);
  }

  clear() {
    this.pool = [];
  }

  get size() {
    return this.pool.length;
  }
}

/**
 * Pre-created object pools for common types
 */
export const vector3Pool = new ObjectPool(
  () => new THREE.Vector3(),
  (v) => v.set(0, 0, 0),
  50
);

export const quaternionPool = new ObjectPool(
  () => new THREE.Quaternion(),
  (q) => q.set(0, 0, 0, 1),
  20
);

export const colorPool = new ObjectPool(
  () => new THREE.Color(),
  (c) => c.set(0xffffff),
  20
);

/**
 * Frustum culling helper
 * Returns true if object is visible in camera frustum
 */
export function isInFrustum(
  object: THREE.Object3D,
  camera: THREE.Camera
): boolean {
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4();

  matrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);

  if (object instanceof THREE.Mesh && object.geometry.boundingSphere) {
    return frustum.intersectsSphere(object.geometry.boundingSphere);
  }

  return true; // Default to visible if can't determine
}

/**
 * Compress texture for better memory usage
 */
export function compressTexture(texture: THREE.Texture): THREE.Texture {
  // Enable mipmaps
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Anisotropic filtering for better quality at angles
  texture.anisotropy = 4;

  return texture;
}

/**
 * Optimize geometry by merging vertices and computing normals
 */
export function optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Compute bounding sphere for frustum culling
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();

  // Compute vertex normals if not present
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }

  return geometry;
}

/**
 * Dispose of THREE.js objects properly to prevent memory leaks
 */
export function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => disposeMaterial(material));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

/**
 * Dispose of material and its textures
 */
function disposeMaterial(material: THREE.Material) {
  material.dispose();

  // Dispose textures
  Object.keys(material).forEach((key) => {
    const value = (material as any)[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();
    }
  });
}

/**
 * Create instanced mesh for better performance with many identical objects
 */
export function createInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return mesh;
}

/**
 * Update instance matrix for instanced mesh
 */
export function updateInstanceMatrix(
  mesh: THREE.InstancedMesh,
  index: number,
  position: THREE.Vector3,
  rotation: THREE.Euler,
  scale: THREE.Vector3
) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion().setFromEuler(rotation);
  matrix.compose(position, quaternion, scale);
  mesh.setMatrixAt(index, matrix);
  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * Batch dispose multiple objects
 */
export function batchDispose(objects: THREE.Object3D[]) {
  objects.forEach((obj) => disposeObject(obj));
}

/**
 * Get memory usage estimate (browser specific)
 */
export function getMemoryUsage(): { used: number; total: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    };
  }
  return null;
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Check if device is mobile for optimization decisions
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get optimal performance mode based on device capabilities
 */
export function getOptimalPerformanceMode(): 'high' | 'medium' | 'low' {
  const isMobile = isMobileDevice();
  const memory = getMemoryUsage();

  // Mobile devices default to medium
  if (isMobile) return 'medium';

  // Low memory devices
  if (memory && memory.total < 2048) return 'low';

  // High-end devices
  if (memory && memory.total > 4096) return 'high';

  // Default to medium
  return 'medium';
}
