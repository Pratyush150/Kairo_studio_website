# SEO Verification Checklist

Comprehensive SEO audit checklist for Cerebral Machine.

**Project**: Cerebral Machine
**Last Updated**: November 2025
**Target Score**: Lighthouse SEO ≥ 90

---

## On-Page SEO

### 1. Title Tags

**Requirements**:
- [ ] Title tag present on all pages
- [ ] Length: 50-60 characters
- [ ] Unique for each page
- [ ] Includes primary keyword
- [ ] Brand name included
- [ ] Compelling and descriptive

**Example**:
```html
<title>Cerebral Machine - 3D Data Visualization & AI Solutions</title>
```

**Test**:
```javascript
// Check title
console.log(document.title);
console.log('Length:', document.title.length); // Should be 50-60
```

### 2. Meta Description

**Requirements**:
- [ ] Meta description present
- [ ] Length: 150-160 characters
- [ ] Unique for each page
- [ ] Includes keywords naturally
- [ ] Compelling call-to-action
- [ ] Accurately describes page

**Example**:
```html
<meta name="description" content="Explore cutting-edge 3D data visualization and AI-powered solutions. Interactive brain network showcasing SaaS, automation, and integration capabilities." />
```

**Test**:
```javascript
// Check meta description
const desc = document.querySelector('meta[name="description"]');
console.log(desc?.content);
console.log('Length:', desc?.content.length); // Should be 150-160
```

### 3. Heading Structure

**Requirements**:
- [ ] One H1 per page
- [ ] H1 includes primary keyword
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] No heading level skips
- [ ] Descriptive and keyword-rich

**Test**:
```javascript
// Check heading hierarchy
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
console.log('H1 count:', document.querySelectorAll('h1').length); // Should be 1
headings.forEach(h => console.log(h.tagName, h.textContent));
```

### 4. URL Structure

**Requirements**:
- [ ] Clean, readable URLs
- [ ] Keywords in URL
- [ ] Hyphens (not underscores) for spaces
- [ ] Lowercase letters
- [ ] Short and descriptive
- [ ] HTTPS enabled

**Examples**:
```
✅ Good: https://cerebral-machine.com/services/data-visualization
❌ Bad: https://cerebral-machine.com/page.php?id=123&cat=5
```

### 5. Canonical Tags

**Requirements**:
- [ ] Canonical tag present
- [ ] Points to preferred URL version
- [ ] Consistent across pages
- [ ] Prevents duplicate content issues

**Example**:
```html
<link rel="canonical" href="https://cerebral-machine.com/" />
```

---

## Technical SEO

### 1. Robots.txt

**Requirements**:
- [ ] robots.txt file present
- [ ] Properly formatted
- [ ] Allows important pages
- [ ] Blocks admin/private areas
- [ ] Sitemap reference included

**Example** (`/public/robots.txt`):
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

Sitemap: https://cerebral-machine.com/sitemap.xml
```

**Test**:
```bash
curl https://cerebral-machine.com/robots.txt
```

### 2. Sitemap.xml

**Requirements**:
- [ ] Sitemap.xml present
- [ ] Valid XML format
- [ ] All important pages included
- [ ] Updated automatically
- [ ] Submitted to Google Search Console

**Example** (`/public/sitemap.xml`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cerebral-machine.com/</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cerebral-machine.com/services</loc>
    <lastmod>2025-11-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Test**:
```bash
curl https://cerebral-machine.com/sitemap.xml
# Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

### 3. SSL Certificate (HTTPS)

**Requirements**:
- [ ] SSL certificate installed
- [ ] HTTPS enforced (HTTP redirects)
- [ ] No mixed content warnings
- [ ] Certificate valid and not expired

**Test**:
```bash
# Check SSL
curl -I https://cerebral-machine.com | grep -i "HTTP"

# Should return: HTTP/2 200 (or HTTP/1.1 301 → HTTPS)
```

### 4. Page Speed

**Requirements**:
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1

**Test**:
```bash
# Lighthouse performance
lighthouse https://cerebral-machine.com \
  --only-categories=performance \
  --output=html
```

### 5. Mobile-Friendliness

**Requirements**:
- [ ] Responsive design
- [ ] Viewport meta tag present
- [ ] Touch targets ≥ 44x44px
- [ ] No horizontal scrolling
- [ ] Text readable without zoom

**Viewport Tag**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Test**:
```bash
# Google Mobile-Friendly Test
# https://search.google.com/test/mobile-friendly
```

### 6. Structured Data (Schema.org)

**Requirements**:
- [ ] JSON-LD structured data present
- [ ] Organization schema
- [ ] WebPage schema
- [ ] BreadcrumbList (if applicable)
- [ ] Valid markup

