# Deployment Guide - KAIRO STUDIO

Complete guide for deploying the KAIRO STUDIO Automation Universe to production.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or keep SQLite for MVP)
- Domain name configured
- SSL certificate (via Vercel/Cloudflare)

---

## Environment Setup

### 1. Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

**Required**:
```bash
DATABASE_URL="postgresql://user:password@host:5432/kairo_studio"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="https://yourdomain.com"
```

**Recommended**:
```bash
WEBHOOK_URL="https://hooks.zapier.com/..."
ADMIN_API_KEY="<secure random key>"
SENDGRID_API_KEY="<your key>"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://..."
```

### 2. Database Migration

If migrating from SQLite to PostgreSQL:

```bash
# Update DATABASE_URL in .env.production
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Advantages**:
- Zero-config deployment
- Automatic SSL
- Edge functions
- Built-in CDN
- Preview deployments

**Steps**:

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
# First deployment (sets up project)
vercel

# Production deployment
vercel --prod
```

4. **Set Environment Variables**:
```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
# ... add all required env vars
```

5. **Configure Domain**:
- Go to Vercel Dashboard → Settings → Domains
- Add your custom domain
- Update DNS records as instructed

**PostgreSQL Options for Vercel**:
- Vercel Postgres (built-in)
- Supabase
- Neon
- PlanetScale
- Railway

### Option 2: Docker Deployment

**Create `Dockerfile`**:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Build and Run**:
```bash
docker build -t kairo-studio .
docker run -p 3000:3000 --env-file .env.production kairo-studio
```

### Option 3: VPS Deployment (DigitalOcean, AWS, etc.)

**Requirements**:
- Ubuntu 22.04 LTS
- Nginx
- PM2
- PostgreSQL

**Steps**:

1. **Setup Server**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

2. **Clone Repository**:
```bash
cd /var/www
git clone https://github.com/youruser/kairo-studio.git
cd kairo-studio
```

3. **Install Dependencies**:
```bash
npm ci
npx prisma generate
npx prisma migrate deploy
```

4. **Build Application**:
```bash
npm run build
```

5. **Start with PM2**:
```bash
pm2 start npm --name "kairo-studio" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable SSL with Let's Encrypt**:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Database Setup

### PostgreSQL Setup

**Local Development**:
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb kairo_studio

# Update DATABASE_URL
DATABASE_URL="postgresql://localhost:5432/kairo_studio"
```

**Cloud Options**:

1. **Supabase** (Free tier available)
   - Visit supabase.com
   - Create project
   - Copy connection string

2. **Neon** (Serverless PostgreSQL)
   - Visit neon.tech
   - Create project
   - Copy connection string

3. **Railway**
   - Visit railway.app
   - Add PostgreSQL plugin
   - Copy connection string

---

## Post-Deployment Checklist

### Security

- [ ] Update `NEXTAUTH_SECRET` with secure random string
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set up rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Review and restrict database access
- [ ] Set secure cookie settings

### Performance

- [ ] Enable gzip compression (Nginx/Vercel)
- [ ] Configure CDN (Cloudflare, Vercel CDN)
- [ ] Enable HTTP/2
- [ ] Optimize images (use Next.js Image optimization)
- [ ] Set up caching headers
- [ ] Monitor bundle size

### Monitoring

- [ ] Set up Sentry for error tracking
- [ ] Configure Google Analytics / Plausible
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure log aggregation (Logtail, Papertrail)
- [ ] Set up performance monitoring (Vercel Analytics)

### Backups

- [ ] Configure automated database backups
- [ ] Set up file storage backups (if applicable)
- [ ] Test backup restoration process
- [ ] Document backup retention policy

### DNS & Email

- [ ] Configure DNS records
- [ ] Set up email sending (SendGrid, Resend)
- [ ] Configure SPF/DKIM/DMARC for email
- [ ] Test email deliverability

---

## Testing Production Build

### Local Production Test

```bash
# Build for production
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

### Smoke Tests

```bash
# Test homepage
curl https://yourdomain.com

# Test API endpoints
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123456","name":"Test"}'

# Test protected routes (should redirect to login)
curl -I https://yourdomain.com/dashboard
```

---

## Scaling Considerations

### Database

- Use connection pooling (PgBouncer)
- Enable read replicas
- Implement caching (Redis)
- Regular VACUUM and ANALYZE

### Application

- Use PM2 cluster mode: `pm2 start npm --name "kairo-studio" -i max -- start`
- Implement horizontal scaling with load balancer
- Use CDN for static assets
- Optimize 3D asset loading

### Monitoring

- Set up alerts for:
  - High error rates
  - Slow response times (>1s)
  - High CPU/memory usage
  - Database connection issues

---

## Rollback Plan

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### PM2

```bash
# List previous versions
pm2 list

# Restart from previous code
cd /var/www/kairo-studio
git reset --hard <previous-commit>
npm run build
pm2 restart kairo-studio
```

### Database

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check uptime
- Review user signups

**Weekly**:
- Review performance metrics
- Check database size
- Update dependencies (security patches)

**Monthly**:
- Full dependency updates
- Security audit
- Performance optimization review
- Backup restoration test

### Update Procedure

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run migrations
npx prisma migrate deploy

# 4. Build
npm run build

# 5. Restart
pm2 restart kairo-studio

# 6. Verify
curl https://yourdomain.com
```

---

## Troubleshooting

### Common Issues

**Database Connection Errors**:
```bash
# Check DATABASE_URL format
# Verify database is running
# Check firewall rules
# Test connection: npx prisma db pull
```

**Build Failures**:
```bash
# Clear cache
rm -rf .next node_modules
npm ci
npm run build
```

**Port Already in Use**:
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Out of Memory**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Support

For deployment issues:
1. Check logs: `pm2 logs kairo-studio` or Vercel Dashboard
2. Review environment variables
3. Verify database connection
4. Check DNS configuration
5. Contact hosting support

---

## Production URLs

**Frontend**: https://yourdomain.com
**API**: https://yourdomain.com/api
**Dashboard**: https://yourdomain.com/dashboard

---

Last Updated: November 23, 2025
