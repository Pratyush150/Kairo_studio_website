# Cerebral Machine - Complete Implementation Specification

**Project**: Single-page 3D brain visualization with interactive micro-scenes
**Tech Stack**: React (Vite) + Three.js + react-three-fiber
**Status**: Fresh start - Implementation begins now

---

## High-Level Architecture

### Frontend
- **Framework**: React (Vite) + react-three-fiber (r3f)
- **Canvas**: Mounted in hero component
- **UI**: HTML/CSS overlay (CTAs, nav, case cards)

### 3D Runtime
- **Engine**: Three.js (via r3f)
- **Models**: GLTF (Draco compressed)
- **Particles**: GPU-based (InstancedBufferGeometry + custom GLSL)
- **Shaders**: Emissive fibers
- **Postprocessing**: Bloom, GODRAYS-lite, Temporal AA

### Animation/Orchestration
- **GSAP**: Core animation library
- **ScrollTrigger**: Scroll-driven state changes
- **Timelines**: Micro-scene animations

### Asset Pipeline
- **Formats**: glTF, Draco, KTX2/Basis textures
- **LOD**: Multiple glTF variants
- **Tools**: gltf-pipeline, gltfpack, Draco encoder (build step)

### Hosting & Delivery
- **CDN**: S3+CloudFront or Cloudflare
- **Protocol**: HTTP/2
- **Compression**: Brotli/Gzip
- **Caching**: Service Worker (Workbox), immutable hashing

### DevOps
- **CI**: GitHub Actions
- **Build**: Asset optimization, Lighthouse CI
- **Deploy**: Upload artifacts to CDN

### Fallbacks
- **Static**: HTML/SVG/CSS hero for low-end devices & crawlers
- **Demo**: Lightweight video or simplified canvas
- **Accessibility**: Full keyboard navigation, screen reader support

### Analytics
- **Events**: Module clicks, micro-scene opens, 3D engagement time
- **Provider**: Custom events to analytics service

---

## Project Structure

```
/src
  /assets
    /models
      brain_core.lod0.glb        # Low-res core (preload)
      brain_core.lod1.glb        # Mid-res
      brain_core.lod2.glb        # High-res
      module_saas.glb
      module_integration.glb
      module_automation.glb
    /textures
      fiber_base.ktx2
      ao_base.ktx2
  /components
    CanvasRoot.jsx              # r3f Canvas wrapper + Suspense + loaders
    BrainScene.jsx              # Main 3D scene, camera controls, postprocessing
    BrainCore.jsx               # Brain core model + LOD handling
    ModuleMicroScene.jsx        # Micro-scene opened on click (lazy)
    HUDOverlay.jsx              # HTML overlay (CTAs, labels)
    FallbackHero.jsx            # Static SVG/CSS fallback
  /lib
    loaders.js                  # DRACOLoader, KTX2Loader, GLTFLoader setup
    /shaders
      fiberShader.glsl
      particleShader.glsl
  /utils
    perf.js                     # Adaptive quality utilities
    analytics.js                # Analytics tracking
  main.jsx
/vite.config.js
/package.json
/scripts
  optimize-assets.js            # Runs gltfpack / basisu / toktx / draco
```

---

## Key Dependencies

### Core Libraries
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "three": "^0.169.0",
  "@react-three/fiber": "^8.17.10",
  "@react-three/drei": "^9.114.3",
  "gsap": "^3.12.5"
}
```

### Build Tools
- `gltfpack` - GLTF compression
- `draco3d` - Draco compression
- `ktx2` / `basisu` - Texture compression
- `postprocessing` - Three.js postprocessing
- `workbox-webpack-plugin` - Service worker
- `lighthouse-ci` - Performance testing

### Optional
- `sentry` / `datadog` - Error tracking
- `vite` - Build tool

---

## Loader Strategy & Code Patterns

### 1. Central Loaders (src/lib/loaders.js)

```javascript
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function createLoaders({ renderer }) {
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');

  const ktx2 = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(renderer);

  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);
  gltf.setKTX2Loader(ktx2);

  return { gltf, draco, ktx2 };
}
```

### 2. Progressive LOD

**Strategy**:
1. Ship `brain_core.lod0.glb` (very low poly) - preload
2. Mount renderer and show low-res immediately
3. After TTI, load lod1 and swap meshes
4. Module glTFs loaded only on hover/click

### 3. Suspense + Placeholder

```jsx
<Suspense fallback={<LowResPlaceholder />}>
  <BrainScene />