**Example**:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cerebral Machine",
  "url": "https://cerebral-machine.com",
  "logo": "https://cerebral-machine.com/logo.png",
  "description": "3D Data Visualization & AI Solutions",
  "sameAs": [
    "https://twitter.com/cerebralmachine",
    "https://linkedin.com/company/cerebralmachine"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cerebral Machine - Home",
  "description": "Explore cutting-edge 3D data visualization",
  "url": "https://cerebral-machine.com"
}
</script>
```

**Test**:
```bash
# Google Rich Results Test
# https://search.google.com/test/rich-results
```

---

## Social Media Optimization

### 1. Open Graph Tags (Facebook)

**Requirements**:
- [ ] og:title present
- [ ] og:description present
- [ ] og:image present (1200x630px)
- [ ] og:url present
- [ ] og:type present
- [ ] og:site_name present

**Example**:
```html
<meta property="og:title" content="Cerebral Machine - 3D Data Visualization" />
<meta property="og:description" content="Explore cutting-edge 3D data visualization and AI-powered solutions." />
<meta property="og:image" content="https://cerebral-machine.com/og-image.png" />
<meta property="og:url" content="https://cerebral-machine.com/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Cerebral Machine" />
```

**Test**:
```bash
# Facebook Sharing Debugger
# https://developers.facebook.com/tools/debug/
```

### 2. Twitter Cards

**Requirements**:
- [ ] twitter:card present
- [ ] twitter:title present
- [ ] twitter:description present
- [ ] twitter:image present (1200x628px)
- [ ] twitter:site present (if applicable)

**Example**:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Cerebral Machine - 3D Data Visualization" />
<meta name="twitter:description" content="Explore cutting-edge 3D data visualization and AI-powered solutions." />
<meta name="twitter:image" content="https://cerebral-machine.com/twitter-image.png" />
<meta name="twitter:site" content="@cerebralmachine" />
```

**Test**:
```bash
# Twitter Card Validator
# https://cards-dev.twitter.com/validator
```

---

## Content SEO

### 1. Keyword Optimization

**Requirements**:
- [ ] Primary keyword in title
- [ ] Primary keyword in H1
- [ ] Keywords in first paragraph
- [ ] Keywords in meta description
- [ ] Keywords in alt text
- [ ] Natural keyword density (1-2%)
- [ ] LSI keywords included

### 2. Content Quality

**Requirements**:
- [ ] Original, unique content
- [ ] Minimum 300 words per page
- [ ] Proper grammar and spelling
- [ ] Scannable formatting (headings, bullets)
- [ ] Value-driven, not keyword-stuffed
- [ ] Regular content updates

### 3. Internal Linking

**Requirements**:
- [ ] Descriptive anchor text
- [ ] Links to related pages
- [ ] Logical link structure
- [ ] No broken internal links
- [ ] Navigation menu present

### 4. External Linking

**Requirements**:
- [ ] Links to authoritative sources
- [ ] External links open in new tab
- [ ] `rel="noopener noreferrer"` on external links
- [ ] No broken external links

**Example**:
```html
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Resource
</a>
```

### 5. Image Optimization

**Requirements**:
- [ ] All images have alt text
- [ ] Descriptive file names (not IMG_1234.jpg)
- [ ] Compressed/optimized file sizes
- [ ] Responsive images (srcset)
- [ ] Modern formats (WebP, AVIF)
- [ ] Lazy loading enabled

**Example**:
```html
<img
  src="/images/brain-visualization.webp"
  alt="Interactive 3D brain network visualization showing data connections"
  loading="lazy"
  width="800"
  height="600"
/>
```

---

## Automated SEO Testing

### 1. Lighthouse SEO Audit

```bash
lighthouse https://cerebral-machine.com \
  --only-categories=seo \
  --output=html \
  --output-path=./seo-report.html
```

**Target Score**: ≥ 90/100

**Key Metrics**:
- [ ] Document has a `<title>` element
- [ ] Document has a meta description
- [ ] Page has successful HTTP status code
- [ ] Links have descriptive text
- [ ] Document has a valid `hreflang`
- [ ] Document has a valid `rel=canonical`
- [ ] Document avoids plugins
- [ ] Document has a viewport meta tag
- [ ] Document uses legible font sizes
- [ ] Tap targets are sized appropriately

### 2. SEO Spider Crawl

```bash
# Install Screaming Frog SEO Spider
# https://www.screamingfrogseoseospider.com/

# Or use command-line alternative
npm install -g website-scraper
website-scraper https://cerebral-machine.com -d ./crawl
```

