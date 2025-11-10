/**
 * Audio System
 * Handles all sound effects for the application
 * Spec: slap_click, slap_swell, supernova_burst, reveal_chime
 */

import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';

// Simple audio context for Web Audio API
export function AudioSystem() {
  const audioEnabled = useSceneStore((s) => s.audioEnabled);
  const audioVolume = useSceneStore((s) => s.audioVolume);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const lastPlayTime = useRef<Record<string, number>>({});

  // Initialize audio context
  useEffect(() => {
    if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) {
      console.warn('[AudioSystem] Web Audio API not supported');
      return;
    }

    // Create audio context (lazy init to avoid autoplay policy)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();

    // Create master gain node
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.connect(audioContextRef.current.destination);

    console.log('[AudioSystem] Initialized');

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = audioEnabled ? audioVolume : 0;
    }
  }, [audioEnabled, audioVolume]);

  // Play sound helper
  const playSound = (type: string, options: {
    volume?: number;
    frequency?: number;
    duration?: number;
    pitchUp?: boolean;
    spatialized?: boolean;
  } = {}) => {
    if (!audioContextRef.current || !masterGainRef.current || !audioEnabled) {
      return;
    }

    const now = Date.now();
    const debounceTime = 80; // 80ms debounce per spec

    // Debounce
    if (lastPlayTime.current[type] && now - lastPlayTime.current[type] < debounceTime) {
      return;
    }
    lastPlayTime.current[type] = now;

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime;

    // Create oscillator for procedural sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Sound characteristics based on type
    let frequency = options.frequency || 440;
    let duration = options.duration || 0.3;
    let volume = (options.volume !== undefined ? options.volume : 1.0) * audioVolume;

    switch (type) {
      case 'slap_click':
        // Sharp click sound
        oscillator.type = 'square';
        frequency = 800;
        duration = 0.08;
        // Quick attack/release envelope
        gainNode.gain.setValueAtTime(volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        break;

      case 'slap_swell':
        // Swelling sound with pitch up
        oscillator.type = 'sine';
        frequency = 300;
        duration = 0.18;
        // Pitch ramp up
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * (options.pitchUp ? 1.5 : 1), currentTime + duration);
        // Volume swell
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.6, currentTime + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
        break;

      case 'supernova_burst':
        // Explosive burst sound
        oscillator.type = 'sawtooth';
        frequency = 150;
        duration = 0.56;
        // Descending pitch
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + duration);
        // Volume envelope with punch
        gainNode.gain.setValueAtTime(volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, currentTime + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        break;

      case 'reveal_chime':
        // Pleasant chime sound
        oscillator.type = 'sine';
        frequency = 880;
        duration = 0.6;
        // Bell-like envelope
        gainNode.gain.setValueAtTime(volume * 0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        break;

      case 'transit':
        // Whoosh/tunnel sound
        oscillator.type = 'triangle';
        frequency = 200;
        duration = 1.1;
        // Pitch sweep
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, currentTime + duration);
        // Volume envelope
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.5, currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(volume * 0.5, currentTime + duration - 0.2);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
        break;

      case 'close':
        // Soft close sound
        oscillator.type = 'sine';
        frequency = 440;
        duration = 0.4;
        // Descending pitch
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, currentTime + duration);
        // Fade out
        gainNode.gain.setValueAtTime(volume * 0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        break;

      default:
        // Generic beep
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume * 0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        break;
    }

    // Set base frequency
    oscillator.frequency.value = frequency;

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Play
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);

    // Cleanup
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  };

  // Listen for play-sound events
  useEffect(() => {
    const handlePlaySound = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, volume, pitchUp, spatialized } = customEvent.detail;

      console.log('[AudioSystem] Playing sound:', type, customEvent.detail);
      playSound(type, { volume, pitchUp, spatialized });
    };

    window.addEventListener('kairo:play-sound', handlePlaySound);
    return () => window.removeEventListener('kairo:play-sound', handlePlaySound);
  }, [audioEnabled, audioVolume]);

  // Listen for transit sound
  useEffect(() => {
    const handleTransitStart = () => {
      console.log('[AudioSystem] Playing transit sound');
      playSound('transit', { volume: 0.6 });
    };

    window.addEventListener('kairo:spawn-tunnel', handleTransitStart);
    return () => window.removeEventListener('kairo:spawn-tunnel', handleTransitStart);
  }, [audioEnabled, audioVolume]);

  // This component doesn't render anything
  return null;
}
