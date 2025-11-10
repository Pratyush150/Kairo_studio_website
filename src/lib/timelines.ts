/**
 * GSAP Timeline Orchestrator
 * Exact implementation per specification:
 * - Transit timeline (900ms) - Camera through tunnel
 * - Star burst timeline (700ms) - Star explodes and spawns element
 * - Open timeline (1500ms) - Slap → supernova → panel reveal
 */

import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import * as THREE from 'three';
import { useSceneStore, getElementPosition, computeTunnelMidpoint, ELEMENT_ORDER } from './sceneAPI';
import { morphs } from './tokens';

// Register GSAP plugins
gsap.registerPlugin(MotionPathPlugin);

export interface TimelineContext {
  camera: THREE.Camera;
  scene: THREE.Scene;
  postprocess?: {
    chromatic?: { amount: number };
  };
}

/**
 * TIMELINE 1: Transit (A → B via tunnel)
 * Duration: 900ms
 * States: TRANSIT_PENDING → TRANSITING → STAR_BURST
 */
export function createTransitTimeline(ctx: TimelineContext): gsap.core.Timeline {
  const state = useSceneStore.getState();
  const { currentIndex, targetIndex } = state;

  if (targetIndex === null) {
    console.error('[timelines] No target index for transit');
    return gsap.timeline();
  }

  // Get positions
  const fromPos = getElementPosition(currentIndex, true);  // Active at origin
  const toPos = getElementPosition(targetIndex, false);     // Target offscreen
  const midTunnel = computeTunnelMidpoint(fromPos, toPos);

  // Approach position (80% to target)
  const approachPos: [number, number, number] = [
    fromPos[0] + (toPos[0] - fromPos[0]) * 0.8,
    fromPos[1] + (toPos[1] - fromPos[1]) * 0.8,
    fromPos[2] + (toPos[2] - fromPos[2]) * 0.8,
  ];

  console.log('[timelines] Transit:', { fromPos, midTunnel, approachPos, toPos });

  // Create timeline
  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onStart: () => {
      console.log('[timelines] Transit START');
      state.setState('TRANSITING');
      state.setTunnelActive(true);
    },
    onComplete: () => {
      console.log('[timelines] Transit COMPLETE → Star burst');
      state.setState('STAR_BURST');
      state.setTunnelActive(false);
    },
  });

  // Camera motion path (0-900ms)
  tl.to(ctx.camera.position, {
    duration: 0.9,
    motionPath: {
      path: [
        { x: fromPos[0], y: fromPos[1], z: fromPos[2] + 100 }, // Start position (pulled back)
        { x: midTunnel[0], y: midTunnel[1], z: midTunnel[2] }, // Mid tunnel
        { x: approachPos[0], y: approachPos[1], z: approachPos[2] + 60 }, // Approach
      ],
      curviness: 1.2,
    },
    onUpdate: function() {
      // Update camera lookAt
      const progress = this.progress();
      const targetLookAt = new THREE.Vector3(
        fromPos[0] + (toPos[0] - fromPos[0]) * progress,
        fromPos[1] + (toPos[1] - fromPos[1]) * progress,
        fromPos[2] + (toPos[2] - fromPos[2]) * progress
      );
      ctx.camera.lookAt(targetLookAt);
      ctx.camera.updateProjectionMatrix();
    },
  }, 0);

  // Chromatic aberration pulse (360-480ms)
  if (ctx.postprocess?.chromatic) {
    tl.to(ctx.postprocess.chromatic, {
      duration: 0.12,
      amount: 0.012,
      yoyo: true,
      repeat: 1,
    }, 0.36);
  }

  // Spawn tunnel effect (at 20ms)
  tl.call(() => {
    console.log('[timelines] Spawning tunnel effect');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:spawn-tunnel', {
        detail: { midPoint: midTunnel, direction: state.transitDirection }
      }));
    }
  }, undefined, 0.02);

  // Fade non-target entities (at 20ms)
  tl.call(() => {
    console.log('[timelines] Fading non-target entities');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:fade-entities', {
        detail: { targetIndex }
      }));
    }
  }, undefined, 0.02);

  // Unlock input at end (930ms)
  tl.call(() => {
    // Don't unlock yet - burst timeline will handle it
    console.log('[timelines] Transit complete, ready for burst');
  }, undefined, 0.93);

  return tl;
}

/**
 * TIMELINE 2: Star Burst
 * Duration: 700ms
 * States: STAR_BURST → ELEMENT_ACTIVE
 */
