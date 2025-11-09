import { useEffect, useState, useCallback } from 'react';
import { useSceneStore } from '../lib/sceneAPI';

export interface KeyboardNavigationState {
  focusedIndex: number;
  isFocusMode: boolean;
}

export function useKeyboardNavigation() {
  const { entities, sceneState, flyToEntity, closePanel } = useSceneStore();
  const [focusedIndex, setFocusedIndex] = useState(-1); // -1 means no focus
  const [isFocusMode, setIsFocusMode] = useState(false);

  const focusNext = useCallback(() => {
    if (entities.length === 0) return;

    setFocusedIndex((prev) => {
      const next = (prev + 1) % entities.length;
      // Announce to screen readers
      announceToScreenReader(`Focused on ${entities[next].title}`);
      return next;
    });
    setIsFocusMode(true);
  }, [entities]);

  const focusPrevious = useCallback(() => {
    if (entities.length === 0) return;

    setFocusedIndex((prev) => {
      const next = prev <= 0 ? entities.length - 1 : prev - 1;
      // Announce to screen readers
      announceToScreenReader(`Focused on ${entities[next].title}`);
      return next;
    });
    setIsFocusMode(true);
  }, [entities]);

  const activateFocused = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < entities.length) {
      const entity = entities[focusedIndex];
      flyToEntity(entity.id);
      announceToScreenReader(`Activated ${entity.title}. Press Escape to return.`);
    }
  }, [focusedIndex, entities, flyToEntity]);

  const clearFocus = useCallback(() => {
    setFocusedIndex(-1);
    setIsFocusMode(false);

    if (sceneState === 'panel') {
      closePanel();
      announceToScreenReader('Returned to overview');
    }
  }, [sceneState, closePanel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
          break;

        case 'Enter':
          if (isFocusMode && focusedIndex >= 0) {
            e.preventDefault();
            activateFocused();
          }
          break;

        case 'Escape':
          e.preventDefault();
          clearFocus();
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          if (isFocusMode) {
            e.preventDefault();
            focusNext();
          }
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          if (isFocusMode) {
            e.preventDefault();
            focusPrevious();
          }
          break;

        case 'Home':
          if (isFocusMode) {
            e.preventDefault();
            setFocusedIndex(0);
            announceToScreenReader(`Focused on ${entities[0]?.title}`);
          }
          break;

        case 'End':
          if (isFocusMode) {
            e.preventDefault();
            setFocusedIndex(entities.length - 1);
            announceToScreenReader(`Focused on ${entities[entities.length - 1]?.title}`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusNext, focusPrevious, activateFocused, clearFocus, isFocusMode, focusedIndex, entities]);

  // Clear focus when scene state changes (e.g., entity clicked with mouse)
  useEffect(() => {
    if (sceneState === 'idle' && isFocusMode) {
      setIsFocusMode(false);
    }
  }, [sceneState, isFocusMode]);

  return {
    focusedIndex,
    focusedEntityId: focusedIndex >= 0 ? entities[focusedIndex]?.id : null,
    isFocusMode,
  };
}

/**
 * Announce message to screen readers via aria-live region
 */
function announceToScreenReader(message: string) {
  const announcer = document.getElementById('a11y-announcer');
  if (announcer) {
    announcer.textContent = message;

    // Clear after a short delay so repeated messages work
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}
