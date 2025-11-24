# Cerebral Machine

> Interactive 3D Brain Visualization with Micro-Scenes

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🧠 Overview

Cerebral Machine is a cutting-edge single-page web application featuring an interactive 3D brain visualization. Built with Three.js and React Three Fiber, it showcases three core business modules (SaaS, Automation, Integration) through immersive micro-scenes with GPU-accelerated particles, custom GLSL shaders, and scroll-driven animations.

**Live Demo**: http://152.67.2.20:3000

---

## ✨ Features

### 🎨 3D Visualization
- **Brain Core Model** - Progressive LOD loading (lod0 → lod1 → lod2)
- **Emissive Fiber Shaders** - Custom GLSL with animated displacement
- **GPU Particle Streams** - InstancedBufferGeometry with thousands of particles
- **Interactive Modules** - Clickable hotspots for SaaS, Automation, Integration

### ⚡ Performance
- **Adaptive Quality** - Automatic adjustment based on device capabilities
- **Progressive Loading** - Low-res first, high-res streaming
- **Asset Optimization** - Draco compression, KTX2 textures
- **Target**: 30-60 FPS on mid-range devices, <200MB peak memory

### 🎬 Animations
- **GSAP + ScrollTrigger** - Scroll-driven state changes
- **Micro-Scene Timelines** - Smooth transitions for module details
- **Camera Paths** - Pre-baked rigs with cubic easing

### ♿ Accessibility
- **Keyboard Navigation** - Full Tab/Enter support
- **Screen Reader Compatible** - ARIA attributes
- **Static Fallback** - SVG/CSS hero for low-end devices
- **Skip 3D Toggle** - Respect `prefers-reduced-motion`

### 🚀 Postprocessing
- **Bloom** - Thresholded emissive glow
- **God-rays** - Depth/occlusion-based
- **Temporal AA** - Smooth anti-aliasing

---

## 🛠️ Tech Stack

### Core
- **Vite** - Build tool & dev server
- **React 18** - UI framework
- **TypeScript** - Type safety

### 3D
- **Three.js** - WebGL rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers (OrbitControls, Html, etc.)
- **@react-three/postprocessing** - Effect composer

### Animation
- **GSAP** - Animation library
- **ScrollTrigger** - Scroll-driven animations

### Development
- **Leva** - GUI controls for dev/debugging
- **ESLint** - Code linting

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+

### Installation

```bash
# Clone repository
git clone https://github.com/Pratyush150/Kairo_studio_website.git cerebral-machine
cd cerebral-machine

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📦 Project Structure

```
cerebral-machine/
├── docs/
│   ├── IMPLEMENTATION_SPEC.md    # Complete technical specification
│   └── PHASES.md                  # 14-phase development roadmap
├── public/
│   ├── draco/                     # Draco decoder files
│   └── basis/                     # KTX2 transcoder files
├── src/
│   ├── assets/
│   │   ├── models/                # GLTF models (brain core, modules)
│   │   └── textures/              # KTX2 compressed textures
│   ├── components/
│   │   ├── CanvasRoot.jsx         # r3f Canvas wrapper
│   │   ├── BrainScene.jsx         # Main 3D scene
│   │   ├── BrainCore.jsx          # Brain core with LOD (TODO)
│   │   ├── ModuleMicroScene.jsx   # Module detail views (TODO)
│   │   ├── HUDOverlay.jsx         # HTML overlay (TODO)
│   │   └── FallbackHero.jsx       # Static fallback (TODO)
│   ├── lib/
│   │   ├── loaders.js             # DRACO, KTX2, GLTF loaders (TODO)
│   │   └── shaders/
│   │       ├── fiberShader.glsl   # Emissive fiber shader (TODO)
│   │       └── particleShader.glsl # GPU particle shader (TODO)
│   ├── utils/
│   │   ├── perf.js                # Adaptive quality manager (TODO)
│   │   └── analytics.js           # Analytics tracking (TODO)
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── scripts/
│   └── optimize-assets.js         # Asset compression pipeline (TODO)
├── index.html                     # HTML entry point
├── vite.config.js                 # Vite configuration
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