**Check For**:
- [ ] All pages crawlable
- [ ] No broken links (404s)
- [ ] No redirect chains
- [ ] Proper canonical tags
- [ ] No duplicate content

### 3. Meta Tag Checker Script

```javascript
// scripts/check-seo.js
import puppeteer from 'puppeteer';

async function checkSEO(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const seoData = await page.evaluate(() => {
    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      ogDescription: document.querySelector('meta[property="og:description"]')?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.content,
      h1Count: document.querySelectorAll('h1').length,
      h1Text: document.querySelector('h1')?.textContent,
      imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length
    };
  });

  await browser.close();

  console.log('SEO Audit Results:');
  console.log('━'.repeat(50));
  console.log('Title:', seoData.title, `(${seoData.title?.length} chars)`);
  console.log('Meta Description:', seoData.metaDescription, `(${seoData.metaDescription?.length} chars)`);
  console.log('Canonical:', seoData.canonical);
  console.log('H1 Count:', seoData.h1Count, seoData.h1Count === 1 ? '✅' : '⚠️');
  console.log('H1 Text:', seoData.h1Text);
  console.log('Images without alt:', seoData.imagesWithoutAlt, seoData.imagesWithoutAlt === 0 ? '✅' : '⚠️');
  console.log('OG Title:', seoData.ogTitle ? '✅' : '❌');
  console.log('OG Image:', seoData.ogImage ? '✅' : '❌');
  console.log('Twitter Card:', seoData.twitterCard ? '✅' : '❌');
}

checkSEO('http://localhost:5173');
```

---

## Core Web Vitals

### Target Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

**Test**:
```bash
# Run Lighthouse
lighthouse https://cerebral-machine.com \
  --only-categories=performance \
  --output=json \
  --output-path=./web-vitals.json

# Extract Core Web Vitals
cat web-vitals.json | jq '.audits["largest-contentful-paint"].displayValue'
cat web-vitals.json | jq '.audits["cumulative-layout-shift"].displayValue'
```

---

## Google Search Console Integration

### Setup Checklist

- [ ] Property added to Google Search Console
- [ ] Ownership verified
- [ ] Sitemap submitted
- [ ] No critical errors in Coverage report
- [ ] Mobile usability issues resolved
- [ ] Core Web Vitals passing
- [ ] No manual actions
- [ ] Rich results valid (if applicable)

### Monitoring

**Weekly Checks**:
- [ ] Check for new errors in Coverage
- [ ] Monitor average position for target keywords
- [ ] Review click-through rates
- [ ] Check for security issues
- [ ] Review Core Web Vitals report

---

## Local SEO (If Applicable)

### Google Business Profile

- [ ] Profile created and verified
- [ ] NAP (Name, Address, Phone) consistent
- [ ] Business hours accurate
- [ ] Categories selected
- [ ] Photos uploaded
- [ ] Reviews managed

### Local Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Cerebral Machine",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Innovation Drive",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "telephone": "+1-415-555-0123",
  "openingHours": "Mo-Fr 09:00-17:00",
  "url": "https://cerebral-machine.com"
}
```

---

## SEO Checklist Summary

### Pre-Launch Checklist

**Critical** (Must Fix):
- [ ] Title tags optimized (50-60 chars)
- [ ] Meta descriptions present (150-160 chars)
- [ ] One H1 per page
- [ ] All images have alt text
- [ ] HTTPS enabled
- [ ] Canonical tags present
- [ ] robots.txt present
- [ ] sitemap.xml present and submitted
- [ ] Mobile-friendly
- [ ] No broken links

**Important** (Should Fix):
- [ ] Page speed optimized (LCP < 2.5s)
- [ ] Structured data implemented
- [ ] Open Graph tags present
- [ ] Twitter Cards present
- [ ] Internal linking structure
- [ ] Keyword optimization
- [ ] Content quality high

**Nice to Have** (Polish):
- [ ] Breadcrumbs schema
- [ ] FAQ schema (if applicable)
- [ ] Video schema (if applicable)
- [ ] Local business schema
- [ ] Social media integration

---

## Sign-off Checklist

- [ ] Lighthouse SEO score ≥ 90
- [ ] All meta tags present and optimized
- [ ] Core Web Vitals passing (green)
- [ ] Google Search Console configured
- [ ] Sitemap submitted
- [ ] No critical errors
- [ ] Mobile-friendly test passing
- [ ] Rich results test passing (if applicable)
- [ ] All images optimized with alt text
- [ ] No broken links
- [ ] Structured data valid
- [ ] Social sharing tags working
- [ ] Documentation updated

---

**Audit Status**: ⏳ Ready to Execute
**Target Score**: Lighthouse SEO ≥ 90
**Last Updated**: November 2025
