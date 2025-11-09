import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';

interface TouchGestureState {
  isPinching: boolean;
  initialDistance: number;
  initialZoom: number;
  isRotating: boolean;
  lastTouchX: number;
  lastTouchY: number;
}

export function useTouchGestures() {
  const { camera, size } = useThree();
  const gestureState = useRef<TouchGestureState>({
    isPinching: false,
    initialDistance: 0,
    initialZoom: 120, // Default camera Z position
    isRotating: false,
    lastTouchX: 0,
    lastTouchY: 0,
  });

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Two fingers - start pinch gesture
      gestureState.current.isPinching = true;
      gestureState.current.initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
      gestureState.current.initialZoom = camera.position.z;

      console.log('[TouchGestures] Pinch gesture started');
    } else if (e.touches.length === 1) {
      // One finger - prepare for rotation
      gestureState.current.isRotating = true;
      gestureState.current.lastTouchX = e.touches[0].clientX;
      gestureState.current.lastTouchY = e.touches[0].clientY;
    }
  }, [camera, getTouchDistance]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling

    if (e.touches.length === 2 && gestureState.current.isPinching) {
      // Pinch-to-zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const distanceChange = currentDistance - gestureState.current.initialDistance;

      // Calculate zoom with dampening
      const zoomFactor = -distanceChange * 0.5;
      const newZoom = gestureState.current.initialZoom + zoomFactor;

      // Clamp zoom to range [60, 260]
      const clampedZoom = Math.max(60, Math.min(260, newZoom));
      camera.position.z = clampedZoom;

    } else if (e.touches.length === 1 && gestureState.current.isRotating) {
      // Single-finger pan/rotate
      const touch = e.touches[0];
      const deltaX = (touch.clientX - gestureState.current.lastTouchX) / size.width;
      const deltaY = (touch.clientY - gestureState.current.lastTouchY) / size.height;

      // Rotate camera around target
      // This creates a gentle camera rotation effect
      const rotationSpeed = 0.5;
      camera.rotation.y += deltaX * rotationSpeed;
      camera.rotation.x += deltaY * rotationSpeed;

      // Clamp X rotation to prevent flipping
      camera.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, camera.rotation.x));

      gestureState.current.lastTouchX = touch.clientX;
      gestureState.current.lastTouchY = touch.clientY;
    }
  }, [camera, getTouchDistance, size]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      gestureState.current.isPinching = false;
    }

    if (e.touches.length === 0) {
      gestureState.current.isRotating = false;
      console.log('[TouchGestures] Gesture ended');
    }
  }, []);

  // Set up touch event listeners
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Add touch event listeners with passive: false to allow preventDefault
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPinching: gestureState.current.isPinching,
    isRotating: gestureState.current.isRotating,
  };
}
