import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getQualityManager } from '../utils/perf';

/**
 * PerformanceStats Component
 * Displays FPS, quality level, and memory usage
 */
export default function PerformanceStats({ visible = true }) {
  const [stats, setStats] = useState({ current: 0, average: 0, min: 0, max: 0 });
  const [quality, setQuality] = useState('auto');
  const [memoryInfo, setMemoryInfo] = useState(null);

  const qualityManager = getQualityManager();

  useFrame((state, delta) => {
    if (!visible) return;

    const newStats = qualityManager.update(delta);
    setStats(newStats);
    setQuality(qualityManager.currentQuality);

    // Update memory info every 60 frames (~1 second)
    if (state.clock.elapsedTime % 1 < delta) {
      if (performance.memory) {
        const memory = performance.memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        });
      }
    }
  });

  if (!visible) return null;

  // Color based on FPS
  const getFPSColor = (fps) => {
    if (fps >= 50) return '#00ff88';
    if (fps >= 30) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffffff',
          minWidth: '180px',
        }}
      >
        {/* FPS Display */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ opacity: 0.7 }}>FPS:</span>
            <span style={{ color: getFPSColor(stats.current), fontWeight: 'bold' }}>
              {stats.current}
            </span>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6 }}>
            Avg: {stats.average} | Min: {stats.min} | Max: {stats.max}
          </div>
        </div>

        {/* Quality Level */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>Quality:</span>
            <span style={{ color: '#00E5FF', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {quality}
            </span>
          </div>
        </div>

        {/* Memory (if available) */}
        {memoryInfo && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Memory:</span>
              <span style={{ color: '#00E5FF' }}>
                {memoryInfo.used} / {memoryInfo.limit} MB
              </span>
            </div>
            <div
              style={{
                marginTop: '4px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(memoryInfo.used / memoryInfo.limit) * 100}%`,
                  background: 'linear-gradient(90deg, #00E5FF, #FF00E5)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Warning for low FPS */}
        {stats.average < 30 && (
          <div
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: 'rgba(255, 68, 68, 0.2)',
              border: '1px solid rgba(255, 68, 68, 0.5)',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#ff4444',
            }}
          >
            ⚠️ Performance issues detected
          </div>
        )}
      </div>
    </Html>
  );
}

/**
 * Simple FPS Counter (minimal version)
 */
export function SimpleFPSCounter() {
  const [fps, setFps] = useState(0);

  useFrame((state, delta) => {
    const currentFPS = Math.round(1 / delta);
    setFps(currentFPS);
  });

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: fps >= 50 ? '#00ff88' : fps >= 30 ? '#ffaa00' : '#ff4444',
          fontWeight: 'bold',
        }}
      >
        {fps} FPS
      </div>
    </Html>
  );
}
