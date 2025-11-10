/**
 * Ball Timeline Animations
 * Handles slap → compression → supernova → reveal timeline for ball interactions
 */

import gsap from 'gsap';
import type { MorphRef } from '../components/morphs/Origin';

export interface BallTimelineOptions {
  morphRef: React.RefObject<MorphRef>;
  performanceMode: 'high' | 'medium' | 'low';
  isMobile: boolean;
}

/**
 * Slap reaction animation (0-240ms)
 * Ball receives quick scale-rubber with rotation jitter
 */
export function playSlapAnimation(options: BallTimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline();
  const { morphRef, performanceMode } = options;

  if (!morphRef.current) return tl;

  // Play slap sound immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kairo:play-ball-sound', {
      detail: { type: 'slap', volume: 0.7 }
    }));
  }

  // Get the group element from the morph ref
  const morphElement = (morphRef.current as any).groupRef?.current;
  if (!morphElement) {
    console.warn('[ballTimeline] No group element found for slap animation');
    return tl;
  }

  // Slap rubber bounce: 1 → 0.88 → 1.15 → 1.00 over 240ms
  tl.to(morphElement.scale, {
    x: 0.88,
    y: 0.88,
    z: 0.88,
    duration: 0.08,
    ease: 'power2.in',
  })
  .to(morphElement.scale, {
    x: 1.15,
    y: 1.15,
    z: 1.15,
    duration: 0.10,
    ease: 'power2.out',
  })
  .to(morphElement.scale, {
    x: 1.0,
    y: 1.0,
    z: 1.0,
    duration: 0.06,
    ease: 'elastic.out(1, 0.3)',
  });

  return tl;
}

/**
 * Compression animation (240-420ms)
 * Ball compresses inward with emissive intensity ramp
 */
export function playCompressionAnimation(options: BallTimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline();
  const { morphRef } = options;

  if (!morphRef.current) return tl;

  // Play compression sound
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kairo:play-ball-sound', {
      detail: { type: 'compression' }
    }));
  }

  const morphElement = (morphRef.current as any).groupRef?.current;
  const meshElement = (morphRef.current as any).meshRef?.current;

  if (!morphElement) {
    console.warn('[ballTimeline] No group element found for compression animation');
    return tl;
  }

  // Compress inward: 1.0 → 0.75 over 180ms
  tl.to(morphElement.scale, {
    x: 0.75,
    y: 0.75,
    z: 0.75,
    duration: 0.18,
    ease: 'power3.in',
  });

  // Ramp up emissive intensity if material supports it
  if (meshElement?.material) {
    const material = meshElement.material;
    if ('emissiveIntensity' in material) {
      tl.to(material, {
        emissiveIntensity: (material as any).emissiveIntensity * 2.5,
        duration: 0.18,
        ease: 'power3.in',
      }, '<');
    } else if ('uniforms' in material && (material as any).uniforms?.u_emissive) {
      // For shader materials
      tl.to((material as any).uniforms.u_emissive, {
        value: (material as any).uniforms.u_emissive.value * 2.5,
        duration: 0.18,
        ease: 'power3.in',
      }, '<');
    }
  }

  return tl;
}

/**
 * Supernova burst animation (420-920ms)
 * Radial shock rings expand outward with camera path
 */
export function playBurstAnimation(options: BallTimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline();
  const { morphRef } = options;

  if (morphRef.current) {
    // Trigger existing supernova burst
    morphRef.current.supernovaBurst();
  }

  // Play burst sound
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kairo:play-ball-sound', {
      detail: { type: 'burst', volume: 0.8 }
    }));
  }

  return tl;
}

/**
 * Complete ball opening timeline
 * Orchestrates the full sequence: slap → compression → burst → reveal
 */
export async function playBallOpeningTimeline(options: BallTimelineOptions): Promise<void> {
  const { isMobile, performanceMode } = options;

  // Use simplified timeline for mobile/low performance
  if (isMobile || performanceMode === 'low') {
    // Simplified 640ms timeline
    const tl = gsap.timeline();
    playSlapAnimation(options);
    await new Promise(resolve => setTimeout(resolve, 200));
    playBurstAnimation(options);
    await new Promise(resolve => setTimeout(resolve, 440));
    return;
  }

  // Full desktop timeline
  // Slap (0-240ms)
  playSlapAnimation(options);
  await new Promise(resolve => setTimeout(resolve, 240));

  // Compression (240-420ms)
  playCompressionAnimation(options);
  await new Promise(resolve => setTimeout(resolve, 180));

  // Burst (420-920ms)
  playBurstAnimation(options);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Reveal & settle handled by sceneAPI timing (920-2260ms)
}

/**
 * Ball closing/reverse animation
 */
export async function playBallClosingTimeline(options: BallTimelineOptions): Promise<void> {
  const { isMobile, performanceMode } = options;

  // Quick fade out
  const duration = isMobile || performanceMode === 'low' ? 400 : 800;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kairo:play-ball-sound', {
      detail: { type: 'close' }
    }));
  }

  await new Promise(resolve => setTimeout(resolve, duration));
}
