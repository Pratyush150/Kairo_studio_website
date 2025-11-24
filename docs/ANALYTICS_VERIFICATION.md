# Analytics Verification Checklist

Pre-launch analytics verification and validation guide.

**Project**: Cerebral Machine
**Last Updated**: November 2025
**Phase**: 14 - Polish & Launch

---

## 1. Analytics Setup Verification

### Google Analytics 4 (GA4)
- [ ] GA4 property created
- [ ] Measurement ID added to environment variables
- [ ] gtag.js script loaded correctly
- [ ] Data stream configured
- [ ] Enhanced measurement enabled
- [ ] Debug mode tested
- [ ] Real-time reports showing data

**Verification**:
```javascript
// Check GA4 in console
console.log('GA4 Measurement ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);

// Check if gtag is loaded
if (typeof gtag !== 'undefined') {
  console.log('✅ GA4 loaded');
} else {
  console.error('❌ GA4 not loaded');
}
```

### Alternative Analytics (if applicable)
- [ ] Plausible/Fathom/Simple Analytics configured
- [ ] Domain verified
- [ ] Script loaded
- [ ] Events tracking

---

## 2. Event Tracking Verification

### Page Views
- [ ] Page view event fires on load
- [ ] Page title tracked
- [ ] URL tracked
- [ ] Referrer tracked
- [ ] No duplicate page views

**Test**:
```javascript
// Navigate to page and check Network tab
// Look for collect?v=2 requests to www.google-analytics.com
```

### Module Interactions
- [ ] Module view tracked (`module_view`)
- [ ] Module ID captured
- [ ] View duration tracked
- [ ] Module close tracked

**Test**:
1. Click each module (SaaS, Automation, Integration)
2. Check GA4 DebugView for `module_view` events
3. Wait 5+ seconds
4. Close module
5. Check for duration tracking

### Scroll Tracking
- [ ] Scroll progress tracked
- [ ] Section changes tracked
- [ ] Scroll depth percentages (25%, 50%, 75%, 100%)

**Test**:
1. Scroll through entire page
2. Check DebugView for scroll events
3. Verify section IDs captured

### Engagement Tracking
- [ ] Session start tracked
- [ ] Engagement time tracked
- [ ] User interactions tracked
- [ ] Session end tracked

---

## 3. Web Vitals Tracking

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) tracked
- [ ] FID (First Input Delay) tracked
- [ ] CLS (Cumulative Layout Shift) tracked
- [ ] FCP (First Contentful Paint) tracked
- [ ] TTFB (Time to First Byte) tracked

**Test**:
```javascript
// Open console after page load
// Check for web vitals events in GA4 DebugView
// Should see events with metric values and ratings
```

**Expected Events**:
- `web_vitals_lcp`
- `web_vitals_fid`
- `web_vitals_cls`
- `web_vitals_fcp`
- `web_vitals_ttfb`

---

## 4. Custom Event Verification

### Conversion Events
- [ ] Contact form submission (if applicable)
- [ ] CTA clicks
- [ ] External link clicks
- [ ] File downloads (if applicable)

### 3D Interaction Events
- [ ] Camera interactions
- [ ] Hotspot hovers
- [ ] Module clicks
- [ ] Navigation interactions

### Error Events
- [ ] JavaScript errors tracked
- [ ] API errors tracked
- [ ] 404 errors tracked
- [ ] WebGL context loss tracked

**Test**:
```javascript
// Trigger an error intentionally
throw new Error('Test error for analytics');

// Check GA4 for error event
```

---

## 5. User Properties

### Device Info
- [ ] Device category (mobile/tablet/desktop)
- [ ] Device tier (low/medium/high)
- [ ] Screen resolution
- [ ] Viewport size

### Performance Properties
- [ ] FPS tier
- [ ] Memory available
- [ ] WebGL version
- [ ] Browser capabilities

### User Preferences
- [ ] Reduced motion preference
- [ ] 3D enabled/disabled
- [ ] Preferred language

---

## 6. E-commerce Tracking (if applicable)

### Product Views
- [ ] Module as "product"
- [ ] Product impressions
- [ ] Product clicks

### Conversions
- [ ] Add to cart (if applicable)
- [ ] Checkout (if applicable)
- [ ] Purchase (if applicable)

---

## 7. Campaign Tracking

### UTM Parameters
- [ ] utm_source captured
- [ ] utm_medium captured
- [ ] utm_campaign captured
- [ ] utm_content captured
- [ ] utm_term captured

**Test URL**:
```
http://localhost:5173/?utm_source=test&utm_medium=email&utm_campaign=launch
```

### Referrers
- [ ] Direct traffic tracked
- [ ] Organic search tracked
- [ ] Social media tracked
- [ ] Email tracked
- [ ] Paid ads tracked

---

## 8. Privacy & Compliance

### Cookie Consent
- [ ] Cookie banner present (if required)
- [ ] Consent tracked
- [ ] Analytics disabled if consent denied
- [ ] Opt-out mechanism works

### Do Not Track (DNT)
- [ ] DNT header respected
- [ ] Analytics disabled if DNT=1
- [ ] User notification shown

**Test**:
```javascript
// Check DNT respect
console.log('DNT:', navigator.doNotTrack);
// Analytics should be disabled if DNT = '1'
```

