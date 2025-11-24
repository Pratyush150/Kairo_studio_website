# Acceptance Test Checklist

Comprehensive acceptance criteria for Cerebral Machine project.

**Project**: Cerebral Machine (3D Brain Visualization)
**Last Updated**: November 2025
**Version**: 1.0.0

---

## 1. Core Functionality

### Brain Core Rendering
- [ ] Brain core renders on page load
- [ ] LOD system works correctly (lod0 → lod1 → lod2)
- [ ] Brain core is visible and has proper materials
- [ ] Emissive shader applied correctly
- [ ] Fresnel effect visible on edges
- [ ] Brain rotates smoothly
- [ ] No flickering or z-fighting

### Particle Systems
- [ ] 4 particle streams render correctly
- [ ] Particles animate along curves
- [ ] Particle speed adjusts with scroll
- [ ] Particle count adjusts based on device tier
- [ ] No particle clipping or disappearing
- [ ] Smooth animation at target FPS

### Module Hotspots
- [ ] 3 module hotspots visible (SaaS, Automation, Integration)
- [ ] Hotspots positioned correctly in 3D space
- [ ] Hover effects work (glow, scale, rotation)
- [ ] Click opens module detail view
- [ ] Cursor changes on hover
- [ ] Hotspot labels visible in HUD

### Micro-Scenes
- [ ] Module click triggers camera transition
- [ ] Camera zooms smoothly (1.2s duration)
- [ ] FOV transitions from 50° to 40°
- [ ] Module content loads correctly
- [ ] Module-specific 3D elements render
- [ ] Close button returns to main view
- [ ] Camera returns smoothly (1.0s duration)
- [ ] Controls disabled during transitions

---

## 2. Scroll & Navigation

### Scroll System
- [ ] Page scrolls smoothly (4 sections)
- [ ] Scroll progress indicator visible
- [ ] Section markers display correctly
- [ ] Click-to-section navigation works
- [ ] Brain rotation speed scales with scroll
- [ ] Camera distance adjusts with scroll
- [ ] Camera vertical offset (sin wave) works
- [ ] Scroll disabled when module is active

### Keyboard Navigation
- [ ] Tab key navigates between modules
- [ ] Arrow keys navigate modules
- [ ] Enter/Space activates module
- [ ] Escape closes module
- [ ] Number keys (1-3) jump to sections
- [ ] D key toggles debug panel
- [ ] A key toggles analytics dashboard
- [ ] Focus indicators visible

---

## 3. Performance

### FPS Targets
- [ ] Desktop (high-tier): ≥ 60 FPS
- [ ] Desktop (medium-tier): ≥ 45 FPS
- [ ] Desktop (low-tier): ≥ 30 FPS
- [ ] Mobile (high-tier): ≥ 45 FPS
- [ ] Mobile (medium-tier): ≥ 30 FPS
- [ ] Mobile (low-tier): ≥ 20 FPS

### Device Tiers
- [ ] High-tier devices get full quality
- [ ] Medium-tier devices get reduced quality
- [ ] Low-tier devices get minimal quality
- [ ] Quality adjusts automatically on load
- [ ] Device capability detection accurate

### LOD System
- [ ] LOD 0 loads first (lowest detail)
- [ ] LOD 1 loads when FPS stable
- [ ] LOD 2 loads when FPS high
- [ ] LOD downgrades if FPS drops
- [ ] Smooth transitions between LODs

### Memory Usage
- [ ] Initial memory usage < 150MB desktop
- [ ] Initial memory usage < 100MB mobile
- [ ] No memory leaks over 5 minutes
- [ ] Memory stable during navigation
- [ ] Proper cleanup on unmount

---

## 4. Postprocessing

### Bloom Effect
- [ ] Bloom applied to emissive elements
- [ ] Bloom threshold: 0.7-0.9
- [ ] Bloom intensity adjusts with scroll
- [ ] Mipmap blur enabled
- [ ] SCREEN blend mode active
- [ ] No over-blooming

### Other Effects
- [ ] Chromatic aberration visible (subtle)
- [ ] Vignette effect applied
- [ ] Effects adjust based on quality tier
- [ ] No artifacts or banding

---

## 5. Accessibility

### Keyboard Navigation
- [ ] All interactive elements accessible via keyboard
- [ ] Focus indicators visible (3px yellow outline)
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Skip links present and functional

### Screen Reader Support
- [ ] All elements have ARIA labels
- [ ] Proper heading hierarchy
- [ ] Role attributes correct
- [ ] Live regions announce changes
- [ ] Alt text for all images

### Reduced Motion
- [ ] prefers-reduced-motion detected
- [ ] Animations reduced when enabled
- [ ] No vestibular triggers
- [ ] Static fallback available

### Fallback Hero
- [ ] FallbackHero renders for non-WebGL
- [ ] Skip 3D toggle works
- [ ] Preference persists in localStorage
- [ ] Fallback is fully accessible
- [ ] Content parity with 3D view

---

## 6. Analytics & Monitoring

