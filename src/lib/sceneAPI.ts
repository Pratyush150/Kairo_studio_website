/**
 * Morphing Canvas Scene API
 * Zustand store for managing scene state and interactions
 *
 * EXACT IMPLEMENTATION per specification:
 * - Only one element visible at a time
 * - Drag/swipe navigation triggers tunnel transit
 * - Star burst spawns next element
 * - Click element to open content
 */

import { create } from 'zustand';
import { morphs, type MorphType } from './tokens';

// Exact state machine per specification
export type SceneState =
  | 'IDLE'              // One element displayed center, others hidden/offscreen
  | 'HOVERING'          // Pointer near center; subtle petal animation
  | 'TRANSIT_PENDING'   // User initiated move to next/prev by drag/scroll/swipe
  | 'TRANSITING'        // Camera flying through generated ring/tunnel path
  | 'STAR_BURST'        // Arrival star breaks and spawns element
  | 'ELEMENT_ACTIVE'    // Element visible and interactive (can be clicked)
  | 'OPENING_CONTENT'   // Slap → supernova animation + panel reveal
  | 'CONTENT_OPEN'      // Panel visible, interactions limited to panel
  | 'CLOSING_CONTENT'   // Reverse of opening
  | 'ERROR'             // Fallback mobile or low-power mode
  | 'loading';          // Initial loading state

export interface MorphData {
  id: MorphType;
  name: string;
  slug: string;
  accent: string;
  description: string;
}

// Element positioning - circular ring at radius 1600 for offscreen elements
const OFFSCREEN_RADIUS = 1600;
const ELEMENT_ORDER: MorphType[] = ['origin', 'work', 'network', 'portal'];

interface SceneStore {
  // State
  sceneState: SceneState;
  loadingProgress: number;
  currentIndex: number;  // Index of currently active element
  activeElement: MorphType;  // Currently active/visible element
  targetIndex: number | null;  // Target index during transit
  panelOpen: boolean;
  panelContent: MorphType | null;
  inputLocked: boolean;  // Lock input during animations

  // Transit state
  transitDirection: 'next' | 'prev' | null;
  tunnelActive: boolean;
  starBurstActive: boolean;

  // Gesture tracking
  dragStartX: number | null;
  dragStartTime: number | null;
  isDragging: boolean;

  // Settings
  audioEnabled: boolean;
  audioVolume: number;
  reducedMotion: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  isMobile: boolean;

  // Internal setters
  setState: (state: SceneState) => void;
  setLoadingProgress: (progress: number) => void;
  setCurrentIndex: (index: number) => void;
  setActiveElement: (element: MorphType) => void;
  setInputLocked: (locked: boolean) => void;
  setTunnelActive: (active: boolean) => void;
  setStarBurstActive: (active: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  setPanelContent: (content: MorphType | null) => void;

  // Gesture handlers
  onDragStart: (x: number) => void;
  onDragMove: (x: number) => void;
  onDragEnd: (x: number) => void;

  // Settings
  toggleAudio: () => void;
  setAudioVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  // Initial state - start with first element (origin)
  sceneState: 'loading',
  loadingProgress: 0,
  currentIndex: 0,
  activeElement: 'origin',
  targetIndex: null,
  panelOpen: false,
  panelContent: null,
  inputLocked: false,

  // Transit state
  transitDirection: null,
  tunnelActive: false,
  starBurstActive: false,

  // Gesture tracking
  dragStartX: null,
  dragStartTime: null,
  isDragging: false,

  // Settings from localStorage
  audioEnabled: localStorage.getItem('audioMuted') !== 'true',
  audioVolume: parseFloat(localStorage.getItem('audioVolume') || '0.5'),
  reducedMotion: false,
  performanceMode: 'high',
  isMobile: false,

  // Internal setters
  setState: (state) => {
    console.log('[sceneAPI] State transition:', get().sceneState, '→', state);
    set({ sceneState: state });

    // Emit state change event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:statechange', {
        detail: { state, previous: get().sceneState }
      }));
    }
  },

  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setCurrentIndex: (index) => {
    set({ currentIndex: index, activeElement: ELEMENT_ORDER[index] });
  },
  setActiveElement: (element) => set({ activeElement: element }),
  setInputLocked: (locked) => set({ inputLocked: locked }),
  setTunnelActive: (active) => set({ tunnelActive: active }),
  setStarBurstActive: (active) => set({ starBurstActive: active }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  setPanelContent: (content) => set({ panelContent: content }),

  // Gesture handlers
  onDragStart: (x) => {
    const state = get();
    if (state.inputLocked || state.sceneState !== 'ELEMENT_ACTIVE') return;

    set({
      dragStartX: x,
      dragStartTime: Date.now(),
      isDragging: true,
    });
  },

  onDragMove: (x) => {
    const state = get();
    if (!state.isDragging || state.dragStartX === null) return;

    const dx = x - state.dragStartX;
    const threshold = 28; // px

    // Visual feedback for drag distance
    if (Math.abs(dx) > threshold && state.sceneState === 'ELEMENT_ACTIVE') {
      // Show transit pending visual
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kairo:drag-feedback', {
          detail: { dx, direction: dx < 0 ? 'next' : 'prev' }
        }));
      }
    }
  },

  onDragEnd: (x) => {
    const state = get();
    if (!state.isDragging || state.dragStartX === null || state.dragStartTime === null) {
      set({ isDragging: false, dragStartX: null, dragStartTime: null });
      return;
    }

    const dx = x - state.dragStartX;
    const dt = Date.now() - state.dragStartTime;
    const velocity = Math.abs(dx) / dt; // px/ms

    // Threshold: |dx| > 28px and velocity > 0.15 px/ms OR |dx| > 120px
    const shouldTransit = (Math.abs(dx) > 28 && velocity > 0.15) || Math.abs(dx) > 120;

    set({ isDragging: false, dragStartX: null, dragStartTime: null });

    if (shouldTransit) {
      const direction = dx < 0 ? 'next' : 'prev';
      console.log('[sceneAPI] Drag complete - triggering transit:', direction, { dx, velocity });

      if (direction === 'next') {
        sceneAPI.goToNext();
      } else {
        sceneAPI.goToPrev();
      }
    }
  },

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
  setIsMobile: (mobile) => set({ isMobile: mobile }),
}));

