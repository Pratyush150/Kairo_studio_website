# Cross-Browser Testing Checklist

Comprehensive browser compatibility testing for Cerebral Machine.

**Project**: Cerebral Machine
**Last Updated**: November 2025

---

## Browser Support Matrix

### Officially Supported

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| Chrome | Latest 2 | P0 | [ ] |
| Firefox | Latest 2 | P0 | [ ] |
| Safari | Latest 2 | P0 | [ ] |
| Edge | Latest 2 | P0 | [ ] |
| Safari iOS | Latest 2 | P0 | [ ] |
| Chrome Android | Latest 2 | P0 | [ ] |
| Samsung Internet | Latest | P1 | [ ] |
| Firefox Mobile | Latest | P1 | [ ] |

### Best Effort Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest 3-4 | [ ] |
| Firefox | Latest 3-4 | [ ] |
| Safari | Latest 3-4 | [ ] |
| Opera | Latest | [ ] |
| Brave | Latest | [ ] |
| Vivaldi | Latest | [ ] |

---

## Chrome Testing

### Chrome Desktop (Latest)

**Version**: [Fill in]
**OS**: Windows / macOS / Linux

**Feature Tests**:
- [ ] WebGL2 support detected
- [ ] Hardware acceleration enabled
- [ ] 3D scene renders correctly
- [ ] Particle systems animate smoothly
- [ ] Module hotspots interactive
- [ ] Scroll navigation works
- [ ] Keyboard shortcuts work
- [ ] Debug panel toggles (D key)
- [ ] Analytics dashboard toggles (A key)

**Performance Tests**:
- [ ] FPS ≥ 60 (high-tier device)
- [ ] No console errors
- [ ] No console warnings
- [ ] Memory stable over 5 minutes
- [ ] Smooth animations

**DevTools Check**:
```javascript
// Run in console
console.log({
  webgl: !!document.createElement('canvas').getContext('webgl'),
  webgl2: !!document.createElement('canvas').getContext('webgl2'),
  hardwareAcceleration: 'check chrome://gpu'
});
```

**Known Issues**: [Document any]

---

## Firefox Testing

### Firefox Desktop (Latest)

**Version**: [Fill in]
**OS**: Windows / macOS / Linux

**Feature Tests**:
- [ ] WebGL2 support detected
- [ ] 3D scene renders correctly
- [ ] Shader compilation successful
- [ ] Particle systems render
- [ ] Module interactions work
- [ ] Scroll performance acceptable
- [ ] Keyboard navigation works

**Performance Tests**:
- [ ] FPS acceptable (may be 10-15% lower than Chrome)
- [ ] No console errors
- [ ] Memory usage comparable to Chrome
- [ ] No Firefox-specific warnings

**Firefox-Specific Checks**:
- [ ] about:config → webgl.force-enabled (if needed)
- [ ] about:support → Graphics → WebGL status
- [ ] No mixed content warnings
- [ ] Download performance acceptable

**Known Issues**:
- Firefox may have slightly lower WebGL performance than Chrome
- Some postprocessing effects may render differently
- Font rendering may differ slightly

---

## Safari Testing

### Safari macOS (Latest)

**Version**: [Fill in]
**OS**: macOS [version]

**Feature Tests**:
- [ ] WebGL support detected (WebGL2 may not be available)
- [ ] Fallback to WebGL1 graceful
- [ ] 3D scene renders correctly
- [ ] Module interactions work
- [ ] Scroll smooth (momentum scrolling)
- [ ] Touch bar support (if applicable)

**Performance Tests**:
- [ ] FPS acceptable
- [ ] No Safari-specific console errors
- [ ] Memory usage acceptable
- [ ] Battery impact reasonable

**Safari-Specific Checks**:
- [ ] Develop menu → Show Web Inspector
- [ ] Graphics → WebGL status
- [ ] No CORS issues with assets
- [ ] localStorage works
- [ ] Cache API available

**Known Issues**:
- Safari doesn't fully support WebGL2 on older macOS versions
- Some ES2021+ features may need polyfills
- Private browsing mode limitations

### Safari iOS (Latest)

**Version**: [Fill in]
**Device**: iPhone [model], iOS [version]

**Feature Tests**:
- [ ] WebGL support detected
- [ ] Touch interactions work
- [ ] Pinch-to-zoom disabled on canvas
- [ ] Safe area respected
- [ ] Home indicator not obscured
- [ ] Orientation changes handled

**Performance Tests**:
- [ ] FPS ≥ 30 (mobile tier)
- [ ] No thermal throttling
- [ ] Battery drain acceptable
- [ ] Memory usage < 100MB

