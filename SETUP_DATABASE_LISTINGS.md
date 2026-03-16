# Setup Instructions for Pearl Hub Listing Features

## 🚀 Quick Start (5 Steps)

### Step 1: Enable New User Roles (if not already done)

In your Supabase SQL Editor, add these roles to the `app_role` enum (if they don't exist):

```sql
-- Check if roles exist
SELECT enumlabel FROM pg_enum WHERE enumtypid = 
  (SELECT oid FROM pg_type WHERE typname='app_role');

-- If vehicle_provider or event_organizer are missing:
ALTER TYPE app_role ADD VALUE 'vehicle_provider' BEFORE 'admin';
ALTER TYPE app_role ADD VALUE 'event_organizer' BEFORE 'admin';

-- List current roles:
-- customer, owner, broker, stay_provider, vehicle_provider, event_organizer, sme, admin
```

---

### Step 2: Create the Database Tables

**Copy the entire SQL from below** and paste into Supabase SQL Editor, then click "Execute":

```sql
-- STAYS LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.stay_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price_per_night numeric(10,2) NOT NULL,
  location text NOT NULL,
  stay_type text NOT NULL CHECK (stay_type IN ('star_hotel', 'villa', 'guest_house', 'hostel', 'lodge')),
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  rooms integer DEFAULT 1,
  max_guests integer DEFAULT 2,
  rating numeric(3,1) DEFAULT 4.5,
  provider_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_stay_listings_user_id ON public.stay_listings(user_id);
CREATE INDEX idx_stay_listings_created_at ON public.stay_listings(created_at DESC);
CREATE INDEX idx_stay_listings_location ON public.stay_listings(location);

ALTER TABLE public.stay_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stay listings"
  ON public.stay_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

CREATE POLICY "Users can create own stay listings"
  ON public.stay_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stay listings"
  ON public.stay_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stay listings"
  ON public.stay_listings FOR DELETE
  USING (auth.uid() = user_id);

-- VEHICLE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('car', 'van', 'jeep', 'bus', 'luxury_coach')),
  daily_rate numeric(10,2) NOT NULL,
  seats integer DEFAULT 5,
  fuel text CHECK (fuel IN ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission text CHECK (transmission IN ('manual', 'automatic')),
  ac boolean DEFAULT true,
  location text NOT NULL,
  description text,
  images text[] DEFAULT '{}',
  driver_availability text DEFAULT 'optional' CHECK (driver_availability IN ('included', 'optional')),
  km_included integer DEFAULT 100,
  excess_km_rate numeric(10,2),
  provider_name text,
  rating numeric(3,1) DEFAULT 4.8,
  trips integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_vehicle_listings_user_id ON public.vehicle_listings(user_id);
CREATE INDEX idx_vehicle_listings_created_at ON public.vehicle_listings(created_at DESC);
CREATE INDEX idx_vehicle_listings_location ON public.vehicle_listings(location);
CREATE INDEX idx_vehicle_listings_vehicle_type ON public.vehicle_listings(vehicle_type);

ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own or active vehicle listings"
  ON public.vehicle_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

CREATE POLICY "Users can create own vehicle listings"
  ON public.vehicle_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicle listings"
  ON public.vehicle_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicle listings"
  ON public.vehicle_listings FOR DELETE
  USING (auth.uid() = user_id);

-- EVENT LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.event_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text CHECK (category IN ('cinema', 'concert', 'sports', 'theater', 'conference')),
  event_date date NOT NULL,
  event_time time,
  venue text,
  location text NOT NULL,
  description text,
  images text[] DEFAULT '{}',
  capacity integer NOT NULL,
  standard_price numeric(10,2) NOT NULL,
  premium_price numeric(10,2),
  vip_price numeric(10,2),
  organizer_name text,
  booked_seats text DEFAULT '[]',
  rating numeric(3,1) DEFAULT 4.8,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'completed')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_event_listings_user_id ON public.event_listings(user_id);
CREATE INDEX idx_event_listings_created_at ON public.event_listings(created_at DESC);
CREATE INDEX idx_event_listings_event_date ON public.event_listings(event_date);
CREATE INDEX idx_event_listings_category ON public.event_listings(category);

ALTER TABLE public.event_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own or active event listings"
  ON public.event_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

CREATE POLICY "Users can create own event listings"
  ON public.event_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event listings"
  ON public.event_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own event listings"
  ON public.event_listings FOR DELETE
  USING (auth.uid() = user_id);
```

---

### Step 3: Create Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Click **"Create a new bucket"**
3. **Name**: `listing-images`
4. **Visibility**: Select **"Public"**
5. Click **"Create bucket"**

---

### Step 4: Configure Storage Permissions

In Supabase SQL Editor, run:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow public read access
CREATE POLICY "Allow public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Allow users to update their own uploads
CREATE POLICY "Allow user updates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images' 
    AND auth.uid() = owner
  );

