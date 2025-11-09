# Kairoverse - The Living Galaxy of Ideas

A cinematic 3D website experience for Kairo Studio, built with React, Three.js, and cutting-edge web technologies.

## 🌌 Overview

Kairoverse is an immersive, interactive galaxy where every service, project, and demo floats as part of a cosmic ecosystem. Built with performance, accessibility, and stunning visuals in mind.

## ✨ Features

- **Cinematic Entry Sequence**: Loading → Singularity compression → Explosive boom → Galaxy reveal
- **8 Interactive Entities**: Each representing a core service/offering with unique 3D geometry
- **Custom GLSL Shaders**: Particle systems, metaball morphing, and procedural effects
- **Post-Processing Effects**: Bloom, chromatic aberration, depth of field
- **Performance Optimization**: Dynamic LOD, FPS monitoring, adaptive quality settings
- **Full Accessibility**: Reduced motion support, keyboard navigation, ARIA labels
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **React 18** - UI framework
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **React Three Postprocessing** - Post-processing effects
- **GSAP** - Animation timeline and tweening
- **Howler.js** - Spatial audio system
- **Zustand** - State management
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
/kairoverse
├─ /public              # Static assets
│  ├─ /assets
│  │  ├─ /sfx          # Sound effects
│  │  └─ /lottie       # Lottie animations
│  └─ favicon.svg
├─ /src
│  ├─ /components      # React components
│  │  ├─ CanvasShell.tsx
│  │  ├─ KairoLogo.tsx
│  │  ├─ Entity.tsx
│  │  ├─ ParticleField.tsx
│  │  ├─ Preloader.tsx
│  │  ├─ SceneController.tsx
│  │  ├─ HUD.tsx
│  │  ├─ PanelView.tsx
│  │  └─ /EntityShapes
│  ├─ /hooks           # Custom React hooks
│  ├─ /shaders         # GLSL shaders
│  ├─ /styles          # Global styles
│  ├─ /lib             # Utilities and state
│  ├─ App.tsx
│  └─ index.tsx
└─ package.json
```

## 🎨 Entity Types

1. **Brand Strategy** - Fractal crystal cluster (Violet)
2. **Design & Creative** - Morphing metaball blob (Cyan)
3. **SaaS & Automation** - Modular cube matrix (Electric Blue)
4. **Performance Marketing** - Twisting helix vortex (Amber)
5. **Case Studies** - Energy orb with satellites (Magenta)
6. **Collaborations** - Network lattice (White)
7. **Experiments** - Holographic prism (Turquoise)
8. **Contact** - Gateway ring (Gold)

## 🎮 Controls

- **Mouse Move**: Parallax camera rotation
- **Scroll**: Zoom in/out
- **Click Entity**: Fly to entity and open panel
- **ESC**: Close panel and return to galaxy view
- **Hover Bottom Edge**: Show HUD controls

## ⚡ Performance

- Dynamic quality adjustment based on FPS
- Particle count scales with device capability
- Frustum culling for off-screen entities
- LOD system for 3D models
- Shader complexity adapts to performance

## ♿ Accessibility

- Full keyboard navigation
- Screen reader support with ARIA labels
- Reduced motion mode (honors `prefers-reduced-motion`)
- High contrast focus indicators
- Semantic HTML structure

## 🎵 Audio System

- Spatial audio with 3D positioning
- Ambient cosmic soundscape
- Interaction sound effects (hover, click, transition)
- Mute toggle with localStorage persistence

## 🔮 Future Enhancements

- [ ] Mobile-specific optimizations and gestures
- [ ] CMS integration for dynamic content
- [ ] Additional entity types
- [ ] VR/XR support
- [ ] Advanced particle physics
- [ ] Real-time collaboration features

## 📝 License

Copyright © 2024 Kairo Studio. All rights reserved.

## 🙌 Credits

Built with ❤️ by the Kairo Studio team.

Powered by Claude Code v3.0
