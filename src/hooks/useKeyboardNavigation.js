import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard Navigation Hook
 * Provides comprehensive keyboard navigation for the 3D scene
 *
 * Keyboard Controls:
 * - Tab/Shift+Tab: Navigate between modules
 * - Enter/Space: Activate selected module
 * - Escape: Close active module
 * - Arrow Keys: Navigate scroll sections
 * - H: Show help overlay
 * - D: Toggle debug panel
 * - R: Reset camera
 * - 1-3: Direct module selection
 *
 * @param {Object} options - Navigation options
 * @param {Array} options.modules - Array of module IDs
 * @param {string} options.activeModule - Currently active module
 * @param {function} options.onModuleSelect - Callback when module is selected
 * @param {function} options.onModuleActivate - Callback when module is activated
 * @param {function} options.onClose - Callback to close module
 * @param {function} options.onScrollSection - Callback to scroll to section
 * @param {boolean} options.enabled - Whether navigation is enabled
 */
export function useKeyboardNavigation({
  modules = [],
  activeModule = null,
  onModuleSelect,
  onModuleActivate,
  onClose,
  onScrollSection,
  enabled = true,
}) {
  const currentIndexRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Don't handle keyboard events when typing in inputs
    if (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
      return;
    }

    const { key, shiftKey, ctrlKey, metaKey } = event;

    // Tab navigation between modules
    if (key === 'Tab' && !ctrlKey && !metaKey) {
      event.preventDefault();
      isNavigatingRef.current = true;

      if (shiftKey) {
        // Previous module
        currentIndexRef.current = (currentIndexRef.current - 1 + modules.length) % modules.length;
      } else {
        // Next module
        currentIndexRef.current = (currentIndexRef.current + 1) % modules.length;
      }

      const selectedModule = modules[currentIndexRef.current];
      if (onModuleSelect) {
        onModuleSelect(selectedModule);
      }

      console.log('[KeyboardNav] Selected module:', selectedModule);
    }

    // Enter or Space to activate module
    else if ((key === 'Enter' || key === ' ') && !activeModule) {
      event.preventDefault();
      const selectedModule = modules[currentIndexRef.current];
      if (onModuleActivate && selectedModule) {
        onModuleActivate(selectedModule);
        console.log('[KeyboardNav] Activated module:', selectedModule);
      }
    }

    // Escape to close active module
    else if (key === 'Escape' && activeModule) {
      event.preventDefault();
      if (onClose) {
        onClose();
        console.log('[KeyboardNav] Closed module');
      }
    }

    // Arrow keys for scroll navigation
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) && !activeModule) {
      event.preventDefault();

      if (onScrollSection) {
        if (key === 'ArrowDown' || key === 'ArrowRight') {
          onScrollSection('next');
        } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
          onScrollSection('prev');
        }
      }
    }

    // Number keys for direct module selection (1-3)
    else if (['1', '2', '3'].includes(key) && !activeModule) {
      event.preventDefault();
      const index = parseInt(key) - 1;
      if (index < modules.length) {
        currentIndexRef.current = index;
        const selectedModule = modules[index];
        if (onModuleActivate && selectedModule) {
          onModuleActivate(selectedModule);
          console.log('[KeyboardNav] Direct activation:', selectedModule);
        }
      }
    }

    // Reset navigation state on any other key
    else if (!['d', 'D', 'h', 'H', 'r', 'R'].includes(key)) {
      isNavigatingRef.current = false;
    }
  }, [enabled, modules, activeModule, onModuleSelect, onModuleActivate, onClose, onScrollSection]);

  // Set up keyboard listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Announce navigation state to screen readers
  const announceNavigation = useCallback((message) => {
    // Create live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    currentIndex: currentIndexRef.current,
    isNavigating: isNavigatingRef.current,
    announceNavigation,
  };
}

/**
 * Focus Management Hook
 * Manages focus states for keyboard navigation
 *
 * @param {string} activeModule - Currently active module
 */
export function useFocusManagement(activeModule) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (activeModule) {
      // Store current focus
      previousFocusRef.current = document.activeElement;

      // Focus the active module container
      const moduleElement = document.querySelector(`[data-module="${activeModule}"]`);
      if (moduleElement) {
        moduleElement.focus();
      }
    } else if (previousFocusRef.current) {
      // Restore previous focus when module closes
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [activeModule]);

  return { previousFocus: previousFocusRef.current };
}

/**
 * Reduced Motion Hook
 * Detects and responds to prefers-reduced-motion
 *
 * @returns {boolean} Whether reduced motion is preferred
 */
export function useReducedMotion() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      console.log('[Accessibility] Reduced motion detected - animations will be minimized');
      document.documentElement.classList.add('reduce-motion');
    }
  }, [prefersReducedMotion]);

  return prefersReducedMotion;
}

export default {
  useKeyboardNavigation,
  useFocusManagement,
  useReducedMotion,
};