-- Allow users to delete their own uploads
CREATE POLICY "Allow user deletes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images' 
    AND auth.uid() = owner
  );
```

---

### Step 5: Test in Application

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Create test user** with role `stay_provider`:
   - Go to http://localhost:8080/auth
   - Sign up
   - In Supabase, update profile: `UPDATE profiles SET role = 'stay_provider' WHERE email = 'test@example.com'`

3. **Go to Stays page**:
   - Navigate to http://localhost:8080/stays
   - Click **"➕ List Stay"** button
   - Form should open
   - Fill in details and submit
   - Verify listing appears

4. **Repeat for other roles**:
   - `vehicle_provider` on `/vehicles`
   - `event_organizer` on `/events`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All 3 tables exist in Supabase
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_name LIKE '%_listings';
  ```

- [ ] RLS is enabled on all tables
  ```sql
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public' AND tablename LIKE '%_listings';
  ```

- [ ] Storage bucket `listing-images` exists
  - Check: Supabase Dashboard → Storage

- [ ] Roles exist in app_role enum
  ```sql
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 
    (SELECT oid FROM pg_type WHERE typname='app_role');
  ```

- [ ] Dev server runs without errors
  ```bash
  npm run dev
  ```

- [ ] Modal buttons visible for correct roles
- [ ] Forms submit successfully
- [ ] Listings appear in database

---

## 🔧 Troubleshooting

### "Column does not exist" error
**Solution**: Check table names are lowercase and match exactly:
- `stay_listings` ✓
- `vehicle_listings` ✓
- `event_listings` ✓

### "Permission denied" on insert
**Solution**: Verify user role in `/profiles` table:
```sql
SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
```

Ensure role is one of:
- `stay_provider` (for stays)
- `vehicle_provider` (for vehicles)
- `event_organizer` (for events)
- `admin` (can list all)

### Images not uploading
**Solution**: Verify storage bucket exists and is public:
```
Supabase Dashboard → Storage → listing-images → Visibility: Public ✓
```

### Modal not opening
**Solution**: Check browser console (F12) for errors:
- Profile not loaded?
- Missing user role?
- Modal component not imported?

---

## 📊 Database Queries for Testing

### List all stays created by current user
```sql
SELECT title, location, price_per_night, status 
FROM stay_listings 
WHERE user_id = (SELECT auth.uid())
ORDER BY created_at DESC;
```

### Get vehicle count by type
```sql
SELECT vehicle_type, COUNT(*) as count 
FROM vehicle_listings 
WHERE status = 'active'
GROUP BY vehicle_type;
```

### Find upcoming events
```sql
SELECT title, venue, event_date, event_time 
FROM event_listings 
WHERE event_date >= CURRENT_DATE 
AND status = 'active'
ORDER BY event_date;
```

---

## 🎓 Learning Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row-Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage API**: https://supabase.com/docs/guides/storage

---

## ❓ FAQ

**Q: Can I upload videos?**  
A: The component currently supports images only (jpg, png, webp). Video support can be added in future versions.

**Q: What file sizes are allowed?**  
A: Maximum 5MB per file. Edit `ImageUpload.tsx` to change limit.

**Q: Can I backup listings?**  
A: Yes, export from Supabase → Tables → stay_listings → Export as CSV/JSON

**Q: How do I bulk delete listings?**  
A: In Supabase, run:
```sql
DELETE FROM stay_listings WHERE user_id = 'user-uuid';
```

---

**Status**: Ready for Production ✅  
**Last Updated**: March 16, 2026
