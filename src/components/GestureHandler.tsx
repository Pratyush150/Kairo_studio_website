/**
 * Gesture Handler
 * Handles drag/swipe gestures for navigation
 *
 * Desktop: Horizontal drag with velocity threshold
 * Mobile: Swipe gestures with two-tap to open
 */

import { useEffect, useRef, useState } from 'react';
import { useSceneStore, sceneAPI } from '../lib/sceneAPI';

export function GestureHandler() {
  const sceneState = useSceneStore((s) => s.sceneState);
  const inputLocked = useSceneStore((s) => s.inputLocked);
  const isMobile = useSceneStore((s) => s.isMobile);

  const [lastTapTime, setLastTapTime] = useState(0);
  const touchStartY = useRef(0);
  const hasScrolledVertically = useRef(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      const mobile = 'ontouchstart' in window || window.innerWidth < 768;
      useSceneStore.getState().setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only handle gestures in ELEMENT_ACTIVE state
    if (sceneState !== 'ELEMENT_ACTIVE' || inputLocked) {
      return;
    }

    // Desktop: Pointer drag
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Only left click
      useSceneStore.getState().onDragStart(e.clientX);
    };

    const handlePointerMove = (e: PointerEvent) => {
      useSceneStore.getState().onDragMove(e.clientX);
    };

    const handlePointerUp = (e: PointerEvent) => {
      useSceneStore.getState().onDragEnd(e.clientX);
    };

    // Mobile: Touch gestures
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartY.current = touch.clientY;
      hasScrolledVertically.current = false;
      useSceneStore.getState().onDragStart(touch.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dy = Math.abs(touch.clientY - touchStartY.current);

      // If user scrolls vertically > 40px, abort horizontal navigation
      if (dy > 40 && !hasScrolledVertically.current) {
        hasScrolledVertically.current = true;
        console.log('[GestureHandler] Vertical scroll detected, aborting horizontal nav');
        return;
      }

      if (!hasScrolledVertically.current) {
        useSceneStore.getState().onDragMove(touch.clientX);
        // Prevent default to avoid page scroll during horizontal drag
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (hasScrolledVertically.current) {
        hasScrolledVertically.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      useSceneStore.getState().onDragEnd(touch.clientX);

      // Double-tap to open (mobile)
      const now = Date.now();
      if (now - lastTapTime < 350) {
        console.log('[GestureHandler] Double-tap detected - opening element');
        sceneAPI.openActiveElement();
        setLastTapTime(0);
      } else {
        setLastTapTime(now);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        console.log('[GestureHandler] ArrowLeft - goToPrev');
        sceneAPI.goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        console.log('[GestureHandler] ArrowRight - goToNext');
        sceneAPI.goToNext();
      } else if (e.key === 'Enter' && !inputLocked) {
        e.preventDefault();
        console.log('[GestureHandler] Enter - openActiveElement');
        sceneAPI.openActiveElement();
      } else if (e.key === 'Escape' && sceneState === 'CONTENT_OPEN') {
        e.preventDefault();
        console.log('[GestureHandler] Escape - closeContent');
        sceneAPI.closeContent();
      }
    };

    // Mouse wheel navigation (optional)
    const handleWheel = (e: WheelEvent) => {
      // Only respond to significant horizontal scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 50) {
        e.preventDefault();
        if (e.deltaX > 0) {
          sceneAPI.goToNext();
        } else {
          sceneAPI.goToPrev();
        }
      }
    };

    // Add event listeners
    if (!isMobile) {
      window.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('wheel', handleWheel, { passive: false });
    } else {
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [sceneState, inputLocked, isMobile, lastTapTime]);

  // Visual feedback for drag
  useEffect(() => {
    const handleDragFeedback = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { dx, direction } = customEvent.detail;

      // Show visual feedback (could animate arrows, glow, etc.)
      console.log('[GestureHandler] Drag feedback:', direction, dx);
    };

    window.addEventListener('kairo:drag-feedback', handleDragFeedback);
    return () => window.removeEventListener('kairo:drag-feedback', handleDragFeedback);
  }, []);

  // This component doesn't render anything
  return null;
}