export function createStarBurstTimeline(ctx: TimelineContext): gsap.core.Timeline {
  const state = useSceneStore.getState();
  const { targetIndex } = state;

  if (targetIndex === null) {
    console.error('[timelines] No target index for star burst');
    return gsap.timeline();
  }

  const targetElement = ELEMENT_ORDER[targetIndex];
  const targetPos = getElementPosition(targetIndex, true); // Will be at origin

  // Star spawn location - randomized offset
  const radialOffset = 40 + Math.random() * 80; // 40-120
  const angleOffset = Math.random() * Math.PI * 2;
  const verticalOffset = -10 + Math.random() * 20; // -10 to +10

  const starPos: [number, number, number] = [
    targetPos[0] + Math.cos(angleOffset) * radialOffset,
    targetPos[1] + verticalOffset,
    targetPos[2] + Math.sin(angleOffset) * radialOffset,
  ];

  console.log('[timelines] Star burst:', { targetElement, starPos });

  // Create timeline
  const tl = gsap.timeline({
    defaults: { ease: 'cubic-bezier(.34,1.56,.64,1)' },
    onStart: () => {
      console.log('[timelines] Star burst START');
      state.setStarBurstActive(true);
    },
    onComplete: () => {
      console.log('[timelines] Star burst COMPLETE → Element active');
      state.setState('ELEMENT_ACTIVE');
      state.setStarBurstActive(false);
      state.setInputLocked(false);
      state.setCurrentIndex(targetIndex);
      useSceneStore.setState({ targetIndex: null, transitDirection: null });
    },
  });

  // Create star (0ms)
  tl.call(() => {
    console.log('[timelines] Creating star at', starPos);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:create-star', {
        detail: { position: starPos, targetElement }
      }));
    }
  }, undefined, 0);

  // Compress star (0-180ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:star-compress', {
        detail: {
          scale: { x: 0.18, y: 0.18, z: 0.18 },
          emissiveIntensity: 1.6,
          duration: 0.18,
        }
      }));
    }
  }, undefined, 0);

  // Explode star (180-740ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:star-explode', {
        detail: {
          scale: { x: 6, y: 6, z: 6 },
          duration: 0.56,
        }
      }));
    }
  }, undefined, 0.18);

  // Emit shard particles (360ms)
  tl.call(() => {
    console.log('[timelines] Emitting shard particles');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:emit-shards', {
        detail: {
          position: starPos,
          count: state.isMobile ? 160 : 240,
        }
      }));
    }
  }, undefined, 0.36);

  // Fade star (720-900ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:star-fade', {
        detail: { duration: 0.18 }
      }));
    }
  }, undefined, 0.72);

  // Spawn element at origin (740ms)
  tl.call(() => {
    console.log('[timelines] Spawning element:', targetElement);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:spawn-element', {
        detail: { element: targetElement, position: targetPos }
      }));
    }
  }, undefined, 0.74);

  return tl;
}

/**
 * TIMELINE 3: Open Element (Slap → Supernova → Panel)
 * Duration: 1500ms
 * States: OPENING_CONTENT → CONTENT_OPEN
 */
export function createOpenTimeline(ctx: TimelineContext): gsap.core.Timeline {
  const state = useSceneStore.getState();
  const { activeElement } = state;
  const slug = morphs[activeElement].slug;

  console.log('[timelines] Open element:', activeElement);

  // Create timeline
  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onStart: () => {
      console.log('[timelines] Open START - Slap → Supernova → Reveal');
    },
    onComplete: () => {
      console.log('[timelines] Open COMPLETE → Content open');
      state.setState('CONTENT_OPEN');
      state.setPanelOpen(true);
      state.setInputLocked(false);

      // Update URL
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/#' + slug);
      }

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'element_opened', {
          element: activeElement,
          slug,
        });
      }
    },
  });

  // === SLAP MICRO (0-240ms) ===

  // Play slap sound (0ms)
  tl.call(() => {
    console.log('[timelines] SLAP - Playing slap sound');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:play-sound', {
        detail: { type: 'slap_click', volume: 0.7 }
      }));
    }
  }, undefined, 0);

  // Scale compress (0-60ms): 1.0 → 0.88
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:element-animate', {
        detail: {
          type: 'slap-compress',
          scale: { x: 0.88, y: 0.88, z: 0.88 },
          duration: 0.06,
          ease: 'power1.in',
        }
      }));
    }
  }, undefined, 0);

  // Scale expand (60-180ms): 0.88 → 1.15
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:element-animate', {
        detail: {
          type: 'slap-expand',
          scale: { x: 1.15, y: 1.15, z: 1.15 },
          duration: 0.12,
          ease: 'power2.out',
        }
      }));
    }
  }, undefined, 0.06);

  // === COMPRESSION (180-360ms) ===

  // Play compression sound (180ms)
  tl.call(() => {
    console.log('[timelines] COMPRESSION - Playing swell sound');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:play-sound', {
        detail: { type: 'slap_swell', pitchUp: true }
      }));
    }
  }, undefined, 0.18);

  // Deep compression (180-360ms): 1.15 → 0.14
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:element-animate', {
        detail: {
          type: 'compression',
          scale: { x: 0.14, y: 0.14, z: 0.14 },
          emissiveIntensity: 1.4,
          duration: 0.18,
          ease: 'power3.in',
        }
      }));
    }
  }, undefined, 0.18);

  // === SUPERNOVA BURST (360-920ms) ===

  // Play burst sound (360ms)
  tl.call(() => {
    console.log('[timelines] SUPERNOVA - Playing burst sound');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:play-sound', {
        detail: { type: 'supernova_burst', spatialized: true, volume: 0.8 }
      }));
    }
  }, undefined, 0.36);

  // Explosive burst (360-920ms): 0.14 → shader distortion
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:element-animate', {
        detail: {
          type: 'supernova-burst',
          duration: 0.56,
          ease: 'power4.out',
        }
      }));
    }
  }, undefined, 0.36);

  // Spawn radial rings (360ms)
  tl.call(() => {
    console.log('[timelines] Spawning radial rings');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:spawn-radial-rings', {
        detail: { position: [0, 0, 0], count: 3 }
      }));
    }
  }, undefined, 0.36);

  // Emit panel shards (520ms)
  tl.call(() => {
    console.log('[timelines] Emitting panel shards');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:emit-panel-shards', {
        detail: {
          position: [0, 0, 0],
          count: state.isMobile ? 60 : 180,
        }
      }));
    }
  }, undefined, 0.52);

  // === PANEL REVEAL (920-1500ms) ===

  // Move camera near panel (920-1500ms)
  tl.to(ctx.camera.position, {
    z: ctx.camera.position.z - 40,
    duration: 0.58,
    ease: 'power3.inOut',
  }, 0.92);

  // Mount DOM panel (1020ms)
  tl.call(() => {
    console.log('[timelines] Mounting DOM panel');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:mount-panel', {
        detail: { slug }
      }));

      // Play reveal chime
      window.dispatchEvent(new CustomEvent('kairo:play-sound', {
        detail: { type: 'reveal_chime' }
      }));
    }
  }, undefined, 1.02);

  // Fade in panel DOM (1020-1440ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:fade-panel', {
        detail: { opacity: 1, duration: 0.42 }
      }));
    }
  }, undefined, 1.02);

  return tl;
}