### Event Tracking
- [ ] Page views tracked
- [ ] Module views tracked
- [ ] Module duration tracked
- [ ] Scroll progress tracked
- [ ] Section changes tracked
- [ ] Conversion events tracked

### Web Vitals
- [ ] LCP tracked and logged
- [ ] FID tracked and logged
- [ ] CLS tracked and logged
- [ ] FCP tracked and logged
- [ ] TTFB tracked and logged
- [ ] Ratings calculated correctly

### Error Tracking
- [ ] Error Boundary catches errors
- [ ] Errors logged to analytics
- [ ] Fallback UI displays on error
- [ ] Error details captured
- [ ] DNT respected

---

## 7. Cross-Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### Mobile Browsers
- [ ] Safari iOS (latest 2 versions)
- [ ] Chrome Android (latest 2 versions)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Feature Detection
- [ ] WebGL detection works
- [ ] WebGL2 detection works
- [ ] Graceful degradation
- [ ] Feature warnings display

---

## 8. Responsive Design

### Breakpoints
- [ ] Mobile (< 768px) renders correctly
- [ ] Tablet (768px - 1024px) renders correctly
- [ ] Desktop (> 1024px) renders correctly
- [ ] Ultra-wide (> 1920px) renders correctly

### Touch Support
- [ ] Touch events work on mobile
- [ ] Pinch-to-zoom disabled on canvas
- [ ] Swipe gestures work
- [ ] Touch targets ≥ 44x44px
- [ ] No accidental activations

### Orientation
- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Orientation change handled gracefully
- [ ] Canvas resizes correctly

---

## 9. SEO & Metadata

### Meta Tags
- [ ] Title tag present and descriptive
- [ ] Meta description present
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] Canonical URL set

### Structured Data
- [ ] Schema.org markup present
- [ ] Valid JSON-LD
- [ ] Organization schema
- [ ] WebPage schema

### Content
- [ ] Semantic HTML structure
- [ ] Heading hierarchy correct (h1 → h6)
- [ ] Alt text on all images
- [ ] robots.txt present
- [ ] sitemap.xml present

---

## 10. Security

### Headers
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] X-XSS-Protection set
- [ ] Referrer-Policy set
- [ ] Permissions-Policy set
- [ ] Content-Security-Policy set

### Content Security
- [ ] No inline scripts (except allowed)
- [ ] No inline styles (except allowed)
- [ ] External resources whitelisted
- [ ] HTTPS enforced (production)

---

## 11. Build & Deployment

### Build Process
- [ ] npm run build succeeds
- [ ] No build warnings
- [ ] No console errors in production
- [ ] Source maps generated
- [ ] Assets hashed correctly

### Bundle Size
- [ ] Initial JS bundle < 500KB gzipped
- [ ] Total assets < 2MB
- [ ] Code splitting working
- [ ] Lazy loading implemented

### Deployment
- [ ] Assets cached correctly
- [ ] HTML not cached
- [ ] CDN serving assets
- [ ] HTTPS certificate valid
- [ ] Health check endpoint works

---

## 12. Lighthouse Scores

### Target Scores
- [ ] Performance: ≥ 80
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 85
- [ ] SEO: ≥ 90

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] FCP < 1.8s
- [ ] TTFB < 600ms

---

## 13. User Experience

### Loading Experience
- [ ] Loading screen displays immediately
- [ ] Loading progress indicator works
- [ ] Smooth transition to 3D scene
- [ ] No blank screens or flashes

### Interaction Feedback
- [ ] Hover states clear
- [ ] Click feedback immediate
- [ ] Loading states for async operations
- [ ] Error messages user-friendly

### Visual Polish
- [ ] No visual artifacts
- [ ] Smooth animations
- [ ] Consistent color scheme
- [ ] Typography readable
- [ ] Spacing consistent

---

## 14. Edge Cases

### Network Conditions
- [ ] Works on slow 3G
- [ ] Works on fast 3G
- [ ] Works on 4G
- [ ] Offline fallback (if applicable)

### Device Limitations
- [ ] Low memory devices handled
- [ ] Low GPU performance handled
- [ ] Old devices degrade gracefully
- [ ] No crashes on low-end devices

### User Actions
- [ ] Rapid clicking handled
- [ ] Spam keyboard input handled
- [ ] Window resize handled
- [ ] Tab visibility changes handled
- [ ] Browser back/forward works

---

## Test Execution

### Manual Testing
1. Run through each checklist item manually
2. Test on multiple devices and browsers
3. Document any failures
4. Create bug tickets for issues
5. Retest after fixes

### Automated Testing
1. Run Lighthouse CI in pipeline
2. Check Web Vitals in production
3. Monitor error tracking dashboard
4. Review analytics for anomalies

### Sign-off Criteria
- [ ] All critical items passing
- [ ] No P0 bugs
- [ ] Performance targets met
- [ ] Accessibility verified
- [ ] Security audit passed

---

**Testing Status**: ⏳ In Progress
**Last Test Run**: [Date]
**Pass Rate**: [X/Y items passing]
