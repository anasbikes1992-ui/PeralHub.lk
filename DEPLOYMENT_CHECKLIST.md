# 🚀 Pearl Hub - Deployment Checklist

## Pre-Deployment Phase (Complete Before Pushing)

### Code Quality
- [ ] Run `npm run build` - No errors
- [ ] Run `npm lint` - No warnings (if linter configured)
- [ ] Run `npm test` - All tests pass (if tests configured)
- [ ] Verify no console.log() debugging statements remain
- [ ] Check `.env` file is NOT committed to git

### Dependencies
- [ ] Run `npm audit` - Fix any security vulnerabilities
- [ ] Update outdated packages: `npm update`
- [ ] Verify package-lock.json is committed
- [ ] Test with clean install: `npm ci && npm run build`

### Configuration
- [ ] Verify `.env.production` has correct Supabase credentials
- [ ] Confirm VITE_SUPABASE_URL is correct domain
- [ ] Check all API endpoints are using HTTPS
- [ ] Verify environment variables match your deployment platform

### Supabase Verification
- [ ] [ ] Log into Supabase dashboard
- [ ] [ ] Verify `inquiries` table exists and has proper columns
- [ ] [ ] Verify `profiles` table exists with role enum
- [ ] [ ] Verify `reviews` table exists
- [ ] [ ] Enable Row-Level Security (RLS) on all tables
- [ ] [ ] Configure CORS for your production domain
- [ ] [ ] Test auth signup/signin with test account
- [ ] [ ] Verify profiles created on signup

### Build Output
- [ ] dist/ folder generated
- [ ] dist/index.html exists
- [ ] All CSS bundles present
- [ ] All JS chunks present
- [ ] All images optimized
- [ ] Source maps included (for debugging)

---

## Deployment Phase (Platform Specific)

### Option A: Vercel
- [ ] Create/login Vercel account
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] VITE_SUPABASE_PROJECT_ID
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
- [ ] Set Node.js version to 20+ (if needed)
- [ ] Deploy
- [ ] Verify deployment at https://yourapp.vercel.app

### Option B: Netlify
- [ ] Create/login Netlify account
- [ ] Connect GitHub repository
- [ ] Set environment variables in dashboard
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Enable auto-deploy on git push
- [ ] Deploy
- [ ] Verify deployment at https://yourapp.netlify.app

### Option C: AWS S3 + CloudFront
- [ ] Create AWS account
- [ ] Create S3 bucket
- [ ] Enable static website hosting
- [ ] Upload dist/ contents to bucket
- [ ] Create CloudFront distribution
- [ ] Point domain to CloudFront
- [ ] Verify files accessible

### Option D: Self-Hosted (VPS)
- [ ] SSH into server
- [ ] Install Node.js 20+
- [ ] Clone repository: `git clone <repo>`
- [ ] Install dependencies: `npm ci`
- [ ] Build: `npm run build`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start server: `pm2 start "npm run preview" --name pearl-hub`
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL with Let's Encrypt
- [ ] Configure firewall

---

## Post-Deployment Phase

### Initial Access
- [ ] Visit production URL
- [ ] Homepage loads without errors
- [ ] Check browser console (F12) for errors
- [ ] Verify no network errors in Network tab
- [ ] Test on mobile browsers

### Page Testing
- [ ] [ ] Homepage renders correctly
- [ ] [ ] Navigation menu works
- [ ] [ ] Property page loads
- [ ] [ ] Stays page loads
- [ ] [ ] Vehicles page loads with RealTimeTracker
- [ ] [ ] Events page loads
- [ ] [ ] Dashboard page accessible
- [ ] [ ] Social page functional
- [ ] [ ] All internal links work

### Authentication Testing
- [ ] Visit /auth page
- [ ] Signup form submits successfully
- [ ] Verify user created in Supabase auth
- [ ] Verify profile created in profiles table
- [ ] Verify welcome email sent (if configured)
- [ ] Login with new account
- [ ] Verify JWT token stored in localStorage
- [ ] Logout works
- [ ] Session persists on page reload
- [ ] Password reset flow works

### Supabase Integration Testing
- [ ] [ ] Test inquiry form submission
- [ ] [ ] Verify inquiry appears in database
- [ ] [ ] Test review submission
- [ ] [ ] Verify review appears in reviews table
- [ ] [ ] Test data fetching from APIs
- [ ] [ ] Verify real-time updates (if subscribed)
- [ ] [ ] Check Supabase logs for errors

### Performance Testing
- [ ] Run Lighthouse audit
  - [ ] Performance score > 80
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90
  - [ ] SEO score > 90
- [ ] [ ] Test on 3G connection (DevTools)
- [ ] [ ] Test with slow CPU (DevTools)
- [ ] [ ] Verify lazy loading works
- [ ] [ ] Check Time to First Byte (TTFB)

### Security Testing
- [ ] Test API calls use HTTPS
- [ ] Verify no sensitive data in console
- [ ] Test CORS headers correct
- [ ] Verify no PII in logs
- [ ] Test rate limiting (if configured)
- [ ] Verify authentication tokens not exposed

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Test touch interactions
- [ ] Test landscape orientation

---

## Monitoring Setup

### Error Tracking
- [ ] Setup Sentry error tracking (optional)
- [ ] Configure error notifications
- [ ] Test error capture

### Analytics
- [ ] Setup Google Analytics (optional)
- [ ] Track custom events
- [ ] Monitor user behavior

### Uptime Monitoring
- [ ] Setup Uptime Robot
- [ ] Configure alerts
- [ ] Test alert notifications

### Database Monitoring
- [ ] Check Supabase dashboard regularly
- [ ] Monitor query performance
- [ ] Track storage usage
- [ ] Review auth events

---

## Post-Launch Tasks

### Week 1
- [ ] Daily monitoring of errors
- [ ] Check server logs
- [ ] Monitor Supabase metrics
- [ ] Gather user feedback
- [ ] Fix any critical bugs

### Month 1
- [ ] Performance optimization if needed
- [ ] Database cleanup/optimization
- [ ] Review analytics
- [ ] Plan feature updates

### Ongoing
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Regular database backups
- [ ] Monitor for new vulnerabilities

---

## Rollback Plan

### If Deployment Fails
1. Revert to previous version in deployment platform
2. Check error logs for root cause
3. Fix issue in development
4. Re-deploy after testing

### If Production Issues Arise
1. Scale down app (to reduce impact)
2. Check server logs and Supabase logs
3. Identify issue
4. Deploy hotfix
5. Communicate status to users

---

## Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://app.supabase.com
- GitHub Repository: [Your Repo URL]
- Production URL: [Your Production URL]

---

## Deployment Sign-Off

| Item | Date | Status |
|------|------|--------|
| All checklist items completed | ________ | ☐ |
| Code reviewed | ________ | ☐ |
| Tests passed | ________ | ☐ |
| Deployed to production | ________ | ☐ |
| Post-deployment testing complete | ________ | ☐ |
| Monitoring configured | ________ | ☐ |

**Signed off by**: _________________  
**Date**: __________

---

*Last Updated: March 16, 2026*  
*Use this checklist for every deployment to ensure quality and consistency.*
