import React, { useRef, useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import BrainCore from './BrainCore';
import PerformanceStats from './PerformanceStats';
import PerformanceDebugPanel from './PerformanceDebugPanel';
import MicroSceneManager from './MicroSceneManager';
import ScrollController from './ScrollController';
import PostProcessing from './PostProcessing';

/**
 * BrainScene Component
 * Main 3D scene with brain, lighting, and controls
 *
 * @param {Object} props
 * @param {string} props.activeModule - Currently active module ID
 * @param {function} props.onModuleClick - Module click handler
 */
export default function BrainScene({ activeModule, onModuleClick }) {
  const controlsRef = useRef();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Handle scroll progress updates
  const handleScrollProgress = (scrollData) => {
    setScrollProgress(scrollData.scrollProgress);
  };

  // Keyboard toggle for debug panel (D key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebugPanel(prev => !prev);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <>
      {/* Scroll Controller - disabled when module is active */}
      <ScrollController
        enabled={!activeModule}
        onProgressChange={handleScrollProgress}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00E5FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#FF00E5" />
      <pointLight position={[0, -10, 0]} intensity={0.3} color="#FFE500" />

      {/* Subtle directional light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Brain Core Component with LOD and Module Interaction */}
      <BrainCore
        position={[0, 0, 0]}
        activeModule={activeModule}
        onModuleClick={onModuleClick}
        scrollProgress={scrollProgress}
      />

      {/* Micro-Scenes for each module */}
      <MicroSceneManager
        activeModule={activeModule}
        controls={controlsRef.current}
      />

      {/* Performance Stats Overlay */}
      <PerformanceStats visible={true} />

      {/* Advanced Debug Panel (Toggle with 'D' key) */}
      <PerformanceDebugPanel visible={showDebugPanel} compact={false} />

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
      />

      {/* Postprocessing Effects */}
      <PostProcessing
        enabled={true}
        scrollProgress={scrollProgress}
        quality="auto"
      />
    </>
  );
}
