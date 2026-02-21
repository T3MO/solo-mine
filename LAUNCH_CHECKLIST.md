# 🚀 Solo Mine Launch Checklist

Complete this checklist before and after launching to production.

---

## ✅ Pre-Launch (Critical)

### Environment & Configuration
- [ ] Environment variables set in Vercel dashboard
  - [ ] `ADMIN_TOKEN` (secure random string)
  - [ ] `ADMIN_PASSWORD_HASH` (generated hash)
  - [ ] `NEXT_PUBLIC_SITE_URL` (production domain)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (if using database)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (if using database)
  - [ ] `RESEND_API_KEY` or `CONVERTKIT_API_KEY` (if using email)
- [ ] `.env.local` NOT committed to git
- [ ] `ADMIN_TOKEN` is at least 32 characters
- [ ] `ADMIN_PASSWORD_HASH` generated using setup script

### Domain & SSL
- [ ] Custom domain purchased and configured
- [ ] DNS records pointing to Vercel
- [ ] SSL certificate active (auto-provisioned by Vercel)
- [ ] `www` redirect configured (optional)
- [ ] HSTS headers tested and working

### Content
- [ ] Hardware database updated (`data/hardware.json`)
  - [ ] All devices have real affiliate links (not example.com)
  - [ ] Prices are current
  - [ ] Stock status is accurate
- [ ] Email templates reviewed
- [ ] Privacy policy page updated with real contact info
- [ ] All placeholder content replaced

### Images & Assets
- [ ] All required images in `/public`
  - [ ] `favicon.ico`
  - [ ] `icon-192.png`
  - [ ] `icon-512.png`
  - [ ] `apple-icon.png`
  - [ ] `og-image.png` (Open Graph image)
- [ ] Images optimized (WebP format where possible)
- [ ] No broken image links

### Code Quality
- [ ] No `console.log` statements in production code (check with `npm run predeploy`)
- [ ] No `TODO` or `FIXME` comments (resolve or remove)
- [ ] TypeScript type checking passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] Pre-deploy checks pass (`npm run predeploy`)

### Functionality Testing
- [ ] Quiz works end-to-end (all 5 result paths)
- [ ] Variance simulator calculations verified with known values
- [ ] Email capture form submits successfully
- [ ] Admin login works with production credentials
- [ ] 404 page displays correctly
- [ ] Error boundary catches errors gracefully

### Performance
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Bundle size analyzed (`npm run analyze`)
- [ ] Images lazy loaded

### Mobile & Responsive
- [ ] Mobile layout tested (Chrome DevTools)
- [ ] Touch targets are 48px minimum
- [ ] Text is readable on small screens
- [ ] Navigation works on mobile
- [ ] No horizontal scroll issues

### SEO & Social
- [ ] `robots.txt` allows all pages
- [ ] `sitemap.xml` generated and valid
- [ ] Open Graph tags present (test with Facebook Debugger)
- [ ] Twitter Card tags present (test with Twitter Card Validator)
- [ ] Canonical URLs correct
- [ ] Meta descriptions written for all pages

### Analytics & Tracking
- [ ] Plausible/Analytics script installed and firing
- [ ] Admin dashboard analytics show data
- [ ] Custom events tracking (quiz start, simulator run, etc.)
- [ ] Affiliate link clicks tracked

### Security
- [ ] Security headers present (check with securityheaders.com)
- [ ] Admin routes protected by middleware
- [ ] No sensitive data in client bundle
- [ ] `npm audit` passes (no critical vulnerabilities)

### Legal
- [ ] Privacy policy page live
- [ ] Affiliate disclosure present (footer of emails)
- [ ] License file included
- [ ] Terms of service (if required in your jurisdiction)

---

## ✅ Post-Launch (24-48 hours after launch)

### Verification
- [ ] Site loads correctly on production domain
- [ ] SSL certificate valid (no warnings)
- [ ] Admin login works on production
- [ ] Quiz completes and sends emails
- [ ] Simulator runs without errors
- [ ] All affiliate links redirect correctly

### Search & Discovery
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test site search with `site:yourdomain.com`
- [ ] Verify Google can crawl (no robots.txt blocking)

### Social & Sharing
- [ ] Test Twitter/X card with Card Validator
- [ ] Test Facebook sharing with Sharing Debugger
- [ ] Test LinkedIn sharing
- [ ] Verify Open Graph images load

### Monitoring
- [ ] Uptime monitoring set up (UptimeRobot/Pingdom)
  - [ ] Health check endpoint `/api/health` returning 200
  - [ ] Alerts configured for downtime
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry optional)
- [ ] Performance monitoring active

### Email & Communication
- [ ] First subscriber receives welcome email
- [ ] Unsubscribe link works
- [ ] Email deliverability tested (not spam folder)
- [ ] Weekly newsletter template reviewed

### Backup & Maintenance
- [ ] Database backup schedule configured (Supabase auto-backup)
- [ ] Git repository backed up
- [ ] Environment variables documented (secure location)
- [ ] Rollback plan documented

---

## 📊 Launch Week Tasks

### Day 1: Announce
- [ ] Post on Twitter/X with screenshots
- [ ] Share in relevant communities (Bitcoin, mining forums)
- [ ] Email existing subscribers (if migrating)
- [ ] Update GitHub README with live URL

### Day 2-3: Monitor
- [ ] Check error logs hourly
- [ ] Monitor traffic spikes
- [ ] Watch for broken functionality
- [ ] Respond to user feedback

### Day 4-7: Iterate
- [ ] Fix any critical bugs
- [ ] Address user feedback
- [ ] Optimize slow pages
- [ ] Add any missing hardware

---

## 🚨 Emergency Contacts

| Service | Where to Check | Contact |
|---------|---------------|---------|
| Vercel | Dashboard / Status Page | support@vercel.com |
| Supabase | Dashboard / Status Page | support@supabase.io |
| Resend | Dashboard | support@resend.com |
| Domain | Registrar | Your registrar support |

---

## 📈 Success Metrics (Track After Launch)

### Week 1 Goals
- [ ] 100+ unique visitors
- [ ] 50+ quiz completions
- [ ] 10+ email subscribers
- [ ] 5+ simulator runs

### Month 1 Goals
- [ ] 1000+ unique visitors
- [ ] 30% quiz completion rate
- [ ] 100+ email subscribers
- [ ] 50+ affiliate link clicks

---

## 🎉 You're Live!

Once all checks are complete:

1. Take a screenshot of your dashboard
2. Celebrate! 🎉
3. Share with the world
4. Keep iterating based on feedback

---

**Last Updated**: 2024
**Version**: 1.0