**iOS-Specific Checks**:
- [ ] Works in portrait mode
- [ ] Works in landscape mode
- [ ] No audio autoplay warnings
- [ ] Add to Home Screen works
- [ ] Standalone mode (if PWA)

**Known Issues**:
- iOS Safari has stricter memory limits
- WebGL context may be lost on background
- Touch events handled differently

---

## Edge Testing

### Edge Desktop (Latest)

**Version**: [Fill in]
**OS**: Windows [version]

**Feature Tests**:
- [ ] WebGL2 support detected
- [ ] 3D scene renders correctly
- [ ] All interactions work
- [ ] Performance comparable to Chrome
- [ ] IE mode not required

**Edge-Specific Checks**:
- [ ] Edge DevTools work correctly
- [ ] Collections feature doesn't interfere
- [ ] Vertical tabs don't break layout
- [ ] Reading mode not triggered

**Known Issues**: [Document any]

---

## Mobile Browser Testing

### Chrome Android

**Version**: [Fill in]
**Device**: [model], Android [version]

**Feature Tests**:
- [ ] WebGL support detected
- [ ] Touch interactions responsive
- [ ] Scroll performance smooth
- [ ] No layout shifts
- [ ] Text readable without zoom

**Android-Specific Checks**:
- [ ] Back button behavior correct
- [ ] Chrome flags not required
- [ ] Data Saver mode handled
- [ ] Translate feature doesn't break layout

### Samsung Internet

**Version**: [Fill in]
**Device**: Samsung [model]

**Feature Tests**:
- [ ] All core features work
- [ ] Performance acceptable
- [ ] Samsung-specific features don't interfere

**Samsung-Specific Checks**:
- [ ] High contrast mode works
- [ ] Dark mode toggle works
- [ ] Secret mode works
- [ ] Ad blocker doesn't break functionality

### Firefox Mobile

**Version**: [Fill in]
**Device**: [model]

**Feature Tests**:
- [ ] WebGL works
- [ ] Touch interactions work
- [ ] Performance acceptable

---

## Browser-Specific Feature Detection

### WebGL Detection Script

```javascript
// Add to test page
function detectBrowserCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const gl2 = canvas.getContext('webgl2');

  return {
    webgl: !!gl,
    webgl2: !!gl2,
    maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
    vendor: gl ? gl.getParameter(gl.VENDOR) : 'Unknown',
    renderer: gl ? gl.getParameter(gl.RENDERER) : 'Unknown',
    version: gl ? gl.getParameter(gl.VERSION) : 'Unknown'
  };
}

console.table(detectBrowserCapabilities());
```

### Browser API Support

```javascript
// Check required APIs
const apiSupport = {
  WebGL: !!window.WebGLRenderingContext,
  WebGL2: !!window.WebGL2RenderingContext,
  RequestAnimationFrame: !!window.requestAnimationFrame,
  IntersectionObserver: !!window.IntersectionObserver,
  PerformanceObserver: !!window.PerformanceObserver,
  ResizeObserver: !!window.ResizeObserver,
  LocalStorage: !!window.localStorage,
  SessionStorage: !!window.sessionStorage,
  IndexedDB: !!window.indexedDB,
  ServiceWorker: 'serviceWorker' in navigator,
  DeviceMemory: 'deviceMemory' in navigator,
  HardwareConcurrency: 'hardwareConcurrency' in navigator
};

console.table(apiSupport);
```

---

## CSS Feature Testing

### Required CSS Features

- [ ] CSS Grid Layout
- [ ] CSS Flexbox
- [ ] CSS Custom Properties (Variables)
- [ ] CSS Transforms 3D
- [ ] CSS Animations
- [ ] CSS Transitions
- [ ] Media Queries Level 4
- [ ] prefers-reduced-motion
- [ ] prefers-color-scheme

### CSS Detection Script

```javascript
// Check CSS support
const cssSupport = {
  grid: CSS.supports('display', 'grid'),
  flexbox: CSS.supports('display', 'flex'),
  customProperties: CSS.supports('--custom', 'value'),
  transforms3d: CSS.supports('transform', 'translate3d(0, 0, 0)'),
  animations: CSS.supports('animation', 'name'),
  backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)')
};

console.table(cssSupport);
```

---

## JavaScript Feature Testing

### Required ES Features

- [ ] ES2020+ (Optional Chaining, Nullish Coalescing)
- [ ] ES2019 (Array.flat, Object.fromEntries)
- [ ] ES2018 (Async Iteration, Promise.finally)
- [ ] ES2017 (Async/Await)
- [ ] ES2015 (Classes, Arrow Functions, Promises)

