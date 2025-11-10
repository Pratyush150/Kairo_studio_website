# Required Assets for Production

This document lists all assets needed for full production deployment of the Kairo Studio Morphing Canvas site.

## 3D Models

### Logo Models (GLB format, Draco compressed)
- [ ] `logo_low.glb` - Low poly version (≤250KB) - for mobile/low-end devices
- [ ] `logo_med.glb` - Medium poly (≤600KB) - for desktop default
- [ ] `logo_high.glb` - High poly (≤1.8MB) - for high-end devices, lazy loaded

### Morph Models
- [ ] `morph_base.glb` - Base morph geometry with LOD levels
- [ ] `origin_morph.glb` - Origin/About morph shape
- [ ] `flow_morph.glb` - Flow/Work morph shape
- [ ] `network_morph.glb` - Network/Collaborate morph shape
- [ ] `portal_morph.glb` - Portal/Contact morph shape

### Environment
- [ ] `nebula_cubemap.ktx2` - Nebula environment map (1024x1024, compressed)
- [ ] `nebula_cubemap_fallback.png` - PNG fallback (512x512)

## Images

### Case Study Thumbnails (WEBP format, 1200×800, quality 75)
- [ ] `vellapanti-thumb.webp`
- [ ] `d2c-automation-thumb.webp`
- [ ] `fintech-dashboard-thumb.webp`

### Case Study Screenshots (WEBP format, 1920×1080, quality 80)
- [ ] `vellapanti-1.webp` - Dashboard screenshot
- [ ] `vellapanti-2.webp` - CMS interface
- [ ] `vellapanti-3.webp` - Analytics view
- [ ] `d2c-1.webp` - Automation flows
- [ ] `fintech-1.webp` - Real-time dashboard

### Open Graph Images (JPEG/WEBP, 1200×630, optimized)
- [ ] `og/home.jpg` - Homepage OG image
- [ ] `og/about.jpg` - About page OG image
- [ ] `og/work.jpg` - Work/case studies OG image
- [ ] `og/services.jpg` - Services OG image
- [ ] `og/demos.jpg` - Demos OG image
- [ ] `og/contact.jpg` - Contact OG image
- [ ] `og/collaborate.jpg` - Collaborate OG image
- [ ] `og/strategy.jpg` - Strategy/process OG image

### Team Photos (WEBP, 600×600, circular crop)
- [ ] `team/person1.webp`
- [ ] `team/person2.webp`
- [ ] `team/person3.webp`
- [ ] `team/person4.webp`

### Testimonial Avatars (WEBP, 200×200, circular)
- [ ] `testimonials/rajesh.jpg`
- [ ] `testimonials/priya.jpg`
- [ ] `testimonials/amit.jpg`
- [ ] `testimonials/sarah.jpg`
- [ ] `testimonials/michael.jpg`
- [ ] `testimonials/ananya.jpg`

### Company Logos (SVG preferred, or PNG 400×200, transparent)
- [ ] `testimonials/vellapanti-logo.svg`
- [ ] `testimonials/d2c-logo.svg`
- [ ] `testimonials/fintech-logo.svg`

### Service & Tech Icons (SVG, 64×64)
- [ ] `icons/automation.svg`
- [ ] `icons/saas.svg`
- [ ] `icons/marketing.svg`
- [ ] `icons/design.svg`
- [ ] `icons/analytics.svg`
- [ ] `icons/react.svg`
- [ ] `icons/nodejs.svg`
- [ ] `icons/typescript.svg`
- [ ] `icons/postgresql.svg`
- [ ] `icons/aws.svg`
- [ ] (etc. for all tech stack items)

## Lottie Animations

### Demo Preview Loops (JSON, ≤80KB each, muted, loop)
- [ ] `lottie/commerce-loop.json` - Commerce engine preview
- [ ] `lottie/campaign-loop.json` - Campaign tracker preview
- [ ] `lottie/saas-loop.json` - SaaS admin preview
- [ ] `lottie/flow-loop.json` - Flow builder preview
- [ ] `lottie/3d-loop.json` - 3D landing preview
- [ ] `lottie/pwa-loop.json` - PWA preview

