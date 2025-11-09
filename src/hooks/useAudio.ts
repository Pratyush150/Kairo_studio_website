import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

interface AudioControls {
  play: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  isPlaying: boolean;
  isMuted: boolean;
}

export function useAudio(src: string, options?: {
  loop?: boolean;
  volume?: number;
  autoplay?: boolean;
  spatial?: boolean;
}): AudioControls {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedMute = localStorage.getItem('audioMuted');
    if (savedMute === 'true') {
      setIsMuted(true);
      Howler.mute(true);
    }

    soundRef.current = new Howl({
      src: [src],
      loop: options?.loop ?? false,
      volume: options?.volume ?? 0.28,
      html5: options?.spatial ?? false,
      onplay: () => setIsPlaying(true),
      onstop: () => setIsPlaying(false),
      onpause: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
    });

    if (options?.autoplay && !isMuted) {
      soundRef.current.play();
    }

    return () => {
      soundRef.current?.unload();
    };
  }, [src, options?.loop, options?.volume, options?.autoplay, options?.spatial, isMuted]);

  const play = useCallback(() => {
    if (!isMuted) {
      soundRef.current?.play();
    }
  }, [isMuted]);

  const stop = useCallback(() => {
    soundRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    soundRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    if (!isMuted) {
      soundRef.current?.play();
    }
  }, [isMuted]);

  const setVolume = useCallback((volume: number) => {
    soundRef.current?.volume(volume);
  }, []);

  const mute = useCallback(() => {
    Howler.mute(true);
    setIsMuted(true);
    localStorage.setItem('audioMuted', 'true');
  }, []);

  const unmute = useCallback(() => {
    Howler.mute(false);
    setIsMuted(false);
    localStorage.setItem('audioMuted', 'false');
  }, []);

  return {
    play,
    stop,
    pause,
    resume,
    setVolume,
    mute,
    unmute,
    isPlaying,
    isMuted,
  };
}

export function useSpatialAudio(src: string, position: [number, number, number], options?: {
  volume?: number;
  maxDistance?: number;
}): AudioControls & { updatePosition: (pos: [number, number, number]) => void } {
  const controls = useAudio(src, { ...options, spatial: true });
  const soundRef = useRef<Howl | null>(null);

  const updatePosition = useCallback((pos: [number, number, number]) => {
    if (soundRef.current) {
      soundRef.current.pos(pos[0], pos[1], pos[2]);
    }
  }, []);

  useEffect(() => {
    updatePosition(position);
  }, [position, updatePosition]);

  return { ...controls, updatePosition };
}
