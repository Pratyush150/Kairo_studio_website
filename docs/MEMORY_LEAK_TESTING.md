# Memory Leak Testing Guide

Comprehensive guide for detecting and fixing memory leaks in Cerebral Machine.

**Project**: Cerebral Machine
**Last Updated**: November 2025

---

## Overview

Memory leaks in Three.js/React applications can cause:
- Gradual performance degradation
- Browser tab crashes
- Poor user experience on long sessions
- Increased memory usage over time

---

## Common Memory Leak Sources

### Three.js Related
1. **Geometries not disposed**: `geometry.dispose()`
2. **Materials not disposed**: `material.dispose()`
3. **Textures not disposed**: `texture.dispose()`
4. **Render targets not disposed**: `renderTarget.dispose()`
5. **WebGL context not cleaned up**
6. **Animation frames not canceled**

### React Related
1. **Event listeners not removed**
2. **Timers not cleared** (`setTimeout`, `setInterval`)
3. **useEffect cleanup not implemented**
4. **References held in closures**
5. **Large objects in state/context**

### General JavaScript
1. **Detached DOM nodes**
2. **Global variables not cleared**
3. **Circular references**
4. **Console.log with large objects**

---

## Testing Methodology

### 1. Chrome DevTools Memory Profiling

#### Heap Snapshot Comparison

**Steps**:
1. Open Chrome DevTools → Memory
2. Select "Heap snapshot"
3. Take baseline snapshot (Snapshot 1)
4. Interact with application for 2-3 minutes
5. Force garbage collection (🗑️ icon)
6. Take second snapshot (Snapshot 2)
7. Compare snapshots (select "Comparison" view)

**What to Look For**:
```
Objects with significant delta (increase):
- Detached HTMLElements
- Three.js objects (Geometry, Material, Texture)
- Large arrays/objects
- EventListeners
```

**Example Analysis**:
```javascript
// Good: Delta should be ~0 or small
Objects: +5 (baseline noise)
Detached HTMLElements: 0
Geometries: 0
Materials: 0

// Bad: Growing numbers
Objects: +1000
Detached HTMLElements: +50
Geometries: +10
Materials: +15
```

#### Allocation Timeline

**Steps**:
1. Open DevTools → Memory
2. Select "Allocation instrumentation on timeline"
3. Click Start
4. Interact with application
5. Click Stop after 30 seconds
6. Analyze allocation bars

**What to Look For**:
- Allocations that don't get garbage collected (tall blue bars)
- Continuous allocation without deallocation
- Retained size growing over time

#### Allocation Sampling

**Steps**:
1. Open DevTools → Memory
2. Select "Allocation sampling"
3. Click Start
4. Interact with application for 1 minute
5. Stop and analyze

**What to Look For**:
- Functions with high self-size
- Unexpected allocations in render loops
- Large array/object creations

---

### 2. Performance Monitor

**Steps**:
1. Open DevTools → Performance Monitor (Cmd+Shift+P → "Performance Monitor")
2. Monitor these metrics:
   - JS heap size
   - DOM Nodes
   - JS event listeners
   - Documents
   - Frames

**Expected Behavior**:
```
Initial Load:
- JS heap: 30-50 MB
- DOM nodes: 200-500
- Event listeners: 50-100

After 5 Minutes:
- JS heap: +10-20 MB (acceptable)
- DOM nodes: ±50 (stable)
- Event listeners: ±10 (stable)
```

**Warning Signs**:
```
After 5 Minutes:
- JS heap: +100 MB (LEAK!)
- DOM nodes: +500 (LEAK!)
- Event listeners: +200 (LEAK!)
```

---

### 3. Automated Memory Leak Detection

#### Puppeteer Script

