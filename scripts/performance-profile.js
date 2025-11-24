#!/usr/bin/env node

/**
 * Performance Profiling Script
 *
 * Automated performance testing and profiling for Cerebral Machine.
 * Uses Puppeteer to profile the application and generate performance reports.
 *
 * Usage:
 *   node scripts/performance-profile.js
 *   node scripts/performance-profile.js --url=http://localhost:5173
 *   node scripts/performance-profile.js --device=mobile
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:5173',
  device: process.argv.find(arg => arg.startsWith('--device='))?.split('=')[1] || 'desktop',
  outputDir: path.join(__dirname, '..', 'performance-reports'),
  iterations: 3,
  timeout: 60000
};

// Device configurations
const devices = {
  desktop: {
    name: 'Desktop',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  mobile: {
    name: 'Mobile',
    viewport: { width: 375, height: 667, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  },
  tablet: {
    name: 'Tablet',
    viewport: { width: 768, height: 1024, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  }
};

class PerformanceProfiler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      device: config.device,
      timestamp: new Date().toISOString(),
      url: config.url,
      metrics: [],
      fps: [],
      memory: [],
      lighthouse: null,
      summary: {}
    };
  }

  async init() {
    console.log('🚀 Launching browser...');

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();

    // Set device viewport
    const device = devices[config.device];
    await this.page.setViewport(device.viewport);
    await this.page.setUserAgent(device.userAgent);

    console.log(`📱 Device: ${device.name}`);
    console.log(`🌐 URL: ${config.url}`);
  }

  async profilePageLoad() {
    console.log('\n📊 Profiling page load...');

    const metrics = [];

    for (let i = 0; i < config.iterations; i++) {
      console.log(`  Iteration ${i + 1}/${config.iterations}`);

      // Navigate and collect metrics
      await this.page.goto(config.url, { waitUntil: 'networkidle0' });

      // Get performance metrics
      const performanceMetrics = await this.page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const paintData = performance.getEntriesByType('paint');

        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstPaint: paintData.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintData.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          domInteractive: perfData.domInteractive,
          domComplete: perfData.domComplete
        };
      });

      metrics.push(performanceMetrics);

      // Wait before next iteration
      if (i < config.iterations - 1) {
        await this.page.waitForTimeout(2000);
      }
    }

    this.results.metrics = metrics;
    this.calculateAverageMetrics();
  }

  async profileFPS() {
    console.log('\n🎮 Profiling FPS...');

    await this.page.goto(config.url, { waitUntil: 'networkidle0' });

    // Wait for 3D scene to initialize
    await this.page.waitForTimeout(3000);

    // Measure FPS for 10 seconds
    const fpsData = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const samples = [];
        let lastTime = performance.now();
        let frameCount = 0;
        const duration = 10000; // 10 seconds
        const startTime = performance.now();

        function measureFPS() {
          frameCount++;
          const currentTime = performance.now();
          const elapsed = currentTime - startTime;

          // Sample every second
          if (frameCount % 60 === 0) {
            const fps = (frameCount * 1000) / (currentTime - lastTime);
            samples.push({ time: elapsed, fps });
          }

          if (elapsed < duration) {
            requestAnimationFrame(measureFPS);
          } else {
            const avgFPS = (frameCount * 1000) / duration;
            resolve({
              average: avgFPS,
              samples,
              min: Math.min(...samples.map(s => s.fps)),
              max: Math.max(...samples.map(s => s.fps))
            });
          }
        }

        requestAnimationFrame(measureFPS);
      });
    });

    this.results.fps = fpsData;
    console.log(`  Average FPS: ${fpsData.average.toFixed(2)}`);
    console.log(`  Min FPS: ${fpsData.min.toFixed(2)}`);
    console.log(`  Max FPS: ${fpsData.max.toFixed(2)}`);
  }

  async profileMemory() {
    console.log('\n💾 Profiling memory usage...');

    await this.page.goto(config.url, { waitUntil: 'networkidle0' });

    // Wait for scene to load
    await this.page.waitForTimeout(3000);

    const memoryData = [];

    // Sample memory every 2 seconds for 20 seconds
    for (let i = 0; i < 10; i++) {
      const memory = await this.page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memory) {
        memoryData.push({
          time: i * 2,
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize
        });
      }

      await this.page.waitForTimeout(2000);
    }

    this.results.memory = memoryData;

    if (memoryData.length > 0) {
      const avgUsed = memoryData.reduce((sum, m) => sum + m.used, 0) / memoryData.length;
      console.log(`  Average Memory Used: ${(avgUsed / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  async profileInteraction() {
    console.log('\n🖱️  Profiling interactions...');

    await this.page.goto(config.url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);

    // Test scroll performance
    console.log('  Testing scroll...');
    const scrollStart = Date.now();
    await this.page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    await this.page.waitForTimeout(2000);
    const scrollDuration = Date.now() - scrollStart;

    // Test module click
    console.log('  Testing module interaction...');
    const clickStart = Date.now();
    try {
      // Try to click a module hotspot (adjust selector as needed)
      await this.page.click('[data-module-id]', { timeout: 5000 });
      await this.page.waitForTimeout(1500); // Wait for animation
    } catch (e) {
      console.log('  ⚠️  Module click test skipped (element not found)');
    }
    const clickDuration = Date.now() - clickStart;

    this.results.interaction = {
      scrollDuration,
      clickDuration
    };
  }

  async profileWebVitals() {
    console.log('\n🎯 Collecting Web Vitals...');

    await this.page.goto(config.url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(5000);

    const webVitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};

        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // FID (can't measure in headless, skip)
        vitals.fid = 'N/A (requires user interaction)';

        // CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        // FCP
        const paintEntries = performance.getEntriesByType('paint');
        vitals.fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

        // TTFB
        const navEntry = performance.getEntriesByType('navigation')[0];
        vitals.ttfb = navEntry.responseStart - navEntry.requestStart;

        setTimeout(() => resolve(vitals), 2000);
      });
    });

    this.results.webVitals = webVitals;

    console.log(`  LCP: ${webVitals.lcp?.toFixed(2) || 'N/A'} ms`);
    console.log(`  FCP: ${webVitals.fcp?.toFixed(2) || 'N/A'} ms`);
    console.log(`  CLS: ${webVitals.cls?.toFixed(3) || 'N/A'}`);
    console.log(`  TTFB: ${webVitals.ttfb?.toFixed(2) || 'N/A'} ms`);
  }

  calculateAverageMetrics() {
    const metrics = this.results.metrics;
    const avg = {};

    for (const key in metrics[0]) {
      const values = metrics.map(m => m[key]);
      avg[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    this.results.summary = avg;

    console.log('\n📈 Average Metrics:');
    console.log(`  DOM Content Loaded: ${avg.domContentLoaded.toFixed(2)} ms`);
    console.log(`  Load Complete: ${avg.loadComplete.toFixed(2)} ms`);
    console.log(`  First Paint: ${avg.firstPaint.toFixed(2)} ms`);
    console.log(`  First Contentful Paint: ${avg.firstContentfulPaint.toFixed(2)} ms`);
  }

  async generateReport() {
    console.log('\n📝 Generating report...');

    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Save JSON report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(config.outputDir, `performance-${config.device}-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport();
    const mdPath = path.join(config.outputDir, `performance-${config.device}-${timestamp}.md`);
    fs.writeFileSync(mdPath, markdownReport);

    console.log(`\n✅ Reports generated:`);
    console.log(`  📄 ${jsonPath}`);
    console.log(`  📄 ${mdPath}`);
  }

  generateMarkdownReport() {
    const { summary, fps, memory, webVitals, interaction } = this.results;

    return `# Performance Profile Report

**Device**: ${devices[config.device].name}
**Date**: ${new Date(this.results.timestamp).toLocaleString()}
**URL**: ${config.url}

---

## Summary

### Page Load Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| DOM Content Loaded | ${summary.domContentLoaded?.toFixed(2)} ms | < 1000 ms | ${summary.domContentLoaded < 1000 ? '✅' : '⚠️'} |
| Load Complete | ${summary.loadComplete?.toFixed(2)} ms | < 3000 ms | ${summary.loadComplete < 3000 ? '✅' : '⚠️'} |
| First Paint | ${summary.firstPaint?.toFixed(2)} ms | < 1500 ms | ${summary.firstPaint < 1500 ? '✅' : '⚠️'} |
| First Contentful Paint | ${summary.firstContentfulPaint?.toFixed(2)} ms | < 1800 ms | ${summary.firstContentfulPaint < 1800 ? '✅' : '⚠️'} |

### FPS Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average FPS | ${fps.average?.toFixed(2)} | ≥ 30 | ${fps.average >= 30 ? '✅' : '⚠️'} |
| Min FPS | ${fps.min?.toFixed(2)} | ≥ 20 | ${fps.min >= 20 ? '✅' : '⚠️'} |
| Max FPS | ${fps.max?.toFixed(2)} | - | ✅ |

### Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | ${webVitals?.lcp?.toFixed(2) || 'N/A'} ms | < 2500 ms | ${webVitals?.lcp < 2500 ? '✅' : '⚠️'} |
| FCP | ${webVitals?.fcp?.toFixed(2) || 'N/A'} ms | < 1800 ms | ${webVitals?.fcp < 1800 ? '✅' : '⚠️'} |
| CLS | ${webVitals?.cls?.toFixed(3) || 'N/A'} | < 0.1 | ${webVitals?.cls < 0.1 ? '✅' : '⚠️'} |
| TTFB | ${webVitals?.ttfb?.toFixed(2) || 'N/A'} ms | < 600 ms | ${webVitals?.ttfb < 600 ? '✅' : '⚠️'} |

### Memory Usage

${memory.length > 0 ? `
| Metric | Value |
|--------|-------|
| Average Used | ${(memory.reduce((sum, m) => sum + m.used, 0) / memory.length / 1024 / 1024).toFixed(2)} MB |
| Peak Used | ${(Math.max(...memory.map(m => m.used)) / 1024 / 1024).toFixed(2)} MB |
` : 'Memory metrics not available'}

### Interaction Performance

${interaction ? `
| Action | Duration |
|--------|----------|
| Scroll | ${interaction.scrollDuration} ms |
| Module Click | ${interaction.clickDuration} ms |
` : 'Interaction metrics not available'}

---

## Recommendations

${this.generateRecommendations()}

---

**Generated**: ${new Date().toLocaleString()}
`;
  }

  generateRecommendations() {
    const recommendations = [];
    const { summary, fps, webVitals } = this.results;

    if (summary.firstContentfulPaint > 1800) {
      recommendations.push('- ⚠️ FCP is above target. Consider optimizing critical render path.');
    }

    if (fps.average < 30) {
      recommendations.push('- ⚠️ Average FPS is below target. Reduce particle count or LOD complexity.');
    }

    if (fps.min < 20) {
      recommendations.push('- ⚠️ Min FPS drops below acceptable threshold. Profile and optimize render loop.');
    }

    if (webVitals?.lcp > 2500) {
      recommendations.push('- ⚠️ LCP exceeds target. Optimize largest content element loading.');
    }

    if (webVitals?.cls > 0.1) {
      recommendations.push('- ⚠️ CLS is high. Stabilize layout during loading.');
    }

    if (recommendations.length === 0) {
      return '✅ All metrics within acceptable ranges!';
    }

    return recommendations.join('\n');
  }

  async run() {
    try {
      await this.init();
      await this.profilePageLoad();
      await this.profileFPS();
      await this.profileMemory();
      await this.profileInteraction();
      await this.profileWebVitals();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Error during profiling:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run profiler
console.log('🔍 Performance Profiler\n');
console.log('━'.repeat(50));

const profiler = new PerformanceProfiler();

profiler.run()
  .then(() => {
    console.log('\n✨ Profiling complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Profiling failed:', error);
    process.exit(1);
  });