### Data Retention
- [ ] Data retention policy set
- [ ] PII not collected
- [ ] IP anonymization enabled (if required)
- [ ] User ID hashed (if used)

---

## 9. Analytics Dashboard Verification

### GA4 Reports
- [ ] Real-time report working
- [ ] User demographics visible (after 24hr)
- [ ] Acquisition reports configured
- [ ] Engagement reports showing data
- [ ] Monetization (if applicable)

### Custom Reports
- [ ] Module engagement report
- [ ] 3D interaction report
- [ ] Performance metrics report
- [ ] Conversion funnel (if applicable)

### Explorations
- [ ] User journey exploration
- [ ] Funnel exploration (if applicable)
- [ ] Path exploration
- [ ] Segment overlap

---

## 10. Error Tracking Integration

### Sentry (if configured)
- [ ] DSN configured
- [ ] Environment set (production/staging)
- [ ] Error events sent to Sentry
- [ ] Source maps uploaded
- [ ] Breadcrumbs captured
- [ ] User context attached

**Test**:
```javascript
// Trigger test error
import * as Sentry from '@sentry/browser';
Sentry.captureException(new Error('Test error'));
```

### Error Analytics
- [ ] Errors tracked in GA4
- [ ] Error type captured
- [ ] Error message captured
- [ ] Stack trace sent to Sentry
- [ ] User actions before error captured

---

## 11. Performance Analytics

### FPS Tracking
- [ ] Average FPS tracked
- [ ] Min FPS tracked
- [ ] FPS tier tracked
- [ ] Frame drops counted

### Memory Tracking
- [ ] Initial memory tracked
- [ ] Peak memory tracked
- [ ] Memory leaks detected
- [ ] Memory tier tracked

### Load Times
- [ ] Page load time tracked
- [ ] Module load times tracked
- [ ] Asset load times tracked
- [ ] 3D scene init time tracked

---

## 12. Mobile Analytics

### Mobile-Specific Events
- [ ] Touch events tracked
- [ ] Orientation changes tracked
- [ ] Mobile navigation tracked
- [ ] Mobile gestures tracked

### Mobile Performance
- [ ] Mobile FPS tracked
- [ ] Mobile memory tracked
- [ ] Mobile network type tracked
- [ ] Mobile data usage estimated

---

## 13. Testing Checklist

### Manual Testing
**Test Scenarios**:
1. **Fresh Visit**
   - [ ] Clear cookies
   - [ ] Visit homepage
   - [ ] Check GA4 Real-time for new user
   - [ ] Verify page_view event

2. **Module Interaction**
   - [ ] Click SaaS module
   - [ ] Wait 10 seconds
   - [ ] Close module
   - [ ] Check GA4 for module_view and duration

3. **Scroll Through Page**
   - [ ] Scroll to bottom
   - [ ] Check scroll events tracked
   - [ ] Verify scroll progress percentages

4. **Error Trigger**
   - [ ] Trigger intentional error
   - [ ] Check GA4 for error event
   - [ ] Check Sentry (if configured)

5. **Web Vitals**
   - [ ] Wait for page to fully load
   - [ ] Interact with page
   - [ ] Check console for web vitals logs
   - [ ] Verify in GA4 DebugView

### Automated Testing
```javascript
// tests/analytics.test.js
import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('should track page views', async ({ page }) => {
    const requests = [];
    page.on('request', req => {
      if (req.url().includes('google-analytics.com')) {
        requests.push(req.url());
      }
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    expect(requests.length).toBeGreaterThan(0);
  });

  test('should track module interactions', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const events = [];
    page.on('console', msg => {
      if (msg.text().includes('Analytics event:')) {
        events.push(msg.text());
      }
    });

    await page.click('[data-module-id="saas"]');
    await page.waitForTimeout(1000);

    expect(events.some(e => e.includes('module_view'))).toBe(true);
  });
});
```

---

## 14. Launch Readiness

### Pre-Launch Checklist
- [ ] All analytics integrated and tested
- [ ] No test/debug data in production
- [ ] All events firing correctly
- [ ] Web Vitals tracking working
- [ ] Error tracking operational
- [ ] Privacy compliance verified
- [ ] GA4 dashboard configured
- [ ] Custom reports created
- [ ] Team trained on dashboard
- [ ] Stakeholder access granted

### Production Environment
- [ ] Production GA4 property separate from dev/staging
- [ ] Production Measurement ID in .env.production
- [ ] Debug mode disabled in production
- [ ] Data retention configured
- [ ] Alerts configured
- [ ] Goals/conversions defined

---

## Analytics Verification Report

### Verification Completed By
**Tester**: [Name]
**Date**: [YYYY-MM-DD]

### Test Results

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Setup | 7 | [ ] | [ ] | |
| Events | 15 | [ ] | [ ] | |
| Web Vitals | 5 | [ ] | [ ] | |
| Privacy | 5 | [ ] | [ ] | |
| Dashboard | 8 | [ ] | [ ] | |

**Overall Pass Rate**: [X%]

### Issues Found
1. [Issue description]
2. [Issue description]

### Approval
**Status**: [✅ APPROVED / ⏳ PENDING / ❌ NEEDS FIX]

---

**Status**: ⏳ Ready for Verification
**Last Updated**: November 2025
