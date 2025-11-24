# Production Launch Guide

Complete guide for production deployment and launch.

**Project**: Cerebral Machine
**Last Updated**: November 2025
**Phase**: 14 - Polish & Launch

---

## Table of Contents

1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Monitoring Setup](#monitoring-setup)
3. [Backup & Rollback Procedures](#backup--rollback-procedures)
4. [Launch Day Checklist](#launch-day-checklist)
5. [Post-Launch Monitoring](#post-launch-monitoring)
6. [Incident Response](#incident-response)

---

## Pre-Launch Checklist

### Code & Build
- [ ] All code reviewed and merged to main
- [ ] No console.log or debug code in production
- [ ] Production build successful
- [ ] Source maps generated (for debugging)
- [ ] Assets optimized and hashed
- [ ] Bundle size acceptable (< 500KB gzipped)
- [ ] No build warnings

```bash
# Run production build
npm run build

# Check bundle sizes
npm run build -- --analyze

# Verify no errors
echo $?  # Should be 0
```

### Environment Configuration
- [ ] Production `.env` file configured
- [ ] All API keys set correctly
- [ ] Analytics IDs configured
- [ ] Error tracking (Sentry) configured
- [ ] CDN URLs correct
- [ ] Database connections tested (if applicable)
- [ ] Third-party integrations verified

**Verify**:
```bash
# Check environment variables (don't expose secrets!)
echo "GA_MEASUREMENT_ID: ${VITE_GA_MEASUREMENT_ID:0:5}..."
echo "SENTRY_DSN: ${VITE_SENTRY_DSN:0:10}..."
```

### Domain & DNS
- [ ] Domain purchased and configured
- [ ] DNS records propagated
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] WWW redirect configured
- [ ] apex domain works
- [ ] Certificate auto-renewal enabled

**Test**:
```bash
# Check DNS propagation
dig cerebral-machine.com

# Check SSL certificate
curl -vI https://cerebral-machine.com 2>&1 | grep -i "SSL certificate"

# Check HTTPS redirect
curl -I http://cerebral-machine.com | grep -i "location"
```

### Testing Complete
- [ ] All Phase 13 testing completed
- [ ] Acceptance tests passed
- [ ] Cross-browser testing passed
- [ ] Device testing passed
- [ ] Performance tests passed
- [ ] Accessibility audit passed
- [ ] SEO verification passed
- [ ] Load testing passed

### Content & Legal
- [ ] Content review completed
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie Policy (if required)
- [ ] GDPR compliance (if EU)
- [ ] All placeholders removed
- [ ] Contact information accurate

---

## Monitoring Setup

### 1. Analytics Monitoring

#### Google Analytics 4
**Setup**:
- [ ] Production GA4 property created
- [ ] Data stream configured
- [ ] Real-time reports enabled
- [ ] Custom events configured
- [ ] Goals/conversions defined
- [ ] Team members have access

**Alerts**:
```
Set up GA4 Custom Alerts:
1. Traffic drop > 50% (compared to previous day)
2. Error rate > 5%
3. Bounce rate > 80%
4. Conversion rate < threshold
```

**Dashboard**: Create custom dashboard with:
- Real-time users
- Page views (24hr)
- Top pages
- Traffic sources
- Conversion rate
- Web Vitals

#### Plausible/Alternative (if used)
- [ ] Domain configured
- [ ] Events tracking
- [ ] Goals set up
- [ ] Team access granted

### 2. Error Tracking (Sentry)

**Setup**:
- [ ] Sentry project created
- [ ] DSN configured in production
- [ ] Environment set to "production"
- [ ] Release tracking enabled
- [ ] Source maps uploaded
- [ ] Alert rules configured

**Alert Rules**:
```
Configure Sentry Alerts:
1. New issue created (Slack notification)
2. Issue frequency > 100/hour
3. User-affected count > 50
4. Performance regression detected
```

**Integration**:
```bash
# Upload source maps on deploy
sentry-cli releases files $RELEASE upload-sourcemaps ./dist
```

### 3. Uptime Monitoring

**Services** (choose one):
- **UptimeRobot** (free tier available)
- **Pingdom**
- **StatusCake**
- **Betterstack**

**Configuration**:
- [ ] Monitor main domain (HTTPS)
- [ ] Check interval: 5 minutes
- [ ] Alert on 3 consecutive failures
- [ ] Alert via email + Slack
- [ ] Monitor from multiple regions
- [ ] Check for specific text/element

**Endpoints to Monitor**:
```
1. https://cerebral-machine.com/ (homepage)
2. https://cerebral-machine.com/health (health check endpoint)
3. https://cerebral-machine.com/api/status (if API exists)
```

### 4. Performance Monitoring

#### Lighthouse CI
**Setup**:
- [ ] Lighthouse CI configured in GitHub Actions
- [ ] Performance budgets set
- [ ] Assertions configured
- [ ] Failing builds on regression

**Budgets**:
```json
{
  "performance": 80,
  "accessibility": 90,
  "best-practices": 85,
  "seo": 90,
  "lcp": 2500,
  "cls": 0.1
}
```

#### Real User Monitoring (RUM)
**Options**:
- Google Analytics Web Vitals
- SpeedCurve
- Calibre
- DebugBear

**Metrics to Track**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

### 5. CDN Monitoring (if using CloudFlare/AWS)

**CloudFlare**:
- [ ] Analytics enabled
- [ ] Cache Hit Ratio monitored
- [ ] Bandwidth usage tracked
- [ ] DDoS protection active
- [ ] Firewall rules configured

**Metrics**:
- Cache hit ratio (target: > 80%)
- Bandwidth savings
- Requests per second
- 5XX error rate (target: < 0.1%)

### 6. Server Monitoring (if self-hosted)

**System Metrics**:
- [ ] CPU usage (alert if > 80%)
- [ ] Memory usage (alert if > 85%)
- [ ] Disk space (alert if > 90%)
- [ ] Network bandwidth
- [ ] Process monitoring

**Tools**:
- Datadog
- New Relic
- Prometheus + Grafana
- AWS CloudWatch
- Azure Monitor

---

## Backup & Rollback Procedures

### 1. Backup Strategy

#### Code Backups
**Git Repository**:
- [ ] Code in GitHub (primary)
- [ ] All branches backed up
- [ ] Tags for releases
- [ ] README with recovery instructions

**Backup Frequency**: Continuous (Git)

#### Database Backups (if applicable)
- [ ] Daily automated backups
- [ ] Backup retention: 30 days
- [ ] Backup stored in separate region
- [ ] Backup integrity tested monthly

```bash
# Example backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump database_name > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://backups/database/
```

#### Static Assets
- [ ] Assets in S3 with versioning
- [ ] CDN cache can be purged
- [ ] Source assets backed up

### 2. Rollback Procedures

#### Quick Rollback (< 5 minutes)

**Option 1: Revert Git Commit**
```bash
# Identify last good commit
git log --oneline

# Revert to last good commit
git revert <commit-hash>
git push origin main

# CI/CD will auto-deploy
```

**Option 2: Redeploy Previous Version**
```bash
# Netlify
netlify rollback

# Vercel
vercel rollback

# AWS S3
aws s3 sync s3://backups/version-X.Y.Z/ s3://production-bucket/
```

**Option 3: CloudFlare Rollback**
```bash
# Purge CDN cache to force re-fetch
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

#### Database Rollback (if applicable)
```bash
# Restore from backup
pg_restore -d database_name backup_YYYYMMDD.sql

# Verify restoration
psql -d database_name -c "SELECT COUNT(*) FROM main_table;"
```

### 3. Rollback Decision Tree

```
Issue Detected
    ├─ Critical (site down, data loss)
    │   └─ ROLLBACK IMMEDIATELY
    │       ├─ Revert deployment
    │       ├─ Notify team
    │       └─ Investigate offline
    │
    ├─ High (broken feature, performance degradation)
    │   └─ Assess impact
    │       ├─ If affects > 50% users → ROLLBACK
    │       └─ If affects < 50% users → Hotfix or rollback
    │
    └─ Medium/Low (minor bug, visual issue)
        └─ Deploy hotfix
            └─ Monitor and fix forward
```

### 4. Communication Plan

**Critical Issue (Rollback)**:
1. Announce in #incidents Slack channel
2. Update status page (if available)
3. Email stakeholders
4. Tweet/post if public-facing

**Template**:
```
🚨 INCIDENT ALERT

Issue: [Brief description]
Impact: [Who/what is affected]
Status: [Investigating/Rolling back/Resolved]
ETA: [Estimated time to resolution]

Updates: [Status page URL]
```

---

## Launch Day Checklist

### T-24 Hours Before Launch

- [ ] Final production build completed
- [ ] All tests passing
- [ ] Deployment pipeline tested
- [ ] Monitoring dashboards configured
- [ ] Team briefed on launch plan
- [ ] Rollback plan reviewed
- [ ] Emergency contacts list shared
- [ ] Status page ready (if applicable)

### T-4 Hours Before Launch

- [ ] Team standup meeting
- [ ] Review launch checklist
- [ ] Verify all environments
- [ ] Check DNS propagation
- [ ] Test SSL certificate
- [ ] Warm up CDN cache (if cold start)
- [ ] Clear caches if needed

### T-1 Hour Before Launch

- [ ] Final smoke tests on staging
- [ ] Verify analytics working
- [ ] Check error tracking active
- [ ] Ensure uptime monitoring ready
- [ ] Team on standby
- [ ] Communication channels open

### Launch Time (T-0)

#### Step 1: Deploy to Production
```bash
# Option A: Netlify/Vercel
npm run deploy:production

# Option B: AWS S3 + CloudFront
npm run build
aws s3 sync dist/ s3://production-bucket/ --delete
aws cloudfront create-invalidation --distribution-id $CDN_ID --paths "/*"

# Option C: Custom deployment
./scripts/deploy-production.sh
```

#### Step 2: Verify Deployment
```bash
# Check site is live
curl -I https://cerebral-machine.com | grep "HTTP"

# Verify SSL
echo | openssl s_client -servername cerebral-machine.com -connect cerebral-machine.com:443 2>/dev/null | grep "Verify return code"

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://cerebral-machine.com
```

#### Step 3: Smoke Tests
- [ ] Homepage loads
- [ ] 3D scene renders
- [ ] Module hotspots clickable
- [ ] Module panels open/close
- [ ] Navigation works
- [ ] Forms submit (if applicable)
- [ ] Analytics firing
- [ ] No console errors

#### Step 4: Monitor
- [ ] Check GA4 Real-time (users appearing?)
- [ ] Check Sentry (no new errors?)
- [ ] Check uptime monitor (all green?)
- [ ] Check CDN cache hit ratio
- [ ] Monitor server resources

#### Step 5: Announce
- [ ] Tweet/social media post
- [ ] Email announcement (if list exists)
- [ ] Update LinkedIn
- [ ] Notify stakeholders
- [ ] Submit to Product Hunt (if planned)

### T+1 Hour After Launch

- [ ] Verify user traffic in GA4
- [ ] Check for any errors in Sentry
- [ ] Monitor uptime (should be 100%)
- [ ] Check Web Vitals metrics
- [ ] Review performance metrics
- [ ] Team debrief

### T+24 Hours After Launch

- [ ] Review analytics (traffic, engagement, conversions)
- [ ] Check error rate (should be < 1%)
- [ ] Verify uptime (should be > 99.9%)
- [ ] Review Web Vitals (all green?)
- [ ] Check user feedback
- [ ] Document lessons learned

---

## Post-Launch Monitoring

### Daily Monitoring (First Week)

**Morning Checklist**:
- [ ] Check uptime (last 24hr)
- [ ] Review GA4 traffic
- [ ] Check Sentry errors
- [ ] Review Web Vitals
- [ ] Check user feedback channels
- [ ] Monitor server resources

**Evening Checklist**:
- [ ] Review day's metrics
- [ ] Check for any anomalies
- [ ] Triage any new issues
- [ ] Update team

### Weekly Monitoring (First Month)

- [ ] Traffic trends
- [ ] Engagement metrics
- [ ] Conversion rates
- [ ] Performance trends
- [ ] Error rate trends
- [ ] User feedback summary
- [ ] Competitor analysis

### Monthly Monitoring (Ongoing)

- [ ] Comprehensive analytics review
- [ ] Performance audit
- [ ] Security audit
- [ ] Dependency updates
- [ ] Content updates
- [ ] SEO performance
- [ ] Competitive analysis

---

## Incident Response

### Severity Levels

**P0 - Critical** (15min response)
- Site completely down
- Data loss
- Security breach
- Payment system down

**P1 - High** (1hr response)
- Major feature broken
- Performance severely degraded
- Accessibility blocker
- Widespread user impact

**P2 - Medium** (4hr response)
- Minor feature broken
- Visual bug
- Affects small user segment

**P3 - Low** (24hr response)
- Cosmetic issue
- Enhancement request
- Documentation error

### Incident Response Steps

1. **Detect** (Monitoring alerts)
2. **Assess** (Determine severity)
3. **Communicate** (Notify team/users)
4. **Mitigate** (Fix or rollback)
5. **Resolve** (Verify fix)
6. **Document** (Post-mortem)

### Post-Mortem Template

```markdown
# Incident Post-Mortem

**Date**: YYYY-MM-DD
**Duration**: X hours
**Severity**: P0/P1/P2/P3

## Summary
[Brief description of what happened]

## Impact
- Users affected: [count]
- Revenue impact: [$amount or N/A]
- Downtime: [duration]

## Timeline
- HH:MM - Issue first detected
- HH:MM - Team notified
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Issue resolved

## Root Cause
[Detailed explanation]

## Resolution
[What was done to fix it]

## Action Items
1. [ ] [Preventive measure]
2. [ ] [Process improvement]
3. [ ] [Monitoring enhancement]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]
```

---

## Launch Success Criteria

### Immediate Success (T+24hr)
- [ ] Uptime > 99.9%
- [ ] Error rate < 1%
- [ ] All Web Vitals "Good" (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Analytics tracking successfully
- [ ] No critical bugs reported

### Short-term Success (T+1 week)
- [ ] User engagement meeting targets
- [ ] Performance stable
- [ ] No major incidents
- [ ] Positive user feedback
- [ ] SEO indexing started

### Long-term Success (T+1 month)
- [ ] Traffic growth
- [ ] Conversion rate meeting targets
- [ ] Performance maintained
- [ ] User satisfaction high
- [ ] SEO rankings improving

---

## Emergency Contacts

### On-Call Rotation
| Time Slot | Primary | Secondary |
|-----------|---------|-----------|
| Weekday 9-5 | [Name] | [Name] |
| Weekday 5-9 | [Name] | [Name] |
| Weekend | [Name] | [Name] |

### Key Contacts
- **Product Owner**: [Name] - [Phone] - [Email]
- **Tech Lead**: [Name] - [Phone] - [Email]
- **DevOps**: [Name] - [Phone] - [Email]
- **CDN Support**: [Support URL/Phone]
- **Hosting Support**: [Support URL/Phone]

---

## Launch Completion Sign-off

### Launch Team

**Product Owner**:
- [ ] Approved for launch
- Signature: _________________ Date: _______

**Tech Lead**:
- [ ] Technical readiness confirmed
- Signature: _________________ Date: _______

**QA Lead**:
- [ ] Testing complete
- Signature: _________________ Date: _______

**Marketing**:
- [ ] Marketing materials ready
- Signature: _________________ Date: _______

---

## Post-Launch Checklist

### Week 1
- [ ] Daily monitoring completed
- [ ] No critical issues
- [ ] Performance metrics stable
- [ ] User feedback reviewed

### Week 2-4
- [ ] Weekly reviews completed
- [ ] Minor issues addressed
- [ ] Performance optimizations applied
- [ ] SEO improvements implemented

### Month 2+
- [ ] Monthly audits scheduled
- [ ] Continuous improvement plan
- [ ] User feedback loop established
- [ ] Analytics insights actioned

---

**🎉 Ready for Launch!**

**Last Updated**: November 2025
**Status**: Pre-Launch Preparation
