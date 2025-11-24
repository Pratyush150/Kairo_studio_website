import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BrainScene from './BrainScene';
import LowResPlaceholder from './LowResPlaceholder';
import FallbackHero from './FallbackHero';
import ModuleHUD, { ModuleHintOverlay } from './ModuleHUD';
import Skip3DToggle from './Skip3DToggle';
import ErrorBoundary from './ErrorBoundary';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useModuleState } from '../hooks/useModuleState';
import { useKeyboardNavigation, useReducedMotion } from '../hooks/useKeyboardNavigation';
import { useEngagementTracking, useModuleTracking, useScrollTracking } from '../hooks/useAnalytics';
import ScrollContainer from './ScrollContainer';
import ScrollProgressIndicator from './ScrollProgressIndicator';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { initWebVitals } from '../utils/webVitals';
import '../styles/accessibility.css';

export default function CanvasRoot() {
  const [useFallback, setUseFallback] = useState(false);
  const [skip3D, setSkip3D] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [fallbackReason, setFallbackReason] = useState('no-webgl');
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Module interaction state
  const { activeModule, handleModuleClick, closeModule, setSelectedModule } = useModuleState();

  // Scroll progress state (disabled when module is active)
  const scroll = useScrollProgress({ sections: 4, enabled: !activeModule });

  // Reduced motion detection
  const prefersReducedMotion = useReducedMotion();

  // Module IDs for keyboard navigation
  const modules = ['saas', 'automation', 'integration'];

  // Keyboard navigation
  useKeyboardNavigation({
    modules,
    activeModule,
    onModuleSelect: (moduleId) => {
      setSelectedModule(moduleId);
      console.log('[KeyboardNav] Module focused:', moduleId);
    },
    onModuleActivate: handleModuleClick,
    onClose: closeModule,
    onScrollSection: (direction) => {
      const current = scroll.currentSection;
      const next = direction === 'next'
        ? Math.min(current + 1, scroll.sections - 1)
        : Math.max(current - 1, 0);
      scroll.scrollToSection(next);
    },
    enabled: !activeModule,
  });

  // Analytics tracking
  useEngagementTracking(!useFallback);
  useModuleTracking(activeModule, !!activeModule);
  useScrollTracking(scroll.currentSection, scroll.scrollProgress);

  // Initialize Web Vitals
  useEffect(() => {
    initWebVitals();
  }, []);

  // Analytics dashboard keyboard toggle (A key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        if (!e.target.matches('input, textarea')) {
          setShowAnalyticsDashboard(prev => !prev);
        }
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  useEffect(() => {
    // Check for user preference to skip 3D
    const savedPreference = localStorage.getItem('cerebral-skip-3d');
    if (savedPreference === 'true') {
      console.log('[CanvasRoot] User prefers simplified view');
      setUseFallback(true);
      setSkip3D(true);
      setFallbackReason('user-preference');
      return;
    }

    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('[CanvasRoot] WebGL not supported, using fallback');
      setUseFallback(true);
      setFallbackReason('no-webgl');
      return;
    }

    // Check for reduced motion preference
    if (prefersReducedMotion) {
      console.log('[CanvasRoot] Reduced motion detected, using fallback');
      setUseFallback(true);
      setFallbackReason('user-preference');
      return;
    }

    // Device capability detection (basic)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

    if (isMobile && hasLowMemory) {
      console.log('[CanvasRoot] Low-end device detected, using fallback');
      setUseFallback(true);
      setFallbackReason('performance');
      return;
    }

    console.log('[CanvasRoot] WebGL supported, rendering 3D scene');
  }, [prefersReducedMotion]);

  // Hide hint after first module interaction
  useEffect(() => {
    if (activeModule && showHint) {
      setShowHint(false);
    }
  }, [activeModule, showHint]);

  // Handle enabling full experience from fallback
  const handleEnableExperience = () => {
    localStorage.removeItem('cerebral-skip-3d');
    window.location.reload();
  };

  // Show fallback hero if needed
  if (useFallback) {
    return (
      <FallbackHero
        reason={fallbackReason}
        onEnableExperience={handleEnableExperience}
      />
    );
  }

  return (
    <ErrorBoundary name="CanvasRoot">
      <ScrollContainer sections={4}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            console.log('[CanvasRoot] Canvas created successfully');
            console.log('[CanvasRoot] Renderer:', gl.capabilities);
          }}
          aria-label="3D brain visualization scene"
          role="img"
        >
          <Suspense fallback={<LowResPlaceholder />}>
            <ErrorBoundary name="BrainScene">
              <BrainScene
                activeModule={activeModule}
                onModuleClick={handleModuleClick}
              />
            </ErrorBoundary>
          </Suspense>
        </Canvas>

        {/* Scroll Progress Indicator */}
        <ScrollProgressIndicator
          progress={scroll.scrollProgress}
          currentSection={scroll.currentSection}
          totalSections={scroll.sections}
          onSectionClick={scroll.scrollToSection}
          visible={!activeModule}
        />

        {/* Module HUD Overlay */}
        <ModuleHUD moduleId={activeModule} onClose={closeModule} />

        {/* Hint Overlay - show until first interaction */}
        <ModuleHintOverlay visible={showHint && !activeModule} />
      </ScrollContainer>

      {/* Skip 3D Toggle */}
      <Skip3DToggle
        skip3D={skip3D}
        onToggle={setSkip3D}
        visible={!activeModule}
      />

      {/* Analytics Dashboard (Toggle with 'A' key) */}
      <AnalyticsDashboard visible={showAnalyticsDashboard} />
    </ErrorBoundary>
  );
}
