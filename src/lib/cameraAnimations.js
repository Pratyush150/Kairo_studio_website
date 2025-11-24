import gsap from 'gsap';
import * as THREE from 'three';

/**
 * Camera Animation Utilities
 * GSAP-based camera transitions for micro-scenes
 */

/**
 * Animate camera to target position
 * @param {THREE.Camera} camera - Three.js camera
 * @param {Object} controls - OrbitControls instance
 * @param {Object} target - Target configuration
 * @param {number} duration - Animation duration in seconds
 * @param {function} onComplete - Completion callback
 */
export function animateCameraToTarget(
  camera,
  controls,
  target,
  duration = 1.5,
  onComplete = null
) {
  const {
    position = [0, 0, 5],
    lookAt = [0, 0, 0],
    fov = 50,
  } = target;

  // Create timeline
  const timeline = gsap.timeline({
    onComplete: () => {
      if (controls) {
        controls.target.set(...lookAt);
        controls.update();
      }
      if (onComplete) onComplete();
    },
  });

  // Animate camera position
  timeline.to(
    camera.position,
    {
      x: position[0],
      y: position[1],
      z: position[2],
      duration,
      ease: 'power2.inOut',
    },
    0
  );

  // Animate FOV if specified
  if (fov !== camera.fov) {
    timeline.to(
      camera,
      {
        fov,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      },
      0
    );
  }

  // Animate controls target
  if (controls) {
    timeline.to(
      controls.target,
      {
        x: lookAt[0],
        y: lookAt[1],
        z: lookAt[2],
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          controls.update();
        },
      },
      0
    );
  }

  return timeline;
}

/**
 * Zoom into module micro-scene
 * @param {THREE.Camera} camera
 * @param {Object} controls
 * @param {string} moduleId
 * @param {function} onComplete
 */
export function zoomToModule(camera, controls, moduleId, onComplete) {
  const moduleTargets = {
    saas: {
      position: [0, 2.5, 3],
      lookAt: [0, 1.3, 0],
      fov: 40,
    },
    automation: {
      position: [2.5, 0, 2],
      lookAt: [1.2, -0.3, 0],
      fov: 40,
    },
    integration: {
      position: [-2.5, 0, 2],
      lookAt: [-1.2, -0.3, 0],
      fov: 40,
    },
  };

  const target = moduleTargets[moduleId] || moduleTargets.saas;

  console.log(`[CameraAnimation] Zooming to ${moduleId}:`, target);

  return animateCameraToTarget(camera, controls, target, 1.2, onComplete);
}

/**
 * Return to main brain view
 * @param {THREE.Camera} camera
 * @param {Object} controls
 * @param {function} onComplete
 */
export function returnToMainView(camera, controls, onComplete) {
  const mainTarget = {
    position: [0, 0, 5],
    lookAt: [0, 0, 0],
    fov: 50,
  };

  console.log('[CameraAnimation] Returning to main view');

  return animateCameraToTarget(camera, controls, mainTarget, 1.0, onComplete);
}

/**
 * Get module camera target
 * @param {string} moduleId
 */
export function getModuleCameraTarget(moduleId) {
  const targets = {
    saas: {
      position: [0, 2.5, 3],
      lookAt: [0, 1.3, 0],
      fov: 40,
    },
    automation: {
      position: [2.5, 0, 2],
      lookAt: [1.2, -0.3, 0],
      fov: 40,
    },
    integration: {
      position: [-2.5, 0, 2],
      lookAt: [-1.2, -0.3, 0],
      fov: 40,
    },
  };

  return targets[moduleId] || targets.saas;
}
