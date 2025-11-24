# Device Testing Guide

Comprehensive guide for testing Cerebral Machine across devices.

**Project**: Cerebral Machine
**Last Updated**: November 2025

---

## Target Devices

### Priority Tier 1 (Critical)
Must work perfectly on these devices:

**Desktop**
- MacBook Pro 16" (2021+) - M1/M2
- Dell XPS 15 (2020+) - Intel i7/AMD Ryzen
- Windows Desktop - RTX 3060+ / AMD RX 6600+

**Mobile**
- iPhone 14 Pro / 15 Pro (iOS 16+)
- iPhone 13 / 14 (iOS 16+)
- Samsung Galaxy S22 / S23 (Android 13+)
- Google Pixel 6 / 7 (Android 13+)

**Tablets**
- iPad Pro 12.9" (2020+)
- iPad Air (2020+)
- Samsung Galaxy Tab S8+

### Priority Tier 2 (Important)
Should work well on these devices:

**Desktop**
- MacBook Air M1/M2
- Older laptops (2018-2019) - Intel i5
- Budget desktops - GTX 1060 / AMD RX 580

**Mobile**
- iPhone 11 / 12 (iOS 15+)
- Samsung Galaxy S20 / S21
- OnePlus 9 / 10
- Xiaomi Mi 11 / 12

**Tablets**
- iPad (2020+)
- Samsung Galaxy Tab S7

### Priority Tier 3 (Nice to Have)
Should degrade gracefully:

**Desktop**
- Older laptops (2016-2017) - Intel i3/i5
- Integrated graphics only

**Mobile**
- iPhone X / XS (iOS 14+)
- Budget Android (Snapdragon 600 series)
- Samsung Galaxy A-series

---

## Testing Procedure

### 1. Pre-Test Setup

**Check Device Specs**:
```bash
# On device, open browser console and run:
console.log({
  userAgent: navigator.userAgent,
  memory: navigator.deviceMemory,
  cores: navigator.hardwareConcurrency,
  screen: `${window.innerWidth}x${window.innerHeight}`,
  pixelRatio: window.devicePixelRatio,
  webgl: document.createElement('canvas').getContext('webgl') ? 'Yes' : 'No'
});
```

**Enable Debug Panel**:
- Press `D` key to toggle performance debug panel
- Monitor FPS, memory, draw calls
- Note device tier assigned (low/medium/high)

### 2. Loading Test

**Steps**:
1. Clear browser cache
2. Open application URL
3. Start timer
4. Wait for 3D scene to appear
5. Record loading time

**Expected Results**:
- **High-tier devices**: < 3 seconds
- **Medium-tier devices**: < 5 seconds
- **Low-tier devices**: < 7 seconds

**Check**:
- [ ] Loading screen displays immediately
- [ ] No blank white screen
- [ ] Progress indicator animates
- [ ] Smooth transition to 3D scene

### 3. Performance Test

**Steps**:
1. Enable debug panel (D key)
2. Let scene idle for 30 seconds
3. Record FPS metrics (current, average, min, max)
4. Scroll through all sections
5. Open each module
6. Record FPS during interactions

**Expected FPS**:
- **High-tier**: ≥ 60 FPS idle, ≥ 45 FPS interaction
- **Medium-tier**: ≥ 45 FPS idle, ≥ 30 FPS interaction
- **Low-tier**: ≥ 30 FPS idle, ≥ 20 FPS interaction

**Check**:
- [ ] FPS stable during idle
- [ ] No stuttering during scroll
- [ ] Smooth module transitions
- [ ] No frame drops on interaction

### 4. Memory Test

**Steps**:
1. Open browser DevTools → Performance Monitor
2. Record initial memory usage
3. Interact with all features for 5 minutes
4. Record final memory usage
5. Calculate memory growth

**Expected Memory**:
- **Desktop**: < 150MB initial, < 50MB growth
- **Mobile**: < 100MB initial, < 30MB growth

**Check**:
- [ ] No memory leaks
- [ ] Memory stabilizes after initial load
- [ ] No continuous growth
- [ ] Proper cleanup on module close

