/**
 * Deployment Configuration
 * Configure deployment targets and settings
 */

export default {
  // Staging environment
  staging: {
    name: 'staging',
    url: 'https://staging.cerebral-machine.com',
    cdn: {
      provider: 'cloudflare',
      zone: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
    },
    s3: {
      bucket: 'cerebral-machine-staging',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    cacheControl: {
      html: 'public, max-age=0, must-revalidate',
      assets: 'public, max-age=31536000, immutable',
      images: 'public, max-age=31536000, immutable',
      fonts: 'public, max-age=31536000, immutable',
    },
  },

  // Production environment
  production: {
    name: 'production',
    url: 'https://cerebral-machine.com',
    cdn: {
      provider: 'cloudflare',
      zone: process.env.CLOUDFLARE_ZONE_ID_PROD,
      apiToken: process.env.CLOUDFLARE_API_TOKEN_PROD,
    },
    s3: {
      bucket: 'cerebral-machine-production',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROD,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD,
    },
    cloudfront: {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    },
    cacheControl: {
      html: 'public, max-age=0, must-revalidate',
      assets: 'public, max-age=31536000, immutable',
      images: 'public, max-age=31536000, immutable',
      fonts: 'public, max-age=31536000, immutable',
    },
  },

  // Build settings
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    compressionLevel: 9,
  },

  // Optimization settings
  optimization: {
    images: {
      quality: 85,
      formats: ['webp', 'avif'],
    },
    fonts: {
      preload: true,
      subset: true,
    },
    code: {
      splitting: true,
      treeShaking: true,
      minify: true,
    },
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
    },
    analytics: {
      googleAnalytics: process.env.GA_MEASUREMENT_ID,
      plausible: process.env.PLAUSIBLE_DOMAIN,
    },
  },
};
