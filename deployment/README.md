# Deployment Guide

Comprehensive deployment documentation for Cerebral Machine.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- AWS CLI configured (for S3/CloudFront deployment)
- Cloudflare account (optional, for CDN)
- GitHub repository access

## Environment Setup

### 1. Environment Variables

Create `.env.production` file:

```bash
# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=cerebral-machine.com

# Error Tracking
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# API Endpoints
VITE_API_URL=https://api.cerebral-machine.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_3D=true
```

### 2. AWS Credentials (if using S3)

Configure AWS CLI:

```bash
aws configure
# AWS Access Key ID: YOUR_KEY
# AWS Secret Access Key: YOUR_SECRET
# Default region: us-east-1
# Default output format: json
```

### 3. Cloudflare Credentials (if using Cloudflare)

```bash
export CLOUDFLARE_API_TOKEN=your_api_token
export CLOUDFLARE_ZONE_ID=your_zone_id
```

## Build Process

### Development Build

```bash
npm run dev
```

### Production Build

```bash
# Standard build
npm run build

# Build with optimization
npm run build:optimize

# Preview production build
npm run preview
```

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── index-[hash].css     # Main stylesheet
│   ├── vendor-[hash].js     # Third-party dependencies
│   └── ...
├── index.html               # Entry point
└── assets-manifest.json     # Asset manifest
```

## Deployment Options

### Option 1: Static Hosting (Netlify/Vercel)

#### Netlify

1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build:optimize`
   - Publish directory: `dist`
3. Set environment variables
4. Deploy

#### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Option 2: AWS S3 + CloudFront

#### Create S3 Bucket

```bash
aws s3 mb s3://cerebral-machine-production
aws s3 website s3://cerebral-machine-production \
  --index-document index.html \
  --error-document index.html
```

#### Deploy to S3

```bash
# Build
npm run build:optimize

# Sync to S3
aws s3 sync dist/ s3://cerebral-machine-production \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html"

# Upload HTML with no-cache
aws s3 sync dist/ s3://cerebral-machine-production \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate"
```

#### Invalidate CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 3: Cloudflare Pages

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish dist
```

### Option 4: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:optimize

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t cerebral-machine .
docker run -p 80:80 cerebral-machine
```

## CI/CD Pipeline

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. **Build & Test**: Compiles and tests the application
2. **Lighthouse CI**: Runs performance audits
3. **Deploy Staging**: Deploys to staging on `develop` branch
4. **Deploy Production**: Deploys to production on `main` branch

### Required Secrets

Add these to GitHub repository settings:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
CLOUDFRONT_DISTRIBUTION_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
LHCI_GITHUB_APP_TOKEN (optional)
```

### Manual Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Cache Configuration

### Recommended Cache Headers

```nginx
# HTML files - no cache
location ~* \.html$ {
    add_header Cache-Control "public, max-age=0, must-revalidate";
}

# JavaScript/CSS - immutable
location ~* \.(js|css)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Images - long cache
location ~* \.(jpg|jpeg|png|gif|webp|avif|svg)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Fonts - long cache
location ~* \.(woff|woff2|ttf|otf)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Performance Optimization

### Pre-deployment Checklist

- [ ] Run production build
- [ ] Run Lighthouse audit
- [ ] Check bundle sizes
- [ ] Test on slow 3G
- [ ] Verify analytics tracking
- [ ] Test error tracking
- [ ] Check accessibility
- [ ] Verify SEO metadata

### Lighthouse Thresholds

```json
{
  "performance": ">= 80",
  "accessibility": ">= 90",
  "best-practices": ">= 85",
  "seo": ">= 90"
}
```

## Monitoring

### Analytics

- Google Analytics 4
- Plausible Analytics
- Custom analytics dashboard

### Error Tracking

- Sentry integration
- Error Boundary components
- Custom error logging

### Performance Monitoring

- Web Vitals tracking
- FPS monitoring
- Memory usage tracking
- Custom performance metrics

## Rollback Procedure

### S3/CloudFront

```bash
# List versions
aws s3api list-object-versions \
  --bucket cerebral-machine-production

# Restore previous version
aws s3 cp \
  s3://cerebral-machine-production/index.html \
  s3://cerebral-machine-production/index.html \
  --version-id VERSION_ID

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Netlify/Vercel

Use the web dashboard to roll back to a previous deployment.

## Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Failures

```bash
# Check AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://cerebral-machine-production

# Verify CloudFront distribution
aws cloudfront get-distribution \
  --id YOUR_DISTRIBUTION_ID
```

### Performance Issues

```bash
# Analyze bundle
npm run build -- --sourcemap
npx vite-bundle-visualizer

# Check Lighthouse report
npm run lighthouse
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/cerebral-machine/issues
- Documentation: https://docs.cerebral-machine.com

---

**Last Updated**: November 2025
**Version**: 1.0.0