</Suspense>
```

---

## Shader Architecture

### Fiber Emissive Shader

**Vertex Shader**:
```glsl
// Animate UV offset and noise-driven displacement
attribute float aIntensity;
varying float vIntensity;
varying vec2 vUv;

void main() {
  vUv = uv;
  vIntensity = aIntensity;
  vec3 pos = position;
  pos += normal * snoise(position * 1.5 + uTime * 0.2) * 0.02;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**Fragment Shader**:
```glsl
varying float vIntensity;
varying vec2 vUv;
uniform vec3 uBaseColor;
uniform float uTime;

void main() {
  float t = smoothstep(0.0, 1.0, fract(vUv.y + uTime * 0.2));
  vec3 color = uBaseColor * (vIntensity * 0.8 + t * 0.2);
  float alpha = pow(t, 1.2) * vIntensity;
  gl_FragColor = vec4(color, alpha);
}
```

### GPU Particle Streams

**Strategy**:
- Use `InstancedBufferGeometry`
- Store path positions or parametric offset as attributes
- Update per-frame via texture or uniform array
- N trails per stream, X segments per trail
- Vertex shader animates along curve using instanceID + uTime

---

## Micro-Scenes (Module Details)

### Implementation
- Each micro-scene = lazy component
- Mounts into same r3f Canvas
- Own small camera and timeline
- Separate bundles loaded on demand

### Lifecycle
1. **Open**: Trigger GSAP timeline
2. **Close**: Dispose geometries/materials (`.dispose()`)

### Modules
1. **SaaS** - module_saas.glb
2. **Automation** - module_automation.glb
3. **Integration** - module_integration.glb

---

## Camera & Controls

### Strategy
- **No free camera** - pre-baked camera rigs
- Short, deterministic easing paths (cubic easing)
- Small rotation on idle
- Limited pitch/yaw on pointer drag
- Damping over continuous updates
- Scroll-driven: map scroll → uTime multiplier → particle emission rate

---

## UI Integration & Accessibility

### HTML Overlay
- Keep CTAs and text as HTML (not 3D text)
- Use `Html` from drei for labels when needed
- SEO content remains HTML

### Keyboard Support
- Modules accessible by Tab
- Enter opens micro-scene
- `aria-expanded` attributes

### Accessibility Features
- **Skip 3D** toggle
- Static fallback for `prefers-reduced-motion`
- SVG hero approximation
- Lightweight MP4/WebM demo button

---

## Build & Asset Optimization Pipeline

### Model Export Rules (Artist)
1. Separate brain core into named nodes:
   - `Core`
   - `Module_SAAS`
   - `Module_AUTOMATION`
   - `Module_INTEGRATION`

2. Each module exported as separate glTF

3. Provide LODs:
   - `lod0` - Very low poly
   - `lod1` - Medium poly
   - `lod2` - High poly

4. UV layout: Packed and consistent
5. Bake AO & roughness maps into textures

### Compression & Conversion (CI)

```bash
# GLTF compression
gltfpack -i brain_core_lod2.glb -o brain_core_lod2.opt.glb -c 1

# Texture conversion
toktx --bcmp --t2 --genmipmap brain_diffuse.png brain_diffuse.ktx2

# Optional: Prune unused attributes
gltf-transform ...
```

### Pipeline Script (optimize-assets.js)

**Steps**:
1. Iterate models → run gltfpack/gltf-transform
2. Convert textures → KTX2
3. Generate LOD and bounding box metadata (JSON manifest)
4. Output to `/dist/assets` with hashed filenames
5. Produce `assets-manifest.json` (logical names → hashed paths + sizes)

---

## Performance Budget

### Targets

| Metric | Target |
|--------|--------|
| Initial JS bundle (main) | ≤ 150 KB gzipped |
| First meaningful paint (HTML + low-res canvas) | < 1–1.5 MB total transfer |
| First 3D interactive frame (low-res brain) | < 2.5 MB total assets |
| Peak memory on mobile | < 200 MB |
| CPU (mid-range mobile) | 30–60 FPS |

**Enforcement**: CI with Lighthouse thresholds

---

## Progressive Enhancement & Adaptive Quality

### Device Detection
- `navigator.gpu` (if available)
- `deviceMemory`
- `hardwareConcurrency`
- `prefers-reduced-motion`

### Quality Levels

| Level | LOD | Postprocessing | Particles |
|-------|-----|----------------|-----------|
| **Low** | lod0 | Disabled | 90% reduction |
| **Medium** | lod1 | Limited | Moderate |
| **High** | lod2 | Full | Full count |

**Implementation**: `QualityManager` util

---

## Postprocessing Setup

### Pipeline
1. Render scene
2. Bloom (thresholded, small sample size)
3. God-rays-lite (depth/occlusion trick)
4. FXAA/Temporal AA

**Performance**: Keep passes cheap, avoid expensive SSAO

---

## Dev & QA Tooling

### Development
- **SpectorJS** - WebGL draw call inspection
- **Chrome DevTools** - Performance, Memory
- **FPS meter** - Runtime FPS overlay (dev only)

### Testing
- **WebPageTest** + **Lighthouse** - Core Web Vitals
- **BrowserStack** - Cross-device testing
- Test devices:
  - Low-end Android (4GB RAM)
  - iPhone (Safari)

---

## CI/CD Pipeline (GitHub Actions)

### Build Job
```yaml
on: push

jobs:
  build:
    - Install deps
    - Run npm run lint && npm run test
    - Run node scripts/optimize-assets.js
    - Build vite production
    - Run lighthouse-ci (fail if thresholds not met)
    - Upload artifacts to release/CDN
```

### Deploy Job (on success)
```yaml
  deploy:
    - Purge CDN cache
    - Create invalidation for draco/basis paths
```

---

## Runtime Monitoring & Metrics

### Track
- Module open rate (per module)
- Average time spent in 3D scene
- Canvas interactions / hovers
- Conversion events (CTA clicks)
- Core Web Vitals (FCP, LCP, TTI)
- WebGL errors and memory spikes (Sentry)

---

## Component Code Skeletons

### CanvasRoot.jsx

```jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import BrainScene from './BrainScene';
import FallbackHero from './FallbackHero';

export default function CanvasRoot() {
  const isLow = /* detect via QualityManager */;
  if (isLow) return <FallbackHero />;

  return (
    <Canvas dpr={[1, 1.5]} shadows gl={{ antialias: true }}>
      <Suspense fallback={<Html center><div>Loading visual...</div></Html>}>
        <BrainScene />
      </Suspense>
    </Canvas>
  );
}
```

### BrainScene.jsx

```jsx
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrainScene() {
  const { gl } = useThree();
  // Loaders and scene setup here
  // Manage uniforms like uTime, uSpeed

  useFrame((state, delta) => {
    // Update shader uTime, particles
  });

  useEffect(() => {
    // ScrollTrigger maps scroll to uSpeed
  }, []);

  return (
    <>
      {/* Core brain, modules as components */}
    </>
  );
}
```

---

## Testing Checklist (Acceptance)

- [ ] Low-res placeholder shows instantly (< 600ms TTFB)
- [ ] Low-res brain appears and is interactive before high-res load
- [ ] Modules load on click without blocking UI
- [ ] FPS ≥ 30 on mid-range Android; ≥ 50 on desktop
- [ ] Fallback hero displayed for `prefers-reduced-motion` or low-end devices
- [ ] All interactive hotspots reachable via keyboard and screen reader
- [ ] Lighthouse: FCP and LCP in acceptable range, TBT < 150ms

---

## Common Pitfalls & Mitigations

### 1. Large glTFs
- **Solution**: Split into modules, use Draco and gltfpack
- **Validate**: Use gltf-validator

### 2. Too Many Draw Calls
- **Solution**: Combine static geometry, use instancing

### 3. Mobile Performance
- **Solution**: Lightweight fallback + explicit "Skip 3D" control

### 4. Memory Leaks
- **Solution**: Always `.dispose()` geometries, materials, textures

### 5. SEO
- **Solution**: Don't put critical text in canvas, provide HTML meta + structured data

---

## Final Notes

### Team Requirements
- **WebGL Developer**: Experienced with Three.js/r3f
- **3D Artist**: Familiar with glTF/LOD pipelines
- **Warning**: Generalist devs will struggle with performance requirements

### Optimization Cycles
- First working prototype ≠ production-ready
- Expect multiple optimization iterations
- Budget for quality art + optimization

### Investment Priority
- If brain metaphor matters to conversions → spend on quality art
- Cutting corners = slow, cheap feel = lower conversions

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Status**: Implementation spec approved - Ready to build