/**
 * TIMELINE 4: Close Content (reverse of open)
 * Duration: 800ms
 * States: CLOSING_CONTENT → ELEMENT_ACTIVE
 */
export function createCloseTimeline(ctx: TimelineContext): gsap.core.Timeline {
  const state = useSceneStore.getState();

  console.log('[timelines] Close content');

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onStart: () => {
      console.log('[timelines] Close START');
    },
    onComplete: () => {
      console.log('[timelines] Close COMPLETE → Element active');
      state.setState('ELEMENT_ACTIVE');
      state.setInputLocked(false);
      state.setPanelOpen(false);
      state.setPanelContent(null);
    },
  });

  // Fade out panel (0-400ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:fade-panel', {
        detail: { opacity: 0, duration: 0.4 }
      }));
    }
  }, undefined, 0);

  // Move camera back (200-800ms)
  tl.to(ctx.camera.position, {
    z: ctx.camera.position.z + 40,
    duration: 0.6,
    ease: 'power3.inOut',
  }, 0.2);

  // Unmount panel (400ms)
  tl.call(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:unmount-panel'));
    }
  }, undefined, 0.4);

  return tl;
}

/**
 * Timeline manager - singleton to manage active timelines
 */
class TimelineManager {
  private activeTimeline: gsap.core.Timeline | null = null;
  private context: TimelineContext | null = null;

  setContext(ctx: TimelineContext) {
    this.context = ctx;
  }

  playTransit(): Promise<void> {
    if (!this.context) {
      console.error('[TimelineManager] No context set');
      return Promise.resolve();
    }

    this.kill();
    this.activeTimeline = createTransitTimeline(this.context);
    return this.activeTimeline.then(() => {
      // After transit, play burst
      return this.playStarBurst();
    });
  }

  playStarBurst(): Promise<void> {
    if (!this.context) {
      console.error('[TimelineManager] No context set');
      return Promise.resolve();
    }

    this.kill();
    this.activeTimeline = createStarBurstTimeline(this.context);
    return this.activeTimeline.then(() => {
      this.activeTimeline = null;
    });
  }

  playOpen(): Promise<void> {
    if (!this.context) {
      console.error('[TimelineManager] No context set');
      return Promise.resolve();
    }

    this.kill();
    this.activeTimeline = createOpenTimeline(this.context);
    return this.activeTimeline.then(() => {
      this.activeTimeline = null;
    });
  }

  playClose(): Promise<void> {
    if (!this.context) {
      console.error('[TimelineManager] No context set');
      return Promise.resolve();
    }

    this.kill();
    this.activeTimeline = createCloseTimeline(this.context);
    return this.activeTimeline.then(() => {
      this.activeTimeline = null;
    });
  }

  kill() {
    if (this.activeTimeline) {
      this.activeTimeline.kill();
      this.activeTimeline = null;
    }
  }
}

export const timelineManager = new TimelineManager();