```javascript
// scripts/detect-memory-leaks.js
import puppeteer from 'puppeteer';

async function detectLeaks() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  const samples = [];

  // Sample memory every 5 seconds for 2 minutes
  for (let i = 0; i < 24; i++) {
    const metrics = await page.metrics();
    samples.push({
      time: i * 5,
      jsHeapUsed: metrics.JSHeapUsedSize,
      jsHeapTotal: metrics.JSHeapTotalSize
    });

    // Interact with app
    await page.evaluate(() => {
      // Scroll
      window.scrollTo(0, document.body.scrollHeight);
      window.scrollTo(0, 0);

      // Open/close modules
      const modules = document.querySelectorAll('[data-module-id]');
      if (modules[0]) {
        modules[0].click();
        setTimeout(() => {
          document.querySelector('[data-close-module]')?.click();
        }, 1000);
      }
    });

    await page.waitForTimeout(5000);
  }

  await browser.close();

  // Analyze trend
  const firstSample = samples[0].jsHeapUsed;
  const lastSample = samples[samples.length - 1].jsHeapUsed;
  const growth = ((lastSample - firstSample) / firstSample) * 100;

  console.log(`Memory Growth: ${growth.toFixed(2)}%`);

  if (growth > 50) {
    console.error('⚠️ POTENTIAL MEMORY LEAK DETECTED');
    console.log('Samples:', samples);
  } else {
    console.log('✅ Memory usage acceptable');
  }
}

detectLeaks();
```

---

## Three.js Specific Testing

### Geometry Disposal Checklist

```javascript
// ✅ GOOD: Proper disposal
useEffect(() => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  return () => {
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
  };
}, []);

// ❌ BAD: No disposal
useEffect(() => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  // Missing cleanup!
}, []);
```

### Texture Disposal Checklist

```javascript
// ✅ GOOD: Texture cleanup
useEffect(() => {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/path/to/texture.jpg');

  const material = new THREE.MeshBasicMaterial({ map: texture });

  return () => {
    texture.dispose();
    material.dispose();
  };
}, []);
```

### Animation Frame Cleanup

```javascript
// ✅ GOOD: Cancel animation frame
useEffect(() => {
  let frameId;

  function animate() {
    frameId = requestAnimationFrame(animate);
    // render
  }

  animate();

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };
}, []);

// ❌ BAD: Frame continues after unmount
useEffect(() => {
  function animate() {
    requestAnimationFrame(animate);
    // render
  }

  animate();
  // Missing cleanup!
}, []);
```

---

## React Specific Testing

### Event Listener Cleanup

```javascript
// ✅ GOOD: Remove event listeners
useEffect(() => {
  const handleResize = () => {
    console.log('resize');
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ❌ BAD: Listener not removed
useEffect(() => {
  window.addEventListener('resize', () => {
    console.log('resize');
  });
  // Missing cleanup!
}, []);
```

### Timer Cleanup

```javascript
// ✅ GOOD: Clear timers
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);

// ❌ BAD: Timer continues
useEffect(() => {
  setInterval(() => {
    console.log('tick');
  }, 1000);
  // Missing cleanup!
}, []);
```

### Ref Cleanup

```javascript
// ✅ GOOD: Clear refs
const divRef = useRef(null);

useEffect(() => {
  return () => {
    divRef.current = null; // Clear reference
  };
}, []);
```

---

## Testing Scenarios

### Scenario 1: Module Open/Close Loop

**Test**:
```javascript
// Repeat 50 times:
1. Open module
2. Wait 1 second
3. Close module
4. Wait 1 second

// Expected: Memory returns to baseline ±10MB
// Actual: [Record result]
```

**How to Test**:
1. Open Chrome DevTools → Performance Monitor
2. Record initial JS heap size
3. Execute loop (manual or automated)
4. Record final JS heap size
5. Calculate growth

**Pass Criteria**:
- Memory growth < 30%
- Final memory within 20MB of baseline after garbage collection

### Scenario 2: Scroll Loop

**Test**:
```javascript
// Repeat 100 times:
1. Scroll to bottom
2. Wait 500ms
3. Scroll to top
4. Wait 500ms

// Expected: Memory stable ±5MB
```