### 5. Interaction Test

**Steps**:
1. Test all hover interactions
2. Click each module hotspot
3. Navigate with keyboard (Tab, Arrow keys)
4. Test scroll navigation
5. Test touch gestures (mobile/tablet)

**Check**:
- [ ] Hover effects visible and smooth
- [ ] Click detection accurate
- [ ] No interaction lag
- [ ] Touch targets large enough (≥ 44px)
- [ ] No accidental activations

### 6. Visual Quality Test

**Steps**:
1. Inspect brain core materials
2. Check particle streams
3. Verify postprocessing effects
4. Test at different zoom levels
5. Check text readability

**Check**:
- [ ] No visual artifacts
- [ ] Emissive glow visible
- [ ] Bloom not over-saturated
- [ ] Particles render correctly
- [ ] Text crisp and readable

### 7. Orientation Test (Mobile/Tablet)

**Steps**:
1. Start in portrait mode
2. Test all interactions
3. Rotate to landscape
4. Test all interactions again
5. Rotate back to portrait

**Check**:
- [ ] Canvas resizes correctly
- [ ] No layout breaks
- [ ] Controls remain accessible
- [ ] Performance stable in both orientations

### 8. Network Test

**Steps**:
1. Open Chrome DevTools → Network
2. Throttle to "Slow 3G"
3. Reload page
4. Record loading behavior
5. Test with "Fast 3G"
6. Test with "4G"

**Expected**:
- **Slow 3G**: < 15 seconds to interactive
- **Fast 3G**: < 8 seconds to interactive
- **4G**: < 5 seconds to interactive

**Check**:
- [ ] Progressive loading works
- [ ] No timeout errors
- [ ] Loading states visible
- [ ] Graceful degradation

---

## Device-Specific Tests

### iPhone Testing

**Safari iOS**:
```
Settings → Safari → Advanced → Web Inspector
Connect to Mac → Safari → Develop → iPhone
```

**Test Checklist**:
- [ ] Safe area insets respected
- [ ] Home indicator not covered
- [ ] Notch/Dynamic Island not covered
- [ ] Landscape orientation works
- [ ] No audio autoplay issues
- [ ] Touch gestures work
- [ ] No iOS-specific bugs

**Common Issues**:
- iOS Safari doesn't support WebGL2 on older devices
- Touch event handling different from Android
- Memory limits stricter on iOS

### Android Testing

**Chrome Android**:
```
chrome://inspect on desktop Chrome
Enable USB debugging on Android device
```

**Test Checklist**:
- [ ] Navigation bar not covered
- [ ] Status bar color correct
- [ ] Back button behavior correct
- [ ] Share functionality works
- [ ] Chrome auto-translate doesn't break layout
- [ ] Samsung Internet compatible

**Common Issues**:
- Performance varies widely between devices
- GPU drivers can be inconsistent
- Memory management different per manufacturer

### iPad Testing

**Specific Tests**:
- [ ] Split-screen multitasking
- [ ] Slide Over works
- [ ] Pencil hover states (if applicable)
- [ ] Stage Manager compatibility
- [ ] Keyboard shortcuts work with Magic Keyboard

### Desktop Testing

**macOS**:
- [ ] Trackpad gestures work
- [ ] Retina display rendering sharp
- [ ] Mission Control doesn't break
- [ ] Full-screen mode works

**Windows**:
- [ ] High DPI scaling correct
- [ ] Multiple monitors work
- [ ] Touch screen support (if applicable)
- [ ] Windows snap works

**Linux**:
- [ ] X11/Wayland compatibility
- [ ] Hardware acceleration enabled
- [ ] Font rendering acceptable

---

## Performance Profiling

### Chrome DevTools Profiling

**Steps**:
1. Open DevTools → Performance
2. Click Record
3. Interact with application for 10 seconds
4. Stop recording
5. Analyze flame graph

**Look For**:
- Long tasks (> 50ms)
- Forced reflows/layouts
- Excessive garbage collection
- Main thread blocking

### WebGL Profiling

**Spector.js**:
```javascript
// Install Spector.js extension
// Click capture button
// Review draw calls, shaders, textures
```

