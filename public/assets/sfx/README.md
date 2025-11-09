# Sound Effects for Kairoverse

## Required Audio Files

Place the following audio files in this directory:

### Background/Ambient
- `ambient_loop.ogg` (or .mp3) - Cosmic ambient background loop
  - Duration: 60-120 seconds
  - Loopable
  - Low frequency hum with reverb
  - Volume: Subtle, background level

### Interaction Sounds
- `hover_ping.ogg` - Entity hover sound
  - Duration: 0.2-0.5 seconds
  - Glass ping with reverb tail
  - Pitch: Mid-high frequency
  - Volume: Medium

- `click_whoosh.ogg` - Entity click sound
  - Duration: 0.3-0.6 seconds
  - Warp whoosh with descending pitch
  - Volume: Medium-high

### Transition Sounds
- `boom_warp.ogg` - Explosion/transition sound
  - Duration: 1-2 seconds
  - Expanding resonant tone
  - Bass-heavy with high-frequency sparkle
  - Volume: High

- `transition_whoosh.ogg` - Camera fly-in sound
  - Duration: 1.5-2 seconds
  - Smooth whoosh with doppler effect
  - Volume: Medium

### UI Sounds
- `panel_open.ogg` - Panel opening sound
  - Duration: 0.3-0.5 seconds
  - Soft chime or slide sound
  - Volume: Low-medium

- `panel_close.ogg` - Panel closing sound
  - Duration: 0.2-0.4 seconds
  - Reverse slide or soft thud
  - Volume: Low

## Audio Specifications

### Format
- **Primary:** OGG Vorbis (best browser compatibility)
- **Fallback:** MP3
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Bit Rate:** 128-192 kbps (balance quality/size)

### Processing
- Normalize audio levels
- Add subtle reverb for spatial feel
- Compress dynamics for consistent volume
- Trim silence at beginning/end
- Ensure smooth loops for ambient tracks

## Free Audio Resources

You can find suitable sounds from:
- **Freesound.org** - Free sound effects library
- **Zapsplat.com** - Free sound effects (credit required)
- **BBC Sound Effects** - Free archive
- **Adobe Audition** - Generate tones and effects
- **SFXR** - Generate retro game sounds
- **Web Audio API** - Generate sounds programmatically

## Placeholder Files

For development, you can use:
- Silent audio files (generated)
- Web Audio API generated tones
- Simple sine waves for testing

## File Naming Convention

- Use lowercase
- Separate words with underscores
- Include descriptive suffix
- Example: `entity_hover_glass.ogg`

## Current Status

⚠️ **Audio files not yet added** - Placeholders will be used until actual audio is provided.

The AudioManager component will handle:
- Automatic fallback if files are missing
- Silent mode for development
- Loading state management
- Error handling for missing audio