### Scenario 3: Long Session

**Test**:
```javascript
// Run for 10 minutes:
- Random scrolling
- Random module opens/closes
- Random interactions

// Expected: Memory < +50MB from baseline
```

---

## Debugging Memory Leaks

### Finding the Source

1. **Take heap snapshots at different stages**
2. **Filter by constructor name** (e.g., "Geometry", "Material", "Texture")
3. **Check retainers** (what's keeping the object alive)
4. **Look for detached DOM nodes**
5. **Search for event listeners**

### Common Patterns

#### Pattern 1: Detached DOM Nodes

```javascript
// Find in heap snapshot:
Detached HTMLDivElement

// Retainer chain shows:
- Closure (someFunction)
- Context

// Solution: Remove reference or clean up closure
```

#### Pattern 2: Three.js Objects

```javascript
// Find in heap snapshot:
BoxGeometry
MeshBasicMaterial

// Retainer chain shows:
- Mesh
- Scene (but mesh was "removed")

// Solution: Call dispose() on geometry and material
```

#### Pattern 3: Event Listeners

```javascript
// Find in heap snapshot:
EventListener (resize)

// Retainer chain shows:
- Window
- EventTarget

// Solution: removeEventListener in cleanup
```

---

## Automated Testing Script

### Memory Leak Test Suite

```javascript
// tests/memory-leaks.test.js
import { test, expect } from '@playwright/test';

test.describe('Memory Leak Tests', () => {
  test('should not leak memory on module open/close', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    // Get baseline
    const baseline = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });

    // Open/close modules 20 times
    for (let i = 0; i < 20; i++) {
      await page.click('[data-module-id="saas"]');
      await page.waitForTimeout(1000);
      await page.click('[data-close-module]');
      await page.waitForTimeout(500);
    }

    // Force GC (if available)
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });

    await page.waitForTimeout(2000);

    // Get final memory
    const final = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });

    const growth = ((final - baseline) / baseline) * 100;
    expect(growth).toBeLessThan(50); // Less than 50% growth
  });

  test('should not accumulate DOM nodes', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const initialNodes = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // Navigate and interact
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    }

    const finalNodes = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    const growth = finalNodes - initialNodes;
    expect(growth).toBeLessThan(100); // Less than 100 new nodes
  });
});
```

---

## Performance Budget

### Memory Budgets

| Phase | Desktop | Mobile | Status |
|-------|---------|--------|--------|
| Initial Load | < 80MB | < 50MB | [ ] |
| After 1 Minute | < 100MB | < 70MB | [ ] |
| After 5 Minutes | < 130MB | < 90MB | [ ] |
| After 10 Minutes | < 150MB | < 100MB | [ ] |

### Growth Rate Limits

- **Per Minute**: < 5MB average
- **Per Interaction**: < 1MB per module open/close
- **Recovery**: Memory should return to within 20MB of baseline after GC

---

## Tools & Resources

### Browser DevTools
- **Chrome DevTools Memory Profiler**
- **Firefox Memory Tool**
- **Safari Web Inspector**

### Libraries
- **@memlab/core** - Meta's memory leak detector
- **puppeteer** - Automated testing
- **playwright** - Cross-browser testing

### Commands

```bash
# Run Chrome with memory flags
google-chrome --enable-precise-memory-info --js-flags="--expose-gc"

# Run Node with memory profiling
node --expose-gc --inspect script.js

# Generate heap snapshot
node --heap-prof script.js
```

---

## Sign-off Checklist

- [ ] No memory leaks detected in 10-minute test
- [ ] All Three.js objects properly disposed
- [ ] All event listeners cleaned up
- [ ] All timers cleared
- [ ] Memory growth < 50% after repeated interactions
- [ ] No detached DOM nodes accumulating
- [ ] Performance budget met
- [ ] Automated tests passing

---

**Testing Status**: ⏳ Ready to Execute
**Last Updated**: November 2025
