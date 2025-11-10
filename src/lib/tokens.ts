/**
 * Morphing Canvas Design Tokens
 * Kairo Studio — Visual identity constants
 */

// Color Palette
export const colors = {
  bgDark: '#06070A',
  canvasMid: '#0B1020',
  accentCyan: '#00E5FF',
  accentViolet: '#A854FF',
  accentAmber: '#FFC857',
  textWhite: '#FFFFFF',
  softBeige: '#F4EDE4',
} as const;

// Typography
export const typography = {
  fontFamily: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
  },
  weights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  sizes: {
    hero: {
      desktop: '48px',
      mobile: '28px',
    },
    h1: {
      desktop: '64px',
      mobile: '36px',
    },
    body: '16px',
    small: '14px',
  },
} as const;

// Easings & Timings
export const animation = {
  durations: {
    micro: 70,
    microMax: 180,
    hover: 180,
    hoverMax: 320,
    cameraFlyMin: 700,
    cameraFlyMax: 1600,
    morphCycleMin: 4000,
    morphCycleMax: 9000,
    panelTransition: 420,
  },
  easings: {
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
    powerIn: [0.7, 0, 0.84, 0] as [number, number, number, number],
    powerOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
} as const;

// Performance & LOD
export const performance = {
  pixelRatio: {
    desktop: 1.25,
    mobile: 1,
  },
  lod: {
    high: 600,
    mid: 1400,
  },
  particles: {
    desktop: 6000,
    mobile: 800,
  },
  fpsThreshold: {
    degrade: 45,
    optimal: 50,
    target: 55,
  },
} as const;

// Interaction
export const interaction = {
  hoverDistance: 140, // pixels
  cameraLerp: 0.12,
  hoverPulse: 0.3,
  hoverDebounce: 80, // ms
  panPosition: 2, // audio pan range
} as const;

// Audio
export const audio = {
  volumes: {
    ambient: 0.2,
    sfx: 0.6,
  },
  files: {
    ambient: '/audio/ambient_loop.ogg',
    hoverPing: '/audio/hover_ping.ogg',
    morphEnter: '/audio/morph_enter.ogg',
    successClick: '/audio/success_click.ogg',
  },
} as const;

// Morph Definitions
export const morphs = {
  origin: {
    name: 'About',
    slug: 'about',
    accent: colors.accentViolet,
    description: 'About',
  },
  work: {
    name: 'Work',
    slug: 'work',
    accent: colors.accentCyan,
    description: 'Work',
  },
  demos: {
    name: 'Demos',
    slug: 'demos',
    accent: colors.accentCyan,
    description: 'Demos',
  },
  services: {
    name: 'Services',
    slug: 'services',
    accent: colors.accentViolet,
    description: 'Services',
  },
  network: {
    name: 'Collaborate',
    slug: 'collaborate',
    accent: colors.accentAmber,
    description: 'Collaborate',
  },
  portal: {
    name: 'Contact',
    slug: 'contact',
    accent: colors.softBeige,
    description: 'Contact',
  },
  strategy: {
    name: 'Strategy',
    slug: 'strategy',
    accent: colors.accentAmber,
    description: 'Strategy',
  },
  reviews: {
    name: 'Reviews',
    slug: 'reviews',
    accent: colors.softBeige,
    description: 'Reviews',
  },
} as const;

export type MorphType = keyof typeof morphs;
