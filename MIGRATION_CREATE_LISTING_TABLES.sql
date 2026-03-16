-- Pearl Hub Listing Tables Migration
-- Run these SQL commands in your Supabase SQL Editor

-- 1. STAYS LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.stay_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price_per_night numeric(10,2),
  location text,
  stay_type text CHECK (stay_type IN ('star_hotel', 'villa', 'guest_house', 'hostel', 'lodge')),
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  rooms integer DEFAULT 1,
  max_guests integer DEFAULT 2,
  rating numeric(3,1) DEFAULT 4.5,
  provider_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT valid_price CHECK (price_per_night > 0)
);

-- Create indexes for stay_listings
CREATE INDEX idx_stay_listings_user_id ON public.stay_listings(user_id);
CREATE INDEX idx_stay_listings_created_at ON public.stay_listings(created_at DESC);
CREATE INDEX idx_stay_listings_location ON public.stay_listings(location);

-- Enable RLS for stay_listings
ALTER TABLE public.stay_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own listings (unless public)
CREATE POLICY "Users can read own stay listings"
  ON public.stay_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

-- Policy: Users can insert their own stay listings
CREATE POLICY "Users can create own stay listings"
  ON public.stay_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own stay listings
CREATE POLICY "Users can update own stay listings"
  ON public.stay_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own stay listings
CREATE POLICY "Users can delete own stay listings"
  ON public.stay_listings FOR DELETE
  USING (auth.uid() = user_id);

---

-- 2. VEHICLE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  vehicle_type text CHECK (vehicle_type IN ('car', 'van', 'jeep', 'bus', 'luxury_coach')),
  daily_rate numeric(10,2),
  seats integer DEFAULT 5,
  fuel text CHECK (fuel IN ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission text CHECK (transmission IN ('manual', 'automatic')),
  ac boolean DEFAULT true,
  location text,
  description text,
  images text[] DEFAULT '{}',
  driver_availability text CHECK (driver_availability IN ('included', 'optional')) DEFAULT 'optional',
  km_included integer DEFAULT 100,
  excess_km_rate numeric(10,2),
  provider_name text,
  rating numeric(3,1) DEFAULT 4.8,
  trips integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT valid_daily_rate CHECK (daily_rate > 0)
);

-- Create indexes for vehicle_listings
CREATE INDEX idx_vehicle_listings_user_id ON public.vehicle_listings(user_id);
CREATE INDEX idx_vehicle_listings_created_at ON public.vehicle_listings(created_at DESC);
CREATE INDEX idx_vehicle_listings_location ON public.vehicle_listings(location);
CREATE INDEX idx_vehicle_listings_vehicle_type ON public.vehicle_listings(vehicle_type);

-- Enable RLS for vehicle_listings
ALTER TABLE public.vehicle_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own or active vehicle listings
CREATE POLICY "Users can read own or active vehicle listings"
  ON public.vehicle_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

-- Policy: Users can insert their own vehicle listings
CREATE POLICY "Users can create own vehicle listings"
  ON public.vehicle_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vehicle listings
CREATE POLICY "Users can update own vehicle listings"
  ON public.vehicle_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own vehicle listings
CREATE POLICY "Users can delete own vehicle listings"
  ON public.vehicle_listings FOR DELETE
  USING (auth.uid() = user_id);

---

-- 3. EVENT LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.event_listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text CHECK (category IN ('cinema', 'concert', 'sports', 'theater', 'conference')),
  event_date date NOT NULL,
  event_time time,
  venue text,
  location text,
  description text,
  images text[] DEFAULT '{}',
  capacity integer,
  standard_price numeric(10,2),
  premium_price numeric(10,2),
  vip_price numeric(10,2),
  organizer_name text,
  booked_seats text DEFAULT '[]',
  rating numeric(3,1) DEFAULT 4.8,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'completed')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_standard_price CHECK (standard_price > 0)
);

-- Create indexes for event_listings
CREATE INDEX idx_event_listings_user_id ON public.event_listings(user_id);
CREATE INDEX idx_event_listings_created_at ON public.event_listings(created_at DESC);
CREATE INDEX idx_event_listings_event_date ON public.event_listings(event_date);
CREATE INDEX idx_event_listings_category ON public.event_listings(category);
CREATE INDEX idx_event_listings_location ON public.event_listings(location);

-- Enable RLS for event_listings
ALTER TABLE public.event_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own or active event listings
CREATE POLICY "Users can read own or active event listings"
  ON public.event_listings FOR SELECT
  USING (auth.uid() = user_id OR status = 'active');

-- Policy: Users can insert their own event listings
CREATE POLICY "Users can create own event listings"
  ON public.event_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own event listings
CREATE POLICY "Users can update own event listings"
  ON public.event_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own event listings
CREATE POLICY "Users can delete own event listings"
  ON public.event_listings FOR DELETE
  USING (auth.uid() = user_id);

---

-- 4. BOOKING TRACKING TABLE (Optional but recommended)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  listing_id text NOT NULL,
  listing_type text CHECK (listing_type IN ('stay', 'vehicle', 'event')),
  booking_date timestamp DEFAULT now(),
  check_in_date date,
  check_out_date date,
  total_amount numeric(12,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method text,
  payment_reference text,
  created_at timestamp DEFAULT now(),
  CONSTRAINT valid_amount CHECK (total_amount > 0)
);

-- Create indexes for bookings
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

Create POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

---

-- 5. RATINGS & REVIEWS FOR LISTINGS (Extension)
CREATE TABLE IF NOT EXISTS public.listing_reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id text NOT NULL,
  listing_type text CHECK (listing_type IN ('stay', 'vehicle', 'event')),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  review_date timestamp DEFAULT now(),
  helpful_count integer DEFAULT 0
);

-- Create indexes for listing_reviews
CREATE INDEX idx_listing_reviews_listing_id ON public.listing_reviews(listing_id);
CREATE INDEX idx_listing_reviews_listing_type ON public.listing_reviews(listing_type);
CREATE INDEX idx_listing_reviews_reviewer_id ON public.listing_reviews(reviewer_id);

-- Enable RLS for listing_reviews
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON public.listing_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.listing_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

---

-- 6. Add role check to allow only authorized users to create listings
CREATE OR REPLACE FUNCTION check_listing_permission()
RETURNS TRIGGER AS $$
BEGIN
  -- Check user role from profiles table
  IF NEW.listing_type = 'stay' THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('stay_provider', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only stay providers and admins can list stays';
    END IF;
  ELSIF NEW.listing_type = 'vehicle' THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('vehicle_provider', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only vehicle providers and admins can list vehicles';
    END IF;
  ELSIF NEW.listing_type = 'event' THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('event_organizer', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only event organizers and admins can create events';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Apply trigger after creating listing record or use application-level validation

---

-- 7. Storage bucket for listing images (Supabase Storage)
-- Go to Storage in Supabase dashboard and create these buckets:
-- - listing-images (for stay, vehicle, event images)
-- - Set to public for image serving
-- - Add CORS policy if needed

---

COMMIT;
