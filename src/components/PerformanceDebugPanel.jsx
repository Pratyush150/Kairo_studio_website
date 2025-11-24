import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { getQualityManager } from '../utils/perf';
import { detectDeviceCapabilities, getPerformanceTier } from '../utils/deviceCapabilities';
import './PerformanceDebugPanel.css';

/**
 * PerformanceDebugPanel Component
 * Advanced performance monitoring and debugging panel
 *
 * @param {Object} props
 * @param {boolean} props.visible - Panel visibility
 * @param {boolean} props.compact - Compact mode
 */
export default function PerformanceDebugPanel({ visible = false, compact = false }) {
  const [stats, setStats] = useState({ current: 0, average: 0, min: 0, max: 0 });
  const [memory, setMemory] = useState(null);
  const [drawCalls, setDrawCalls] = useState({ calls: 0, triangles: 0, points: 0 });
  const [capabilities, setCapabilities] = useState(null);
  const [expanded, setExpanded] = useState(!compact);

  const qualityManager = getQualityManager();

  // Detect capabilities on mount
  useEffect(() => {
    const caps = detectDeviceCapabilities();
    const tier = getPerformanceTier(caps);
    setCapabilities({ ...caps, tier });
  }, []);

  // Update stats
  useFrame((state, delta) => {
    if (!visible) return;

    // FPS
    const newStats = qualityManager.update(delta);
    setStats(newStats);

    // Memory (if available)
    if (performance.memory && state.clock.elapsedTime % 1 < delta) {
      setMemory({
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      });
    }

    // Render info
    if (state.gl.info) {
      setDrawCalls({
        calls: state.gl.info.render.calls,
        triangles: state.gl.info.render.triangles,
        points: state.gl.info.render.points,
      });
    }
  });

  if (!visible) return null;

  const getFPSColor = (fps) => {
    if (fps >= 50) return '#00ff88';
    if (fps >= 30) return '#ffaa00';
    return '#ff4444';
  };

  const getMemoryColor = (used, limit) => {
    const percent = (used / limit) * 100;
    if (percent >= 80) return '#ff4444';
    if (percent >= 60) return '#ffaa00';
    return '#00ff88';
  };

  if (compact && !expanded) {
    return (
      <div className="perf-debug-compact" onClick={() => setExpanded(true)}>
        <div className="perf-fps" style={{ color: getFPSColor(stats.current) }}>
          {stats.current} FPS
        </div>
        {memory && (
          <div className="perf-memory">
            {memory.used}MB
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`perf-debug-panel ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="perf-header">
        <div className="perf-title">Performance Monitor</div>
        <div className="perf-controls">
          {compact && (
            <button onClick={() => setExpanded(false)} className="perf-btn">−</button>
          )}
        </div>
      </div>

      {/* FPS Section */}
      <div className="perf-section">
        <div className="perf-section-title">Frame Rate</div>
        <div className="perf-metric">
          <span className="perf-label">Current:</span>
          <span className="perf-value" style={{ color: getFPSColor(stats.current) }}>
            {stats.current} FPS
          </span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">Average:</span>
          <span className="perf-value">{stats.average} FPS</span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">Min / Max:</span>
          <span className="perf-value">{stats.min} / {stats.max} FPS</span>
        </div>
      </div>

      {/* Memory Section */}
      {memory && (
        <div className="perf-section">
          <div className="perf-section-title">Memory</div>
          <div className="perf-metric">
            <span className="perf-label">Used:</span>
            <span className="perf-value" style={{ color: getMemoryColor(memory.used, memory.limit) }}>
              {memory.used} MB
            </span>
          </div>
          <div className="perf-metric">
            <span className="perf-label">Limit:</span>
            <span className="perf-value">{memory.limit} MB</span>
          </div>
          <div className="perf-bar">
            <div
              className="perf-bar-fill"
              style={{
                width: `${(memory.used / memory.limit) * 100}%`,
                background: getMemoryColor(memory.used, memory.limit),
              }}
            />
          </div>
        </div>
      )}

      {/* Render Section */}
      <div className="perf-section">
        <div className="perf-section-title">Render Info</div>
        <div className="perf-metric">
          <span className="perf-label">Draw Calls:</span>
          <span className="perf-value">{drawCalls.calls}</span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">Triangles:</span>
          <span className="perf-value">{drawCalls.triangles.toLocaleString()}</span>
        </div>
        <div className="perf-metric">
          <span className="perf-label">Points:</span>
          <span className="perf-value">{drawCalls.points.toLocaleString()}</span>
        </div>
      </div>

      {/* Device Section */}
      {capabilities && (
        <div className="perf-section">
          <div className="perf-section-title">Device</div>
          <div className="perf-metric">
            <span className="perf-label">Tier:</span>
            <span className="perf-value perf-tier">{capabilities.tier.toUpperCase()}</span>
          </div>
          <div className="perf-metric">
            <span className="perf-label">Memory:</span>
            <span className="perf-value">{capabilities.deviceMemory} GB</span>
          </div>
          <div className="perf-metric">
            <span className="perf-label">Cores:</span>
            <span className="perf-value">{capabilities.hardwareConcurrency}</span>
          </div>
          <div className="perf-metric">
            <span className="perf-label">Quality:</span>
            <span className="perf-value">{qualityManager.currentQuality.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
