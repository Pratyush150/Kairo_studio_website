import { useState } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import './HUD.css';

export function HUD() {
  const { audioEnabled, audioVolume, toggleAudio, setAudioVolume, sceneState, resetView } = useSceneStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleReset = () => {
    resetView();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setAudioVolume(volume);
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
          {/* Audio controls */}
          <div className="hud-audio-group">
            <button
              className="hud-button"
              onClick={toggleAudio}
              onMouseEnter={() => setShowVolumeSlider(true)}
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

            {/* Volume slider */}
            {showVolumeSlider && (
              <div
                className="hud-volume-slider"
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioVolume}
                  onChange={handleVolumeChange}
                  className="volume-range"
                  aria-label="Volume"
                />
                <span className="volume-percentage">{Math.round(audioVolume * 100)}%</span>
              </div>
            )}
          </div>

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
