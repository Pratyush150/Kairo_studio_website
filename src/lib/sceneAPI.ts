import { create } from 'zustand';

export type SceneState = 'loading' | 'singularity' | 'boom' | 'idle' | 'transition' | 'panel';

export interface EntityData {
  id: string;
  title: string;
  slug: string;
  type: 'fractal' | 'metaball' | 'cube-matrix' | 'helix' | 'orb' | 'lattice' | 'prism' | 'gateway';
  description: string;
  color: string;
  position: [number, number, number];
  orbitSpeed: number;
}

interface SceneStore {
  // State
  sceneState: SceneState;
  loadingProgress: number;
  selectedEntity: string | null;
  hoveredEntity: string | null;
  audioEnabled: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  reducedMotion: boolean;

  // Entities
  entities: EntityData[];

  // Actions
  setSceneState: (state: SceneState) => void;
  setLoadingProgress: (progress: number) => void;
  selectEntity: (id: string | null) => void;
  hoverEntity: (id: string | null) => void;
  toggleAudio: () => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
  setReducedMotion: (enabled: boolean) => void;

  // Scene control methods
  goTo: (slug: string) => Promise<void>;
  openPanel: (slug: string) => Promise<void>;
  closePanel: () => Promise<void>;
  resetView: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  // Initial state
  sceneState: 'loading',
  loadingProgress: 0,
  selectedEntity: null,
  hoveredEntity: null,
  audioEnabled: localStorage.getItem('audioMuted') !== 'true',
  performanceMode: 'high',
  reducedMotion: false,

  // Entity data - matches the spec
  entities: [
    {
      id: '1',
      title: 'Brand Strategy',
      slug: 'brand-strategy',
      type: 'fractal',
      description: 'Fractal crystal cluster with pulsing core',
      color: '#A854FF', // Violet
      position: [120, 30, -50],
      orbitSpeed: 18,
    },
    {
      id: '2',
      title: 'Design & Creative',
      slug: 'design-creative',
      type: 'metaball',
      description: 'Fluid morphing metaball blob',
      color: '#00FFFF', // Cyan
      position: [-100, -40, 60],
      orbitSpeed: 24,
    },
    {
      id: '3',
      title: 'SaaS & Automation',
      slug: 'saas-automation',
      type: 'cube-matrix',
      description: 'Modular expanding cube matrix',
      color: '#3B9CFF', // Electric blue
      position: [80, -50, 80],
      orbitSpeed: 20,
    },
    {
      id: '4',
      title: 'Performance Marketing',
      slug: 'performance-marketing',
      type: 'helix',
      description: 'Twisting helix vortex spiral',
      color: '#FFC857', // Amber
      position: [-90, 60, -70],
      orbitSpeed: 22,
    },
    {
      id: '5',
      title: 'Case Studies',
      slug: 'case-studies',
      type: 'orb',
      description: 'Energy orb with satellites',
      color: '#E23EFF', // Magenta
      position: [0, 80, 100],
      orbitSpeed: 28,
    },
    {
      id: '6',
      title: 'Collaborations',
      slug: 'collaborations',
      type: 'lattice',
      description: 'Network lattice with expanding nodes',
      color: '#FFFFFF', // White
      position: [110, -70, -90],
      orbitSpeed: 32,
    },
    {
      id: '7',
      title: 'Experiments',
      slug: 'experiments',
      type: 'prism',
      description: 'Holographic rotating prism',
      color: '#50FFC8', // Turquoise
      position: [-120, 20, 40],
      orbitSpeed: 26,
    },
    {
      id: '8',
      title: 'Contact',
      slug: 'contact',
      type: 'gateway',
      description: 'Central gateway ring',
      color: '#FFD369', // Gold
      position: [0, -90, 0],
      orbitSpeed: 40,
    },
  ],

  // Actions
  setSceneState: (state) => set({ sceneState: state }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  selectEntity: (id) => set({ selectedEntity: id }),
  hoverEntity: (id) => set({ hoveredEntity: id }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  setReducedMotion: (enabled) => set({ reducedMotion: enabled }),

  // Scene control
  goTo: async (slug: string) => {
    const entity = get().entities.find((e) => e.slug === slug);
    if (!entity) return;

    set({ sceneState: 'transition', selectedEntity: entity.id });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'entity_click', {
        entity_id: entity.id,
        entity_slug: slug,
      });
    }

    // Wait for transition animation
    await new Promise((resolve) => setTimeout(resolve, 1800));

    set({ sceneState: 'panel' });
  },

  openPanel: async (slug: string) => {
    await get().goTo(slug);
  },

  closePanel: async () => {
    set({ sceneState: 'transition', selectedEntity: null });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'panel_close', {});
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    set({ sceneState: 'idle' });
  },

  resetView: () => {
    set({
      sceneState: 'idle',
      selectedEntity: null,
      hoveredEntity: null,
    });
  },
}));

// Export API for external use
export const sceneAPI = {
  goTo: (slug: string) => useSceneStore.getState().goTo(slug),
  openPanel: (slug: string) => useSceneStore.getState().openPanel(slug),
  closePanel: () => useSceneStore.getState().closePanel(),
  highlight: (slug: string) => {
    const entity = useSceneStore.getState().entities.find((e) => e.slug === slug);
    if (entity) {
      useSceneStore.getState().hoverEntity(entity.id);
    }
  },
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
  resetView: () => useSceneStore.getState().resetView(),
};
