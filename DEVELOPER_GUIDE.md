# Pearl Hub - Developer Integration Guide

## 📡 Supabase API Reference

### Authentication Endpoints

#### Sign Up
```javascript
// Location: src/context/AuthContext.tsx
const signUp = async (email: string, password: string, fullName: string, role: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role }
    }
  });
  // Automatically creates profile in 'profiles' table
};
```

#### Sign In
```javascript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
};
```

#### Sign Out
```javascript
const signOut = async () => {
  await supabase.auth.signOut();
};
```

#### Reset Password
```javascript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `https://yourdomain.com/auth?type=password_recovery`
  });
};
```

---

## 📊 Database Schema

### Tables Overview

#### 1. inquiries
**Purpose**: Store user inquiries/leads for listings

```sql
Column          | Type      | Description
----------------|-----------|---------------------------
id              | uuid      | Primary key
listing_id      | text      | Which listing inquiry is about
listing_type    | text      | property|stay|vehicle|event
message         | text      | Inquiry message
sender_name     | text      | Who sent it
sender_email    | text      | Contact email
sender_phone    | text      | Contact phone
owner_id        | uuid FK   | Listing owner (profiles.id)
status          | text      | new|contacted|converted|rejected
created_at      | timestamp | When sent
```

**Usage in Code**:
```javascript
// Insert inquiry
const { error } = await supabase
  .from('inquiries')
  .insert([{
    listing_id: '12345',
    listing_type: 'property',
    message: 'Interested in this property',
    sender_name: 'John Doe',
    sender_email: 'john@example.com',
    owner_id: ownerUserId,
    status: 'new'
  }]);

// Fetch inquiries for owner
const { data } = await supabase
  .from('inquiries')
  .select('*')
  .eq('owner_id', currentUserId);
```

#### 2. profiles
**Purpose**: User account profiles with roles and verification status

```sql
Column      | Type      | Description
------------|-----------|--------------------------------
id          | uuid      | References auth.users.id
email       | text      | User email
full_name   | text      | User's full name
phone       | text      | Contact number
avatar_url  | text      | Profile picture URL
nic         | text      | National ID number
role        | app_role enum | customer|owner|broker|admin|stay_provider|event_organizer|sme
verified    | boolean   | Account verified status
created_at  | timestamp | Account creation
updated_at  | timestamp | Last profile update
```

**Roles Enum Values**:
```
- 'customer': Regular marketplace user
- 'owner': Property/asset owner
- 'broker': Multiple property manager
- 'admin': Platform administrator
- 'stay_provider': Hotel/accommodation provider
- 'event_organizer': Event/cinema organizer
- 'sme': Small/medium business
```

**Usage in Code**:
```javascript
// Fetch current user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update profile
const { error } = await supabase
  .from('profiles')
  .update({ phone: '+94701234567', verified: true })
  .eq('id', userId);

// Query by role
const { data: owners } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'owner');
```

#### 3. reviews
**Purpose**: User reviews for listings with ratings

```sql
Column      | Type      | Description
------------|-----------|---------------------------
id          | uuid      | Primary key
listing_id  | text      | Reviewed listing ID
user_id     | uuid FK   | Reviewer (profiles.id)
rating      | integer   | 1-5 star rating
comment     | text      | Review text
created_at  | timestamp | Review date
```

**Usage in Code**:
```javascript
// Submit review
const { error } = await supabase
  .from('reviews')
  .insert([{
    listing_id: '12345',
    user_id: currentUserId,
    rating: 5,
    comment: 'Excellent property, would recommend!'
  }]);

// Fetch reviews for listing
const { data: reviews } = await supabase
  .from('reviews')
  .select('*')
  .eq('listing_id', listingId);

// Calculate average rating
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
```

---

## 🔑 Client Initialization

### Supabase Client Setup

Located in: `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

---

## 🔐 Row-Level Security (RLS) Policies

### Setup RLS for Secure Data Access

