import { useCallback, useRef, useEffect } from 'react';

export const useCarouselAPI = ({ goTo, next, prev, openPanel, closePanel, currentIndex, isPanelOpen }) => {
  const eventListeners = useRef({
    plateChange: [],
    panelOpen: [],
    panelClose: [],
    hover: []
  });

  const api = {
    goTo: useCallback((index) => {
      if (typeof index === 'number') {
        goTo(index);
        eventListeners.current.plateChange.forEach(cb => cb({ index }));
      }
    }, [goTo]),

    next: useCallback(() => {
      next();
    }, [next]),

    prev: useCallback(() => {
      prev();
    }, [prev]),

    openPanel: useCallback(async (index) => {
      openPanel(index !== undefined ? index : currentIndex);
      eventListeners.current.panelOpen.forEach(cb => cb({ index: index !== undefined ? index : currentIndex }));
    }, [openPanel, currentIndex]),

    closePanel: useCallback(async () => {
      closePanel();
      eventListeners.current.panelClose.forEach(cb => cb({ index: currentIndex }));
    }, [closePanel, currentIndex]),

    on: useCallback((event, callback) => {
      if (eventListeners.current[event]) {
        eventListeners.current[event].push(callback);
      }
      return () => {
        if (eventListeners.current[event]) {
          eventListeners.current[event] = eventListeners.current[event].filter(cb => cb !== callback);
        }
      };
    }, []),

    getState: useCallback(() => ({
      currentIndex,
      isPanelOpen
    }), [currentIndex, isPanelOpen])
  };

  return api;
};