// Helper: Get world position for element at index
export function getElementPosition(index: number, isActive: boolean): [number, number, number] {
  if (isActive) {
    return [0, 0, 0]; // Active element at origin
  }

  // Offscreen elements on circular ring
  const angle = (index / ELEMENT_ORDER.length) * Math.PI * 2;
  return [
    Math.cos(angle) * OFFSCREEN_RADIUS,
    0,
    Math.sin(angle) * OFFSCREEN_RADIUS,
  ];
}

// Helper: Compute tunnel midpoint
export function computeTunnelMidpoint(
  fromPos: [number, number, number],
  toPos: [number, number, number]
): [number, number, number] {
  return [
    (fromPos[0] + toPos[0]) / 2,
    (fromPos[1] + toPos[1]) / 2 + 50, // Slight arc upward
    (fromPos[2] + toPos[2]) / 2,
  ];
}

// Helper: Get slug index
export function getSlugIndex(slug: string): number {
  const morphEntry = Object.entries(morphs).find(([_, data]) => data.slug === slug);
  if (!morphEntry) return 0;
  const morphType = morphEntry[0] as MorphType;
  return ELEMENT_ORDER.indexOf(morphType);
}

/**
 * CORE API - Exact signatures per specification
 */
export const sceneAPI = {
  /**
   * Slide to next element via tunnel
   * IDLE → TRANSIT_PENDING → TRANSITING → STAR_BURST → ELEMENT_ACTIVE
   */
  goToNext: async (): Promise<void> => {
    const state = useSceneStore.getState();

    if (state.inputLocked || state.currentIndex >= ELEMENT_ORDER.length - 1) {
      console.log('[sceneAPI] goToNext blocked - at end or locked');
      return;
    }

    const nextIndex = state.currentIndex + 1;
    console.log('[sceneAPI] goToNext:', state.currentIndex, '→', nextIndex);

    // Set transit pending
    state.setState('TRANSIT_PENDING');
    state.setInputLocked(true);
    useSceneStore.setState({ transitDirection: 'next', targetIndex: nextIndex });

    // Trigger transit timeline
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:transit-start', {
        detail: {
          from: state.currentIndex,
          to: nextIndex,
          direction: 'next',
        }
      }));
    }

    // State transitions handled by timeline callbacks
  },

  /**
   * Slide to prev element via tunnel
   */
  goToPrev: async (): Promise<void> => {
    const state = useSceneStore.getState();

    if (state.inputLocked || state.currentIndex <= 0) {
      console.log('[sceneAPI] goToPrev blocked - at start or locked');
      return;
    }

    const prevIndex = state.currentIndex - 1;
    console.log('[sceneAPI] goToPrev:', state.currentIndex, '→', prevIndex);

    // Set transit pending
    state.setState('TRANSIT_PENDING');
    state.setInputLocked(true);
    useSceneStore.setState({ transitDirection: 'prev', targetIndex: prevIndex });

    // Trigger transit timeline
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:transit-start', {
        detail: {
          from: state.currentIndex,
          to: prevIndex,
          direction: 'prev',
        }
      }));
    }
  },

  /**
   * Direct navigation to index (fallback for header)
   * Does NOT open panel - only navigates to element
   */
  goToIndex: async (index: number): Promise<void> => {
    const state = useSceneStore.getState();

    if (state.inputLocked || index < 0 || index >= ELEMENT_ORDER.length) {
      console.log('[sceneAPI] goToIndex blocked - invalid index or locked');
      return;
    }

    if (index === state.currentIndex) {
      console.log('[sceneAPI] goToIndex - already at index', index);
      return;
    }

    console.log('[sceneAPI] goToIndex:', state.currentIndex, '→', index);

    // Determine direction
    const direction = index > state.currentIndex ? 'next' : 'prev';

    // Set transit pending
    state.setState('TRANSIT_PENDING');
    state.setInputLocked(true);
    useSceneStore.setState({ transitDirection: direction, targetIndex: index });

    // Trigger transit timeline
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:transit-start', {
        detail: {
          from: state.currentIndex,
          to: index,
          direction,
        }
      }));
    }
  },

  /**
   * Open active element with slap → supernova → panel
   * ELEMENT_ACTIVE → OPENING_CONTENT → CONTENT_OPEN
   */
  openActiveElement: async (): Promise<void> => {
    const state = useSceneStore.getState();

    if (state.inputLocked || state.sceneState !== 'ELEMENT_ACTIVE') {
      console.log('[sceneAPI] openActiveElement blocked - wrong state or locked');
      return;
    }

    console.log('[sceneAPI] openActiveElement:', state.activeElement);

    state.setState('OPENING_CONTENT');
    state.setInputLocked(true);
    state.setPanelContent(state.activeElement);

    // Trigger open timeline
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:element-opening', {
        detail: {
          element: state.activeElement,
          slug: morphs[state.activeElement].slug,
        }
      }));
    }

    // State transitions handled by timeline callbacks
  },

  /**
   * Close content panel
   * CONTENT_OPEN → CLOSING_CONTENT → ELEMENT_ACTIVE
   */
  closeContent: async (): Promise<void> => {
    const state = useSceneStore.getState();

    if (state.sceneState !== 'CONTENT_OPEN') {
      console.log('[sceneAPI] closeContent blocked - not open');
      return;
    }

    console.log('[sceneAPI] closeContent');

    state.setState('CLOSING_CONTENT');
    state.setInputLocked(true);

    // Trigger close timeline
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kairo:content-closing'));
    }

    // After animation (handled by timeline)
    setTimeout(() => {
      state.setState('ELEMENT_ACTIVE');
      state.setInputLocked(false);
      state.setPanelOpen(false);
      state.setPanelContent(null);

      // Update URL
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/');
      }
    }, 800);
  },

  /**
   * Get current state
   */
  getState: (): SceneState => {
    return useSceneStore.getState().sceneState;
  },

  /**
   * Event listener for state changes
   */
  on: (event: 'statechange' | 'enter' | 'leave', cb: (state: SceneState) => void) => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      cb(customEvent.detail.state);
    };

    window.addEventListener(`kairo:${event}`, handler);

    return () => window.removeEventListener(`kairo:${event}`, handler);
  },

  /**
   * Get morph data
   */
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

  /**
   * Get all morphs in order
   */
  getAllMorphs: (): MorphData[] => {
    return ELEMENT_ORDER.map(type => ({
      id: type,
      name: morphs[type].name,
      slug: morphs[type].slug,
      accent: morphs[type].accent,
      description: morphs[type].description,
    }));
  },

  /**
   * Toggle audio
   */
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

  /**
   * Set reduced motion
   */
  setReducedMotion: (enabled: boolean) => useSceneStore.getState().setReducedMotion(enabled),
};

// Export element order for external use
export { ELEMENT_ORDER };
