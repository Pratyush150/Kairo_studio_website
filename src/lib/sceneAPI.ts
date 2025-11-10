/**
 * Morphing Canvas Scene API
 * Zustand store for managing scene state and interactions
 */

import { create } from 'zustand';
import { morphs, type MorphType } from './tokens';

export type SceneState = 'loading' | 'idle' | 'morphing' | 'panel';

export interface MorphData {
  id: MorphType;
  name: string;
  slug: string;
  accent: string;
  description: string;
}

interface SceneStore {
  // State
  sceneState: SceneState;
  loadingProgress: number;
  activeMorph: MorphType;
  hoveredMorph: MorphType | null;
  panelOpen: boolean;
  panelContent: MorphType | null;

  // Settings
  audioEnabled: boolean;
  audioVolume: number;
  reducedMotion: boolean;
  performanceMode: 'high' | 'medium' | 'low';

  // Actions
  setSceneState: (state: SceneState) => void;
  setLoadingProgress: (progress: number) => void;
  setActiveMorph: (morph: MorphType) => void;
  setHoveredMorph: (morph: MorphType | null) => void;
  toggleAudio: () => void;
  setAudioVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;

  // Scene control methods
  goToMorph: (slug: string) => Promise<void>;
  openPanel: (slug: string) => Promise<void>;
  closePanel: () => Promise<void>;
  resetView: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  // Initial state
  sceneState: 'loading',
  loadingProgress: 0,
  activeMorph: 'origin',
  hoveredMorph: null,
  panelOpen: false,
  panelContent: null,

  // Settings from localStorage
  audioEnabled: localStorage.getItem('audioMuted') !== 'true',
  audioVolume: parseFloat(localStorage.getItem('audioVolume') || '0.5'),
  reducedMotion: false,
  performanceMode: 'high',

  // Actions
  setSceneState: (state) => set({ sceneState: state }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setActiveMorph: (morph) => set({ activeMorph: morph }),
  setHoveredMorph: (morph) => set({ hoveredMorph: morph }),

  toggleAudio: () => set((state) => {
    const newState = !state.audioEnabled;
    localStorage.setItem('audioMuted', String(!newState));
    return { audioEnabled: newState };
  }),

  setAudioVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audioVolume', String(clampedVolume));
    set({ audioVolume: clampedVolume });
  },

  setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),

  // Scene control
  goToMorph: async (slug: string) => {
    const morphEntry = Object.entries(morphs).find(([_, data]) => data.slug === slug);
    if (!morphEntry) return;

    const morphType = morphEntry[0] as MorphType;
    set({ sceneState: 'morphing', activeMorph: morphType });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'morph_navigate', {
        morph_type: morphType,
        morph_slug: slug,
      });
    }

    // Wait for morph transition
    await new Promise((resolve) => setTimeout(resolve, 1400));
    set({ sceneState: 'idle' });
  },

  openPanel: async (slug: string) => {
    const morphEntry = Object.entries(morphs).find(([_, data]) => data.slug === slug);
    if (!morphEntry) return;

    const morphType = morphEntry[0] as MorphType;

    set({
      sceneState: 'morphing',
      activeMorph: morphType,
      panelContent: morphType,
    });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'panel_open', {
        morph_type: morphType,
        morph_slug: slug,
      });
    }

    // Wait for camera fly-in animation
    await new Promise((resolve) => setTimeout(resolve, 1400));
    set({ sceneState: 'panel', panelOpen: true });
  },

  closePanel: async () => {
    set({ sceneState: 'morphing', panelOpen: false });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'panel_close', {});
    }

    // Wait for camera fly-out animation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    set({ sceneState: 'idle', panelContent: null });
  },

  resetView: () => {
    set({
      sceneState: 'idle',
      activeMorph: 'origin',
      hoveredMorph: null,
      panelOpen: false,
      panelContent: null,
    });
  },
}));

// Export API for external use
export const sceneAPI = {
  goToMorph: (slug: string) => useSceneStore.getState().goToMorph(slug),
  openPanel: (slug: string) => useSceneStore.getState().openPanel(slug),
  closePanel: () => useSceneStore.getState().closePanel(),
  toggleAudio: (flag?: boolean) => {
    if (flag !== undefined) {
      const currentState = useSceneStore.getState().audioEnabled;
      if (currentState !== flag) {
        useSceneStore.getState().toggleAudio();
      }
    } else {
      useSceneStore.getState().toggleAudio();
    }
  },
  setReducedMotion: (enabled: boolean) => useSceneStore.getState().setReducedMotion(enabled),
  resetView: () => useSceneStore.getState().resetView(),

  // Get morph data
  getMorphData: (type: MorphType): MorphData => {
    const morph = morphs[type];
    return {
      id: type,
      name: morph.name,
      slug: morph.slug,
      accent: morph.accent,
      description: morph.description,
    };
  },

  // Get all morphs
  getAllMorphs: (): MorphData[] => {
    return Object.entries(morphs).map(([type, data]) => ({
      id: type as MorphType,
      name: data.name,
      slug: data.slug,
      accent: data.accent,
      description: data.description,
    }));
  },
};
