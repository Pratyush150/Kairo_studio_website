/**
 * HUD - Heads-Up Display
 * Top navigation and audio controls for Morphing Canvas
 */

import { useSceneStore, sceneAPI } from '../lib/sceneAPI';
import { morphs } from '../lib/tokens';
import './HUD.css';

export function HUD() {
  const { audioEnabled, toggleAudio, sceneState } = useSceneStore();

  // Don't show HUD during loading
  if (sceneState === 'loading') {
    return null;
  }

  const handleNavClick = (slug: string) => {
    sceneAPI.openPanel(slug);
  };

  return (
    <div className="hud">
      {/* Top left brand */}
      <div className="hud-brand">
        <span className="brand-text">Kairo Studio</span>
      </div>

      {/* Top right navigation */}
      <nav className="hud-nav" role="navigation" aria-label="Main navigation">
        {Object.entries(morphs).map(([key, morph]) => (
          <button
            key={key}
            className="nav-button"
            onClick={() => handleNavClick(morph.slug)}
            aria-label={`Navigate to ${morph.name}`}
          >
            {morph.name}
          </button>
        ))}

        {/* Audio toggle */}
        <button
          className="nav-button audio-button"
          onClick={toggleAudio}
          aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </nav>
    </div>
  );
}