**Check**:
- [ ] Draw calls < 100 per frame
- [ ] No redundant state changes
- [ ] Texture sizes appropriate
- [ ] Shader compilation cached

### Memory Profiling

**Steps**:
1. Open DevTools → Memory
2. Take heap snapshot (baseline)
3. Interact with all features
4. Take another heap snapshot
5. Compare snapshots

**Check**:
- [ ] No detached DOM nodes
- [ ] EventListeners cleaned up
- [ ] Three.js objects disposed
- [ ] No circular references

---

## Bug Reporting Template

### Report Format

```markdown
**Device**: iPhone 14 Pro, iOS 17.1
**Browser**: Safari 17.1
**Network**: 4G
**Issue**: Performance drops below 30 FPS on scroll

**Steps to Reproduce**:
1. Load application
2. Wait for scene to load
3. Scroll down rapidly
4. Observe FPS counter

**Expected**: FPS should stay above 45
**Actual**: FPS drops to 25-30

**Screenshots**: [attach]
**Video**: [attach]

**Console Errors**: None
**Performance Profile**: [attach]
```

### Severity Levels

**P0 - Critical**:
- Application doesn't load
- Crash/freeze
- Data loss
- Security issue

**P1 - High**:
- Major feature broken
- Performance below minimum target
- Accessibility blocker
- Visual corruption

**P2 - Medium**:
- Minor feature issue
- Visual glitch
- Performance below optimal
- UX friction

**P3 - Low**:
- Cosmetic issue
- Enhancement request
- Edge case
- Nice-to-have

---

## Testing Matrix

### Desktop Matrix

| Device | Chrome | Firefox | Safari | Edge | Status |
|--------|--------|---------|--------|------|--------|
| MacBook Pro M1 | [ ] | [ ] | [ ] | [ ] | |
| Windows i7 | [ ] | [ ] | N/A | [ ] | |
| Linux Ubuntu | [ ] | [ ] | N/A | [ ] | |

### Mobile Matrix

| Device | Safari | Chrome | Samsung | Firefox | Status |
|--------|--------|--------|---------|---------|--------|
| iPhone 14 Pro | [ ] | [ ] | N/A | [ ] | |
| iPhone 13 | [ ] | [ ] | N/A | [ ] | |
| Galaxy S23 | N/A | [ ] | [ ] | [ ] | |
| Pixel 7 | N/A | [ ] | N/A | [ ] | |

### Tablet Matrix

| Device | Safari | Chrome | Status |
|--------|--------|--------|--------|
| iPad Pro 12.9" | [ ] | [ ] | |
| iPad Air | [ ] | [ ] | |
| Galaxy Tab S8 | N/A | [ ] | |

---

## Automated Testing Tools

### BrowserStack / Sauce Labs

**Configuration**:
```javascript
// browserstack.config.js
export default {
  devices: [
    { device: 'iPhone 14 Pro', os_version: '16', real_mobile: true },
    { device: 'Samsung Galaxy S23', os_version: '13.0', real_mobile: true },
    { device: 'iPad Pro 12.9 2021', os_version: '16', real_mobile: true },
  ],
  browsers: [
    { browser: 'chrome', version: 'latest' },
    { browser: 'firefox', version: 'latest' },
    { browser: 'safari', version: 'latest' },
  ]
};
```

### Remote Testing

**ngrok for Mobile Testing**:
```bash
# Install ngrok
npm install -g ngrok

# Run dev server
npm run dev

# Expose to internet
ngrok http 5173

# Test on mobile device with ngrok URL
```

---

## Sign-off Checklist

- [ ] All Priority Tier 1 devices tested and passing
- [ ] All Priority Tier 2 devices tested (acceptable performance)
- [ ] All Priority Tier 3 devices degrade gracefully
- [ ] Performance targets met on all tiers
- [ ] No P0 or P1 bugs remaining
- [ ] Test results documented
- [ ] Bug reports filed for any issues
- [ ] Stakeholder approval obtained

---

**Testing Status**: ⏳ Ready to Execute
**Last Updated**: November 2025