### Hero Animations (JSON, ≤120KB each)
- [ ] `lottie/preloader.json` - Preloader animation (0-100% progress)
- [ ] `lottie/singularity.json` - Singularity compression effect
- [ ] `lottie/boom.json` - Explosive boom transition

## Audio Files

### Background Audio (OGG Vorbis, optimized)
- [ ] `sfx/ambient_loop.ogg` - Cosmic ambient loop (128kbps mono, seamless loop)

### Sound Effects (OGG Vorbis, short clips)
- [ ] `sfx/hover_ping.ogg` - Morph hover sound (32kbps, ~200ms)
- [ ] `sfx/click_whoosh.ogg` - Click/select sound (64kbps, ~300ms)
- [ ] `sfx/boom_warp.ogg` - Boom/transition sound (96kbps, ~500ms)
- [ ] `sfx/panel_open.ogg` - Panel open sound (64kbps, ~400ms)
- [ ] `sfx/panel_close.ogg` - Panel close sound (64kbps, ~300ms)

## Fonts

### Primary Font (WOFF2, variable, subsetted)
- [ ] `fonts/Inter-VariableFont.woff2` - Inter variable font
  - Subset: Latin extended
  - Weight range: 400-700
  - Include font-display: swap in CSS

## Diagrams & Charts (SVG preferred)
- [ ] `cases/vellapanti-architecture.svg` - System architecture diagram
- [ ] `cases/d2c-flow-diagram.svg` - Automation flow diagram
- [ ] `cases/fintech-data-pipeline.svg` - ETL pipeline diagram

## Videos (Optional, MP4 H.264, muted)
- [ ] `cases/vellapanti-demo.mp4` - CMS workflow demo (≤5MB, 30sec max)
- [ ] `cases/d2c-automation-demo.mp4` - Automation in action (≤5MB, 30sec max)

---

## Asset Optimization Guidelines

### Images
- Use WEBP for photos (80-90% quality for photos, 75% for thumbnails)
- Use SVG for logos, icons, diagrams
- Compress with tools like Squoosh, ImageOptim, or Sharp
- Provide 2x versions for retina displays (@2x suffix)
- Lazy load below-the-fold images

### 3D Models
- Use Draco compression for GLB files
- Optimize poly count (target <50k vertices for high-poly)
- Use LOD (Level of Detail) system
- Compress textures with KTX2/Basis Universal

### Lottie
- Optimize with Lottie Optimizer
- Remove unused layers/assets
- Compress with gzip (server-side)
- Limit to 60fps max

### Audio
- Use OGG Vorbis for web (better compression than MP3)
- Mono for ambient/SFX (stereo not needed)
- Low bitrate (32-128kbps) for short SFX
- Normalize levels for consistency

### Fonts
- Subset to required glyphs (Latin extended, numbers, punctuation)
- Use variable fonts to reduce number of files
- Preload critical fonts
- Use font-display: swap for progressive enhancement

---

## Asset Hosting Recommendations

### CDN
- Host static assets on CDN (Cloudflare, AWS CloudFront, Vercel Edge)
- Enable Brotli/gzip compression
- Set proper cache headers (1 year for immutable assets)
- Use content hashing for cache busting

### Image CDN (Optional but Recommended)
- Use Cloudinary, Imgix, or Vercel Image Optimization
- Automatic format conversion (WEBP, AVIF)
- Automatic responsive sizing
- Lazy loading with blur-up placeholder

---

## Current Status

As of 2025-11-10:
- ✅ Directory structure created
- ✅ README in `/public/assets/sfx/`
- ❌ No actual asset files present
- ⚠️ Placeholder logo present: `kairo_logo.jpg` (should be replaced with optimized versions)

## Next Steps

1. **Immediate (P0)**: Create OG images for SEO (critical for social sharing)
2. **High Priority (P1)**: Case study thumbnails and screenshots
3. **Medium Priority (P2)**: Lottie animations, team photos, testimonial avatars
4. **Lower Priority (P3)**: Audio files, 3D models (site functions without these)

---

**Note**: Until real assets are provided, the site uses:
- Placeholder images from `via.placeholder.com`
- CSS gradients and colors for backgrounds
- Text-only fallbacks for missing content
- Console warnings for missing assets (dev mode only)