### Polyfill Check

```javascript
// Check if polyfills needed
const jsFeatures = {
  optionalChaining: (() => { try { eval('let x = {}; x?.y'); return true; } catch { return false; } })(),
  nullishCoalescing: (() => { try { eval('let x = null ?? "default"'); return true; } catch { return false; } })(),
  bigInt: typeof BigInt !== 'undefined',
  asyncAwait: (() => { try { eval('(async () => {})'); return true; } catch { return false; } })(),
  promises: typeof Promise !== 'undefined',
  modules: 'noModule' in document.createElement('script')
};

console.table(jsFeatures);
```

---

## Console Error Checking

### Zero Errors Policy

**Each browser should have**:
- [ ] 0 JavaScript errors
- [ ] 0 WebGL errors
- [ ] 0 Network errors (except expected 404s)
- [ ] 0 CORS errors
- [ ] 0 Mixed content warnings

### Common Errors to Check

```javascript
// Monitor console errors
window.addEventListener('error', (e) => {
  console.error('Global Error:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise:', e.reason);
});

// WebGL context loss
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  console.error('WebGL context lost');
});
```

---

## Performance Comparison

### Expected Performance by Browser

| Browser | Desktop FPS | Mobile FPS | Notes |
|---------|-------------|------------|-------|
| Chrome | 60 | 45 | Best WebGL performance |
| Firefox | 55 | 40 | Slightly lower, acceptable |
| Safari | 55 | 40 | WebGL1 fallback may be needed |
| Edge | 60 | 45 | Chromium-based, same as Chrome |

### Memory Usage by Browser

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ~120MB | ~80MB | Baseline |
| Firefox | ~130MB | ~85MB | Slightly higher |
| Safari | ~110MB | ~75MB | More efficient |
| Edge | ~120MB | ~80MB | Same as Chrome |

---

## Testing Tools

### Cross-Browser Testing Services

**BrowserStack**:
```bash
# Run live testing
# https://www.browserstack.com/

# Test on real devices
# Screenshots and videos available
```

**Sauce Labs**:
```bash
# Automated testing
# https://saucelabs.com/

# Parallel testing across browsers
```

**LambdaTest**:
```bash
# Live interactive testing
# https://www.lambdatest.com/

# Screenshot testing
```

### Local Testing Setup

**Multiple Browser Installation**:
```bash
# macOS
brew install --cask google-chrome
brew install --cask firefox
brew install --cask microsoft-edge

# Check Safari (pre-installed)
```

**Browser Profiles for Testing**:
- Create separate profiles for clean testing
- Disable extensions
- Use private/incognito mode
- Clear cache between tests

---

## Automated Browser Tests

### Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

### Browser Test Script

```javascript
// tests/browser-compat.spec.js
import { test, expect } from '@playwright/test';

test.describe('Browser Compatibility', () => {
  test('should load 3D scene', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for canvas to render
    await page.waitForSelector('canvas');

    // Check for no console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.waitForTimeout(5000);
    expect(errors).toHaveLength(0);
  });

  test('should have acceptable FPS', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastTime = performance.now();
        let frames = 0;

        function checkFPS() {
          frames++;
          const currentTime = performance.now();

          if (frames >= 60) {
            const fps = (frames * 1000) / (currentTime - lastTime);
            resolve(fps);
          } else {
            requestAnimationFrame(checkFPS);
          }
        }

        requestAnimationFrame(checkFPS);
      });
    });

    expect(fps).toBeGreaterThan(30);
  });
});
```

---

## Browser Bug Reporting

### Template

```markdown
**Browser**: Chrome 120 / Firefox 121 / Safari 17
**OS**: macOS 14.1 / Windows 11 / iOS 17
**Device**: MacBook Pro M1 / Desktop / iPhone 14

**Issue**: [Brief description]

**Reproduction**:
1. Open [URL]
2. [Action]
3. [Observe result]

**Expected**: [What should happen]
**Actual**: [What actually happens]

**Console Errors**: [Paste any]
**Screenshot**: [Attach]

**Browser Info**:
- User Agent: [navigator.userAgent]
- WebGL: [Yes/No]
- WebGL2: [Yes/No]
```

---

## Sign-off Checklist

- [ ] All P0 browsers tested and passing
- [ ] All P1 browsers tested and acceptable
- [ ] No console errors in any browser
- [ ] Performance targets met in all browsers
- [ ] Feature parity across browsers
- [ ] Known issues documented
- [ ] Workarounds implemented where needed
- [ ] Stakeholder approval obtained

---

**Testing Status**: ⏳ Ready to Execute
**Last Updated**: November 2025