```sql
-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow public read for verified users
CREATE POLICY "Public can read verified profiles"
  ON profiles FOR SELECT
  USING (verified = true);

-- Enable RLS on inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users can read own inquiries
CREATE POLICY "Users can read own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = sender_email::uuid OR auth.uid() = owner_id);

-- Users can create inquiries
CREATE POLICY "Authenticated users can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can read all reviews
CREATE POLICY "Public can read all reviews"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📝 API Usage Examples

### User Authentication Flow

```javascript
// src/context/AuthContext.tsx example usage

// 1. Sign up new user
await authContext.signUp(
  'newuser@example.com',
  'SecurePassword123!',
  'John Doe',
  'customer'
);
// Creates:
// - auth.users record
// - profiles record with specified role

// 2. Sign in
await authContext.signIn('newuser@example.com', 'SecurePassword123!');
// Returns: JWT token stored in localStorage

// 3. Access protected page after login
// AuthContext automatically fetches user profile
// Dashboard shows role-specific UI

// 4. Sign out
await authContext.signOut();
// Clears token and session
```

### Creating an Inquiry

```javascript
// Component: src/components/InquiryModal.tsx

const submitInquiry = async (formData) => {
  const { error } = await supabase
    .from('inquiries')
    .insert([{
      listing_id: propertyId,
      listing_type: 'property',
      sender_name: formData.name,
      sender_email: formData.email,
      sender_phone: formData.phone,
      message: formData.message,
      owner_id: ownerUserId,
      status: 'new'
    }]);

  if (!error) {
    // Success - show toast notification
    toast.success('Inquiry sent successfully!');
  }
};
```

### Fetching Owner Listings

```javascript
// Component: src/pages/DashboardPage.tsx

const fetchMyListings = async (userId: string) => {
  // Fetch user profile to get role-specific data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Fetch inquiries for owner
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  return { profile, inquiries };
};
```

### Real-Time Subscriptions

```javascript
// Listen for new inquiries in real-time
const subscription = supabase
  .from('inquiries')
  .on('*', payload => {
    console.log('New inquiry:', payload.new);
    // Update UI with new data
  })
  .subscribe();

// Cleanup
return () => subscription.unsubscribe();
```

---

## 🛠️ Environment Variables

### Required for Development
```
VITE_SUPABASE_PROJECT_ID="uhxhlzboktxqepohpgtk"
VITE_SUPABASE_URL="https://uhxhlzboktxqepohpgtk.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Optional for Features
```
# Analytics
VITE_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Error Tracking
VITE_SENTRY_DSN="https://..."

# Maps
VITE_GOOGLE_MAPS_API_KEY="AIzaSy..."

# Payment Processing
VITE_LANKAPPAY_MERCHANT_ID="..."
```

---

## 🧪 Testing Database Changes

### Test Signup Flow
```bash
# 1. Run dev server
npm run dev

# 2. Visit http://localhost:8080/auth
# 3. Fill signup form:
#    - Email: testuser@example.com
#    - Password: TestPass123!
#    - Name: Test User
#    - Role: customer

# 4. Verify in Supabase:
supabase> SELECT * FROM auth.users WHERE email = 'testuser@example.com';
supabase> SELECT * FROM profiles WHERE email = 'testuser@example.com';
```

### Test Inquiry Submission
```bash
# 1. After signup/login
# 2. Navigate to Property page
# 3. Click "Send Inquiry"
# 4. Fill form and submit
# 5. Check Supabase:
supabase> SELECT * FROM inquiries WHERE sender_email = 'testuser@example.com';
```

### Query Performance Testing
```sql
-- Check for missing indexes
EXPLAIN ANALYZE
SELECT * FROM inquiries WHERE owner_id = 'user-uuid' ORDER BY created_at DESC;

-- Create indexes if needed
CREATE INDEX idx_inquiries_owner_id ON inquiries(owner_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
```

---

## 📈 Scaling Considerations

### Database Optimization
- Add indexes on frequently queried columns
- Archive old inquiries (> 1 year) to archive table
- Partition large tables by date
- Monitor slow queries in Supabase dashboard

### Performance Tips
- Use pagination for large result sets
- Implement caching with Redis (optional)
- Use connection pooling
- Monitor database connections

---

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Client Lib](https://github.com/supabase/supabase-js)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: March 16, 2026  
**For Questions**: Check Supabase dashboard or review src/ code comments
