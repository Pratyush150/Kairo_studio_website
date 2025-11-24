import { useState, useCallback } from 'react';

/**
 * useModuleState Hook
 * Manages active module selection and interaction state
 *
 * @returns {Object} Module state and handlers
 */
export function useModuleState() {
  const [activeModule, setActiveModule] = useState(null);
  const [hoveredModule, setHoveredModule] = useState(null);

  const handleModuleClick = useCallback((moduleId) => {
    console.log('[ModuleState] Module clicked:', moduleId);
    setActiveModule((current) => (current === moduleId ? null : moduleId));
  }, []);

  const handleModuleHover = useCallback((moduleId) => {
    setHoveredModule(moduleId);
  }, []);

  const handleModuleUnhover = useCallback(() => {
    setHoveredModule(null);
  }, []);

  const closeModule = useCallback(() => {
    setActiveModule(null);
  }, []);

  return {
    activeModule,
    hoveredModule,
    handleModuleClick,
    handleModuleHover,
    handleModuleUnhover,
    closeModule,
    isModuleActive: (moduleId) => activeModule === moduleId,
    isModuleHovered: (moduleId) => hoveredModule === moduleId,
  };
}

export default useModuleState;