---

## 📊 Development Roadmap

**Current Phase**: Phase 1 - Foundation & Setup ✅ **COMPLETED**

### Completed
- ✅ Phase 1: Foundation & Setup (100%)
  - Clean project structure
  - Vite + React + TypeScript configured
  - All core dependencies installed
  - Basic canvas rendering working
  - Project documentation in place

### Next Steps
- ⏳ Phase 2: Loaders & Asset Pipeline
- ⏳ Phase 3: Brain Core & LOD System
- ⏳ Phase 4: Shaders & Materials
- ⏳ Phase 5: Module Hotspots & Interaction
- ⏳ Phase 6: Micro-Scenes
- ⏳ Phase 7: GSAP & Scroll Integration
- ⏳ Phase 8: Postprocessing & Effects
- ⏳ Phase 9: Performance & Optimization
- ⏳ Phase 10: Accessibility & Fallbacks
- ⏳ Phase 11: Analytics & Monitoring
- ⏳ Phase 12: CI/CD & Deployment
- ⏳ Phase 13: Testing & QA
- ⏳ Phase 14: Polish & Launch

**Overall Progress**: 7% (1/14 phases complete)

See [docs/PHASES.md](docs/PHASES.md) for detailed roadmap.

---

## 📚 Documentation

### Main Documentation
- **[IMPLEMENTATION_SPEC.md](docs/IMPLEMENTATION_SPEC.md)** - Complete technical specification (60+ pages)
- **[PHASES.md](docs/PHASES.md)** - 14-phase development roadmap with tasks

### Key Sections
- High-level architecture
- Loader strategy & code patterns
- Shader architecture (GLSL examples)
- Micro-scenes implementation
- Performance budgets & targets
- Progressive enhancement strategy
- CI/CD pipeline
- Testing checklist

---

## 🎯 Performance Targets

| Metric | Target |
|--------|--------|
| Initial JS Bundle | ≤ 150 KB gzipped |
| First Meaningful Paint | < 1.5 MB total |
| First 3D Interactive | < 2.5 MB assets |
| Peak Memory (Mobile) | < 200 MB |
| FPS (Mid-range) | 30-60 FPS |
| FPS (Desktop) | 50-60 FPS |

**Enforcement**: CI with Lighthouse thresholds

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment

The dev server runs on:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000 (accessible from other devices)

### Key Technologies

**3D Rendering**:
- Three.js (WebGL engine)
- react-three-fiber (React renderer)
- @react-three/drei (helpers)

**Animation**:
- GSAP (core animations)
- ScrollTrigger (scroll-driven)

**Performance**:
- Draco compression (models)
- KTX2/Basis textures
- LOD (Level of Detail)
- InstancedBufferGeometry

---

## 🤝 Contributing

This project follows a phased development approach. See [docs/PHASES.md](docs/PHASES.md) for the current phase and tasks.

### Development Guidelines
- Follow TypeScript strict mode
- Use functional React components
- Optimize for performance (draw calls, memory)
- Test on target devices (mid-range Android, iPhone)
- Document complex shaders and algorithms

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Three.js Team** - Powerful WebGL engine
- **Poimandres** - React Three Fiber & Drei
- **GreenSock** - GSAP animation platform
- **Vite** - Lightning-fast build tool

---

## 📞 Support

For questions or support:
- 📖 Documentation: See `/docs` folder
- 🐛 Issues: [GitHub Issues](https://github.com/Pratyush150/Kairo_studio_website/issues)

---

## 🌟 Project Status

**Status**: ✅ Phase 1 Complete - Foundation Ready
**Next**: Phase 2 - Loaders & Asset Pipeline
**Live**: http://152.67.2.20:3000

**Built with ❤️ using React Three Fiber**

---

**Last Updated**: November 2025
**Version**: 1.0.0 (Phase 1)
**Framework**: Vite + React + Three.js
