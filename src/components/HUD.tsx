import { useState } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import './HUD.css';

export function HUD() {
  const { audioEnabled, toggleAudio, sceneState, resetView } = useSceneStore();
  const [isVisible, setIsVisible] = useState(false);

  const handleReset = () => {
    resetView();
  };

  if (sceneState === 'loading' || sceneState === 'singularity' || sceneState === 'boom') {
    return null;
  }

  return (
    <>
      {/* Bottom edge trigger */}
      <div
        className="hud-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />

      {/* HUD bar */}
      <div className={`hud ${isVisible ? 'hud-visible' : ''}`}>
        <div className="hud-content">
          {/* Audio control */}
          <button
            className="hud-button"
            onClick={toggleAudio}
            aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* Quick nav */}
          <div className="hud-nav">
            <span className="hud-label">Explore</span>
          </div>

          {/* Reset view */}
          {sceneState === 'panel' && (
            <button className="hud-button" onClick={handleReset} aria-label="Reset view" title="Reset">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9" />
                <path d="M3 4v4h4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
