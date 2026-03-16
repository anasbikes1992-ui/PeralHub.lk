# Testing & Deployment Guide - Listing & Provider Configuration System

**Last Updated:** March 16, 2026  
**Status:** ✅ All Components Ready for Testing & Deployment

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Testing Each Provider Type](#testing-each-provider-type)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Deployment Checklist](#deployment-checklist)
5. [Support & Monitoring](#support--monitoring)

---

## Database Setup

### Step 1: Execute Provider Configuration Migration

1. **Open Supabase Dashboard**
   - Go to your project → SQL Editor
   - Click "New Query"

2. **Copy & Execute Migration**
   - Copy the entire content from `MIGRATION_PROVIDER_CONFIG.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Creation**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'provider_configs';
   ```
   Should return: `provider_configs`

4. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'provider_configs';
   ```
   Should show 7 policies created

### Step 2: Create Test Provider Accounts

Run the following SQL to create test users for each provider type:

```sql
-- These will be created via your auth system, but here's the profile update

-- For stay_provider test
UPDATE profiles SET role = 'stay_provider' 
WHERE email = 'stay.provider@test.com';

-- For vehicle_provider test
UPDATE profiles SET role = 'vehicle_provider' 
WHERE email = 'vehicle.provider@test.com';

-- For event_organizer test
UPDATE profiles SET role = 'event_organizer' 
WHERE email = 'event.organizer@test.com';

-- For sme test
UPDATE profiles SET role = 'sme' 
WHERE email = 'sme.business@test.com';

-- For admin (verify existing)
UPDATE profiles SET role = 'admin' 
WHERE email = 'admin@test.com';
```

---

## Testing Each Provider Type

### ✅ Test 1: Stay Provider (🏨)

**Setup:**
1. Sign in as `stay_provider` account
2. Navigate to Dashboard → Accommodation/Stays page

**Test Case 1.1: Create Provider Configuration**
- [ ] Dashboard → Provider Settings (🔧)
- [ ] Click "🏨 Stay Provider" tile
- [ ] Fill form:
  - Business Name: "Luxury Stays Ltd"
  - Contact Person: "John Hotel Manager"
  - Phone: "+94701234567"
  - Address: "123 Main St, Colombo"
  - City: "Colombo"
  - Commission Rate: 8.5%
- [ ] Click "Create Configuration"
- [ ] ✅ Should see success message
- [ ] Configuration appears in list below

**Test Case 1.2: List a Stay**
- [ ] Go to Stays page (from main navigation)
- [ ] Click "➕ List Stay" button (should be visible)
- [ ] Fill form:
  - Title: "Beachfront Villa with Pool"
  - Stay Type: "Villa"
  - Description: "Beautiful 3-bedroom villa with ocean view"
  - Location: "Mount Lavinia"
  - Price: "15000" (Rs. per night)
  - Rooms: "3"
  - Max Guests: "8"
  - Amenities: Select WiFi, AC, Pool, Parking
  - Images: Upload at least 1 image
- [ ] Click "List Stay"
- [ ] ✅ Should see success notification
- [ ] Listing appears in "Your Listings" section in modal

**Test Case 1.3: Edit Stay Listing**
- [ ] Click Edit (pencil icon) on listing
- [ ] Modal should populate with existing data
- [ ] Change price to "18000"
- [ ] Click "Update Listing"
- [ ] ✅ Price should update in listing

**Test Case 1.4: Delete Stay Listing**
- [ ] Click Delete (trash icon) on listing
- [ ] Confirm deletion
- [ ] ✅ Listing should disappear

**Test Case 1.5: Image Upload**
- [ ] Create new listing
- [ ] Try to upload 6 images
- [ ] Should only allow 5 (max limit)
- [ ] Drag & drop should work
- [ ] Image preview should show
- [ ] Remove image button should work

---

### ✅ Test 2: Vehicle Provider (🚗)

**Setup:**
1. Sign in as `vehicle_provider` account
2. Navigate to Dashboard

**Test Case 2.1: Create Provider Configuration**
- [ ] Dashboard → Provider Settings (🔧)
- [ ] Click "🚗 Vehicle Provider" tile
- [ ] Fill form with sample data
- [ ] Commission Rate: Should default to 6.5%
- [ ] Click "Create Configuration"
- [ ] ✅ Dashboard should reflect updated NavItems

**Test Case 2.2: List a Vehicle**
- [ ] Go to Vehicles page
- [ ] Click "➕ List Vehicle" button
- [ ] Fill form:
  - Make: "Toyota"
  - Model: "Prius"
  - Year: "2023"
  - Vehicle Type: "Car"
  - Daily Rate: "10000"
  - Seats: "5"
  - Fuel: "Hybrid"
  - Transmission: "Automatic"
  - Location: "Colombo"
  - KM Included: "100"
  - Images: Upload 3 images
- [ ] Submit
- [ ] ✅ Excess KM rate should auto-calculate (5% of daily rate = 500)

**Test Case 2.3: Full CRUD Workflow**
- [ ] Create listing ✅
- [ ] Edit listing (change rate to 12000) ✅
- [ ] Verify excess KM updates (600) ✅
- [ ] Delete listing ✅

---

### ✅ Test 3: Event Organizer (🎭)

**Setup:**
1. Sign in as `event_organizer` account

**Test Case 3.1: Create Provider Configuration**
- [ ] Dashboard → Provider Settings
- [ ] Click "🎭 Event Organizer" tile
- [ ] Fill all required fields
- [ ] Click "Create Configuration"
- [ ] ✅ Should succeed

**Test Case 3.2: Create Event**
- [ ] Go to Events page
- [ ] Click "➕ Create Event" button
- [ ] Fill form:
  - Title: "Bathiya & Santhush Concert 2024"
  - Category: "Concert"
  - Date: Select future date
  - Time: "18:30"
  - Venue: "Colombo Sports Club"
  - Location: "Colombo 3"
  - Capacity: "1000"
  - Standard Price: "1500"
  - Premium Price: "2500"
  - VIP Price: "5000"
  - Description: "Live music concert..."
  - Images: Upload 2-3 images
- [ ] Click "Create Event"
- [ ] ✅ Event should appear in listings

**Test Case 3.3: Multi-Tier Pricing Validation**
- [ ] Edit event
- [ ] Verify all three price tiers show correctly
- [ ] Try to delete event
- [ ] ✅ Should confirm & delete

---

### ✅ Test 4: SME (🏪)

**Setup:**
1. Sign in as `sme` account
2. Go to Dashboard

**Test Case 4.1: Create Provider Configuration**
- [ ] Dashboard → Provider Settings
- [ ] Click "🏪 SME Business" tile
- [ ] Fill info:
  - Business Name: "Local Crafts Store"
  - Contact: "Maria Silva"
  - Phone: "+94771234567"
  - Address: "45 Colombo St"
  - City: "Colombo"
  - Commission Rate: Should default to 5%
- [ ] Click "Create Configuration"
- [ ] ✅ Should save

**Test Case 4.2: Verify Role Visibility**
- [ ] From DashboardPage, verify provider config option appears
- [ ] Navigation shows "Provider Settings (🔧)"
- [ ] Can click and configure
- [ ] Configuration persists

---

### ✅ Test 5: Role-Based Access Control

**Test Case 5.1: Stay Provider Cannot Access Vehicle Listings**
- [ ] Sign in as `stay_provider`
- [ ] Try to access `/vehicles`
- [ ] ✅ Page loads but "➕ List Vehicle" button should NOT appear
- [ ] Modal should not be accessible

**Test Case 5.2: Event Organizer Cannot List Stays**
- [ ] Sign in as `event_organizer`
- [ ] Go to `/stays`
- [ ] ✅ "➕ List Stay" button should NOT appear

**Test Case 5.3: Admin Can Configure All Provider Types**
- [ ] Sign in as `admin`
- [ ] Dashboard → Provider Settings
- [ ] ✅ Should see all 4 provider type tiles
- [ ] Should be able to create config for any type
- [ ] Should see verified badge controls

---

### ✅ Test 6: Image Upload Functionality

**Test Case 6.1: Drag & Drop**
- [ ] Open any listing modal (Stay/Vehicle/Event)
- [ ] Scroll to Images section
- [ ] Try to drag image onto upload area
- [ ] ✅ Should show drag overlay
- [ ] Image should upload on drop

**Test Case 6.2: Click to Browse**
- [ ] Click on upload area
- [ ] File browser should open
- [ ] Select image file
- [ ] ✅ Should upload and show preview

**Test Case 6.3: Image Limits**
- [ ] Try to upload 6 images for Stay (max 5)
- [ ] ✅ Should reject 6th image
- [ ] Try to upload 7 for Vehicle (max 6)
- [ ] ✅ Should reject 7th
- [ ] Try to upload 4 for Event (max 3)
- [ ] ✅ Should reject 4th

**Test Case 6.4: Image Removal**
- [ ] Upload images
- [ ] Hover over image tile
- [ ] Click X button
- [ ] ✅ Image should be removed from list

---

### ✅ Test 7: Form Validation

**Test Case 7.1: Required Field Validation - Stays**
- [ ] Try to submit without Title
- [ ] ✅ Should alert "Title is required"
- [ ] Try without Description
- [ ] ✅ Should alert "Description is required"
- [ ] Try with 0 price
- [ ] ✅ Should alert "Price must be greater than 0"
- [ ] Try without images
- [ ] ✅ Should alert "At least one image is required"

**Test Case 7.2: Required Field Validation - Vehicles**
- [ ] Try submit without Make
- [ ] ✅ Should alert "Make is required"
- [ ] Try with year = 1800
- [ ] ✅ Should alert "Year is invalid"

**Test Case 7.3: Required Field Validation - Events**
- [ ] Try submit without Title
- [ ] ✅ Should alert required
- [ ] Try with capacity = 0
- [ ] ✅ Should alert "Capacity must be > 0"

---

### ✅ Test 8: Error Handling

**Test Case 8.1: Database Connection Error**
- [ ] Turn off network temporarily
- [ ] Try to create listing
- [ ] ✅ Should show error message with details
- [ ] Turn network back on
- [ ] Should work again

**Test Case 8.2: Permission Denied (RLS)**
- [ ] Create listing as user A
- [ ] Query database as user B
- [ ] ✅ User B should not see user A's listings
- [ ] User A should still see their own

---

## Troubleshooting Guide

### Issue 1: "ImageUpload not working"

**Symptoms:**
- Images don't upload
- Upload area doesn't respond
- Network error in console

**Solution:**
1. Check Supabase storage bucket exists: `listings`
2. Verify bucket is `public`
3. Check RLS policies on storage
4. Verify user has write permissions
5. Check file size (< 5MB per image)

**SQL to verify:**
```sql
SELECT * FROM storage.buckets WHERE name = 'listings';
```

---

### Issue 2: "Provider Configuration not saving"

**Symptoms:**
- Form submits but doesn't save
- No error message shown
- Refresh loses data

**Solution:**
1. Verify `provider_configs` table exists
2. Check RLS policies are correct
3. Ensure user is authenticated
4. Check Supabase logs for database errors

**Debug:**
```sql
SELECT COUNT(*) FROM provider_configs;
-- Should return >= 0
```

---

### Issue 3: "Role-based buttons not appearing"

**Symptoms:**
- "List Stay" button not visible
- "Create Event" button not showing
- Can't access provider settings

**Solution:**
1. Verify `profile.role` matches expected value
2. Check DashboardPage imports ProviderConfigDashboard
3. Verify navItems includes provider_config
4. Clear browser cache
5. Check auth context is working

**Debug in browser console:**
```javascript
// Check profile role
console.log(profile?.role); // Should be 'stay_provider', etc.
```

---

### Issue 4: "Listing form doesn't work"

**Symptoms:**
- Form won't submit
- Button is disabled
- Fields show errors

**Solution:**
1. Verify all required fields are filled
2. Check image is uploaded (shows preview)
3. Verify prices/numbers are valid
4. Check browser console for errors
5. Try refreshing page

---

### Issue 5: "Can't delete provider configuration"

**Symptoms:**
- Delete button appears but nothing happens
- No confirmation dialog shows
- Data still exists after confirm

**Solution:**
1. Check RLS delete policy exists
2. Verify `id` is correctly set
3. Check user_id matches current user
4. Verify authenticated user (check auth token)

---

## Deployment Checklist

### Pre-Deployment (Week 1)

- [ ] **Database Migration**
  - [ ] Execute `MIGRATION_PROVIDER_CONFIG.sql` in production Supabase
  - [ ] Verify all tables and policies created
  - [ ] Run backup of existing database
  - [ ] Test RLS policies with test users

- [ ] **Code Changes**
  - [ ] Verify all 3 modal components (Stay, Vehicle, Event)
  - [ ] Verify ProviderConfigDashboard component exists
  - [ ] Verify DashboardPage imports are correct
  - [ ] Check build passes: `npm run build`
  - [ ] No TypeScript errors

- [ ] **Testing**
  - [ ] Run all 8 test cases locally
  - [ ] Test on staging environment
  - [ ] Test with different browsers (Chrome, Firefox, Safari)
  - [ ] Test on mobile devices
  - [ ] Performance testing (load time, image upload speed)

### During Deployment

- [ ] **Backup**
  - [ ] Backup production database
  - [ ] Backup current code version
  - [ ] Create rollback plan

- [ ] **Deploy**
  - [ ] Deploy code to production (Vercel/Netlify)
  - [ ] Verify all static assets load
  - [ ] Check no broken links
  - [ ] Monitor error logs

- [ ] **Verification**
  - [ ] Test login for all provider types
  - [ ] Create sample listings for each type
  - [ ] Test provider configuration dashboard
  - [ ] Verify image uploads work
  - [ ] Check database queries are performant

### Post-Deployment (Ongoing)

- [ ] **Monitoring**
  - [ ] Monitor Supabase logs for errors
  - [ ] Check application performance metrics
  - [ ] Monitor user reports
  - [ ] Check failed uploads/submissions

- [ ] **Support**
  - [ ] Have troubleshooting guide ready
  - [ ] Document known issues
  - [ ] Create user documentation
  - [ ] Set up help chat/support email

---

## Build & Deployment Commands

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or use GitHub integration for automatic deploys
```

### Deployment (Netlify)

```bash
# Drag and drop dist/ folder
# Or use Netlify CLI

npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Performance Metrics

### Expected Metrics (Green)
- Page load time: < 2s
- Image upload: < 5s for 5 images
- Form submission: < 1s
- Modal open/close: < 200ms

### Warning Metrics (Yellow)
- Page load time: 2-4s
- Image upload: 5-10s
- Form submission: 1-3s

### Critical Metrics (Red)
- Page load time: > 4s
- Image upload: > 10s
- Form submission: > 3s

---

## Support & Monitoring

### Key Contacts
- **Database Issues:** Supabase Support (supabase.com)
- **Deployment Issues:** Vercel/Netlify Support
- **Code Issues:** Development Team

### Monitoring URLs

**Supabase:**
- Logs: `dashboard.supabase.com` → Project → Logs
- Storage: `dashboard.supabase.com` → Project → Storage
- Database: `dashboard.supabase.com` → Project → SQL Editor

**Vercel/Netlify:**
- Deployments: `vercel.com` / `netlify.com` → Project Dashboard
- Analytics: Performance & Error logs

### Database Health Check

```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check RLS policies
SELECT tablename, policyname, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check recent errors
SELECT * FROM provider_configs LIMIT 5;
```

---

## Next Steps

### Phase 2 (After Deployment):
1. Monitor pro user feedback
2. Optimize performance if needed
3. Add advanced features:
   - Bulk operations for listings
   - Provider analytics dashboard
   - Automated verification workflow
   - Document upload/verification system

### Phase 3:
1. Mobile app optimization
2. API for third-party integrations
3. Advanced reporting
4. Multi-language support

---

**Last Updated:** March 16, 2026  
**Status:** ✅ Ready for Testing & Deployment
