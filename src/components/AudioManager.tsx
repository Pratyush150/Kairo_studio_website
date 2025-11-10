import { useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { useSceneStore } from '../lib/sceneAPI';

interface Sound {
  howl: Howl | null;
  loaded: boolean;
}

interface SoundLibrary {
  ambient: Sound;
  hover: Sound;
  click: Sound;
  boom: Sound;
  transition: Sound;
  panelOpen: Sound;
  panelClose: Sound;
}

export function AudioManager() {
  const { audioEnabled, audioVolume, sceneState } = useSceneStore();
  const soundsRef = useRef<SoundLibrary>({
    ambient: { howl: null, loaded: false },
    hover: { howl: null, loaded: false },
    click: { howl: null, loaded: false },
    boom: { howl: null, loaded: false },
    transition: { howl: null, loaded: false },
    panelOpen: { howl: null, loaded: false },
    panelClose: { howl: null, loaded: false },
  });

  const initialized = useRef(false);
  const ambientFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio system
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log('[AudioManager] Initializing audio system (graceful degradation enabled)...');

    // Set global volume from localStorage
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume) {
      Howler.volume(parseFloat(savedVolume));
    } else {
      Howler.volume(0.5); // Default 50%
    }

    // Note: Audio files are optional. Missing files will fail silently with fallback sounds.

    // Load ambient loop
    try {
      soundsRef.current.ambient.howl = new Howl({
        src: ['/assets/sfx/ambient_loop.ogg', '/assets/sfx/ambient_loop.mp3'],
        loop: true,
        volume: 0.3,
        html5: true, // Use HTML5 audio for streaming
        onload: () => {
          soundsRef.current.ambient.loaded = true;
          console.log('[AudioManager] Ambient loaded');
        },
        onloaderror: () => {
          // Silent fallback - audio files are optional for development
          soundsRef.current.ambient.loaded = false;
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create ambient sound:', error);
    }

    // Load hover sound
    try {
      soundsRef.current.hover.howl = new Howl({
        src: ['/assets/sfx/hover_ping.ogg', '/assets/sfx/hover_ping.mp3'],
        volume: 0.4,
        onload: () => {
          soundsRef.current.hover.loaded = true;
          console.log('[AudioManager] Hover loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create hover sound:', error);
    }

    // Load click sound
    try {
      soundsRef.current.click.howl = new Howl({
        src: ['/assets/sfx/click_whoosh.ogg', '/assets/sfx/click_whoosh.mp3'],
        volume: 0.5,
        onload: () => {
          soundsRef.current.click.loaded = true;
          console.log('[AudioManager] Click loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create click sound:', error);
    }

    // Load boom sound
    try {
      soundsRef.current.boom.howl = new Howl({
        src: ['/assets/sfx/boom_warp.ogg', '/assets/sfx/boom_warp.mp3'],
        volume: 0.6,
        onload: () => {
          soundsRef.current.boom.loaded = true;
          console.log('[AudioManager] Boom loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create boom sound:', error);
    }

    // Load transition sound
    try {
      soundsRef.current.transition.howl = new Howl({
        src: ['/assets/sfx/transition_whoosh.ogg', '/assets/sfx/transition_whoosh.mp3'],
        volume: 0.5,
        onload: () => {
          soundsRef.current.transition.loaded = true;
          console.log('[AudioManager] Transition loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create transition sound:', error);
    }

    // Load panel sounds
    try {
      soundsRef.current.panelOpen.howl = new Howl({
        src: ['/assets/sfx/panel_open.ogg', '/assets/sfx/panel_open.mp3'],
        volume: 0.3,
        onload: () => {
          soundsRef.current.panelOpen.loaded = true;
          console.log('[AudioManager] Panel open loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });

      soundsRef.current.panelClose.howl = new Howl({
        src: ['/assets/sfx/panel_close.ogg', '/assets/sfx/panel_close.mp3'],
        volume: 0.3,
        onload: () => {
          soundsRef.current.panelClose.loaded = true;
          console.log('[AudioManager] Panel close loaded');
        },
        onloaderror: () => {
          // Silent fallback
        },
      });
    } catch (error) {
      console.warn('[AudioManager] Failed to create panel sounds:', error);
    }

    // Cleanup on unmount
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound.howl) {
          sound.howl.unload();
        }
      });
    };
  }, []);

  // Play ambient when entering idle state
  useEffect(() => {
    const ambient = soundsRef.current.ambient.howl;

    // Clear any pending fade timeout
    if (ambientFadeTimeoutRef.current) {
      clearTimeout(ambientFadeTimeoutRef.current);
      ambientFadeTimeoutRef.current = null;
    }

    if (sceneState === 'idle' && audioEnabled) {
      if (ambient && soundsRef.current.ambient.loaded) {
        // Only start if not already playing
        if (!ambient.playing()) {
          // Use setTimeout to avoid race conditions with stop()
          setTimeout(() => {
            if (ambient && !ambient.playing()) {
              ambient.volume(0);
              ambient.play();
              ambient.fade(0, 0.3, 2000);
            }
          }, 50);
        }
      }
    } else {
      if (ambient && ambient.playing()) {
        // Fade out ambient
        ambient.fade(ambient.volume(), 0, 1000);

        // Schedule stop after fade completes
        ambientFadeTimeoutRef.current = setTimeout(() => {
          if (ambient && ambient.playing()) {
            ambient.stop();
          }
          ambientFadeTimeoutRef.current = null;
        }, 1000);
      }
    }

    // Cleanup function
    return () => {
      if (ambientFadeTimeoutRef.current) {
        clearTimeout(ambientFadeTimeoutRef.current);
        ambientFadeTimeoutRef.current = null;
      }
    };
  }, [sceneState, audioEnabled]);

  // Handle boom sound on boom state
  useEffect(() => {
    if (sceneState === 'boom' && audioEnabled) {
      const boom = soundsRef.current.boom.howl;
      if (boom && soundsRef.current.boom.loaded) {
        boom.play();
      }
    }
  }, [sceneState, audioEnabled]);

  // Handle panel sounds
  useEffect(() => {
    if (sceneState === 'panel' && audioEnabled) {
      const panelOpen = soundsRef.current.panelOpen.howl;
      if (panelOpen && soundsRef.current.panelOpen.loaded) {
        panelOpen.play();
      }
    }
  }, [sceneState, audioEnabled]);

  // Play sound function
  const playSound = useCallback(
    (type: keyof SoundLibrary, options?: { volume?: number; pan?: number }) => {
      if (!audioEnabled) return;

      const sound = soundsRef.current[type];
      if (!sound.howl || !sound.loaded) {
        // Silently fail - audio files are optional for development
        // console.warn(`[AudioManager] Sound "${type}" not loaded`);
        return;
      }

      const id = sound.howl.play();

      if (options?.volume !== undefined) {
        sound.howl.volume(options.volume, id);
      }

      if (options?.pan !== undefined) {
        sound.howl.stereo(options.pan, id);
      }
    },
    [audioEnabled]
  );

  // Listen for custom events
  useEffect(() => {
    const handlePlaySound = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, position } = customEvent.detail;

      if (type === 'hover') {
        // Calculate stereo panning based on position
        let pan = 0;
        if (position) {
          pan = Math.max(-1, Math.min(1, position.x / 200)); // Normalize x position to -1 to 1
        }
        playSound('hover', { pan });
      } else if (type === 'click') {
        playSound('click');
      } else if (type === 'transition') {
        playSound('transition');
      }
    };

    window.addEventListener('kairo:play-sound', handlePlaySound);

    return () => {
      window.removeEventListener('kairo:play-sound', handlePlaySound);
    };
  }, [playSound]);

  // Listen for ball interaction sounds
  useEffect(() => {
    const handleBallSound = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, volume } = customEvent.detail;

      // Map ball sound types to existing sounds (graceful degradation)
      switch (type) {
        case 'slap':
          playSound('click', { volume: volume || 0.7 });
          break;
        case 'compression':
          // Use ambient for compression swell (lower volume)
          break;
        case 'burst':
          playSound('boom', { volume: volume || 0.8 });
          break;
        case 'transit':
          playSound('transition', { volume: volume || 0.6 });
          break;
        case 'close':
          playSound('panelClose');
          break;
        default:
          console.log('[AudioManager] Unknown ball sound type:', type);
      }
    };

    window.addEventListener('kairo:play-ball-sound', handleBallSound);

    return () => {
      window.removeEventListener('kairo:play-ball-sound', handleBallSound);
    };
  }, [playSound]);

  // Handle global mute
  useEffect(() => {
    Howler.mute(!audioEnabled);
  }, [audioEnabled]);

  // Handle global volume changes
  useEffect(() => {
    Howler.volume(audioVolume);
    console.log(`[AudioManager] Volume set to ${Math.round(audioVolume * 100)}%`);
  }, [audioVolume]);

  // This component doesn't render anything
  return null;
}
