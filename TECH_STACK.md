# Pearl Hub Pearl Hub - Tech Stack Documentation

**Platform:** Pearl Hub Vehicle/Property/Event/Business Management Platform  
**Last Updated:** March 16, 2026  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [Frontend Technology Stack](#frontend-technology-stack)
2. [Backend & Database](#backend--database)
3. [Cloud Infrastructure](#cloud-infrastructure)
4. [Development Tools](#development-tools)
5. [Integration Points](#integration-points)
6. [Architecture Overview](#architecture-overview)

---

## 🎨 Frontend Technology Stack

### Core Framework
- **React 18.x** - UI library
  - Hooks-based components (useState, useEffect, useContext)
  - Context API for state management
  - Functional components throughout

- **TypeScript 5.x** - Type safety
  - Strict mode enabled
  - Interface-based component props
  - Type-safe API responses

### Styling & UI Components
- **Tailwind CSS 3.x** - Utility-first CSS
  - Custom color palette (sapphire, ruby, emerald, gold, pearl)
  - Responsive grid system
  - Dark mode support

- **Shadcn/UI** - Accessible component library
  - Dialog (modal)
  - Button, Input, Label
  - Select, Textarea
  - Built on Radix UI primitives

- **Lucide React** - Icon library
  - Consistent icon set
  - 24x24 default size
  - Icons used: Edit2, Trash2, Loader2, Plus, Settings, etc.

### Animation & Interactions
- **Framer Motion** - Motion library
  - Page transitions
  - Modal animations
  - Hover effects
  - Stagger animations for lists

### Form Handling
- **React Hook Form** - Form state management
  - Minimal re-renders
  - Efficient field updates
  - Built-in validation support

### Data Visualization
- **Leaflet** - Map library
  - Interactive maps
  - Markers and clusters
  - Geolocation support

### Build Tool
- **Vite 5.x** - Module bundler
  - Fast development server
  - Optimized production builds
  - HMR (Hot Module Replacement)

---

## 🔧 Backend & Database

### Backend Services
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (JWT-based)
  - Storage (bucket for images)
  - Edge functions (optional)

### Database (PostgreSQL)

#### Core Tables with Full CRUD
1. **profiles** - User account information
   - user_id (FK to auth.users)
   - role (customer, owner, broker, admin, stay_provider, vehicle_provider, event_organizer, sme)
   - full_name, email, phone, avatar_url
   - verification_status, created_at

2. **stay_listings** - Accommodation listings
   - title, description, price_per_night
   - location, stay_type (star_hotel, villa, guest_house, hostel, lodge)
   - amenities (array), images (array)
   - rooms, max_guests, rating
   - user_id (provider), provider_name
   - RLS: Users see own + all active listings

3. **vehicle_listings** - Vehicle rental listings
   - make, model, year, vehicle_type
   - daily_rate, seats, fuel_type, transmission
   - location, description, images
   - ac, driver_availability, km_included, excess_km_rate
   - RLS: Users see own + all active listings

4. **event_listings** - Event management
   - title, category, event_date, event_time
   - venue, location, capacity
   - standard_price, premium_price, vip_price
   - description, images
   - organizer_name, booked_seats (JSON)
   - RLS: Users see own + all active listings

5. **provider_configs** - Provider backend configuration
   - user_id (FK to auth.users)
   - provider_type (stay_provider, vehicle_provider, event_organizer, sme)
   - business_name, registration_number
   - contact_person, contact_email, contact_phone
   - address, city, country, postal_code
   - commission_rate, payment_partner
   - status (active, pending, inactive), verified
   - documents (JSONB), settings (JSONB)
   - UNIQUE(user_id, provider_type)
   - RLS: Users see own, admins see all

#### Supporting Tables
- **properties** - Property listings
- **bookings** - Booking/reservation records
- **reviews** - User reviews and ratings
- **transactions** - Payment records
- **compliance_docs** - Document storage

### Authentication
- **Supabase Auth** (JWT-based)
  - Email/password authentication
  - Magic link support
  - Session management
  - PKCE flow for security

### Row-Level Security (RLS)
- Database enforces access control at row level
- Policies for each table and operation
- Admin bypass with role-based access
- User-specific data isolation

---

## ☁️ Cloud Infrastructure

### Hosting
- **Vercel** or **Netlify** - Frontend hosting
  - Automatic deployments from GitHub
  - CDN for static assets
  - Edge functions for API middleware
  - Environment variable management

### Database Hosting
- **Supabase Cloud** - PostgreSQL hosting
  - Managed backups
  - Point-in-time recovery
  - Connection pooling
  - Real-time features via websockets

### Storage
- **Supabase Storage**
  - Bucket: `listings` (images for stays, vehicles, events)
  - Bucket: `avatars` (user profile pictures)
  - Bucket: `documents` (verification documents)
  - Public/Private access control
  - CORS policy configured

### CDN
- **Vercel/Netlify CDN** for frontend assets
- **Supabase Storage CDN** for image optimization

---

## 🛠️ Development Tools

### Package Manager
- **npm** 9.x - Node package manager
- **506 total packages** installed

### Key Dependencies
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "@supabase/supabase-js": "^2.x",
  "framer-motion": "^10.x",
  "@radix-ui/react-dialog": "^1.x",
  "lucide-react": "^0.x",
  "react-hook-form": "^7.x",
  "leaflet": "^1.x"
}
```

### Code Quality
- **ESLint** - Linting
- **TypeScript** - Static type checking
- **Prettier** - Code formatting

### Development Environment
- **Vite Dev Server** - Local development (http://localhost:5173)
- **npm run dev** - Start development server
- **npm run build** - Production build
- **npm run preview** - Preview production build

### Version Control
- **Git** - Source code management
- **GitHub** - Repository hosting

---

## 🔗 Integration Points

### External APIs
1. **LankaPay** (Optional)
   - Payment processing gateway
   - Commission settlements
   - Webhook notifications

2. **Google Maps API** (Optional)
   - Geocoding
   - Route optimization
   - Location search

3. **Email Service** (Optional)
   - Supabase Email / Resend
   - Notification emails
   - Verification emails

### Webhooks
- **Supabase Webhooks**
  - Database changes trigger cloud functions
  - Image upload processing
  - Verification workflows

### Real-time Features
- **Supabase Realtime**
  - WebSocket subscriptions
  - Live listing updates
  - Live booking confirmations

---

## 🏗️ Architecture Overview

### Component Hierarchy

```
App (index.tsx)
├── Providers
│   ├── AuthContext (user auth state)
│   ├── AppContext (global app state)
│   └── Theme Provider (dark mode)
│
├── Router (React Router)
│   ├── HomePage
│   ├── AuthPage
│   ├── DashboardPage
│   │   ├── ProviderConfigDashboard (NEW)
│   │   ├── AnalyticsDashboard
│   │   ├── RateManagement
│   │   └── [Other sections]
│   ├── StaysPage
│   │   └── ListStayModal (NEW)
│   ├── VehiclesPage
│   │   └── ListVehicleModal (NEW)
│   ├── EventsPage
│   │   └── ListEventModal (NEW)
│   ├── SocialPage
│   ├── PropertyPage
│   └── [Other pages]
│
└── Components
    ├── ImageUpload (FIXED)
    ├── LeafletMap
    ├── InquiryModal
    ├── LankaPayModal
    ├── ReviewSection
    ├── ComparisonTool
    ├── ShareButtons
    ├── TrustBanner
    └── [Other components]
```

### Data Flow

```
User Action
    ↓
React Component (useState/useContext)
    ↓
Form Validation (client-side)
    ↓
Supabase Client Library
    ↓
PostgreSQL Database (with RLS)
    ↓
JWT Token Verification
    ↓
RLS Policy Check
    ↓
Query Execution / Response
    ↓
Component State Update
    ↓
UI Re-render
```

### Authentication Flow

```
User Signup/Login
    ↓
Supabase Auth (email/password)
    ↓
JWT Token Generated
    ↓
Token Stored in localStorage
    ↓
AuthContext Provides Global Access
    ↓
Protected Routes Check Token
    ↓
Automatic Redirect if Not Authenticated
```

### File Upload Flow

```
User Selection (Input File)
    ↓
ImageUpload Component
    ↓
File Validation (size, type)
    ↓
Supabase Storage Upload
    ↓
Progress Bar Update
    ↓
Public URL Generation
    ↓
URL Stored in Database
    ↓
Image Display in UI
```

---

## 📊 Database Schema Relationships

```
auth.users (Supabase)
    ↓ (1:1)
profiles
    ├─→ (1:N) stay_listings
    ├─→ (1:N) vehicle_listings
    ├─→ (1:N) event_listings
    ├─→ (1:1) provider_configs
    ├─→ (1:N) reviews
    ├─→ (1:N) bookings
    └─→ (1:N) transactions

stay_listings
    ├─→ (1:N) reviews
    └─→ (1:N) bookings

vehicle_listings
    ├─→ (1:N) reviews
    └─→ (1:N) bookings

event_listings
    ├─→ (1:N) reviews
    └─→ (1:N) bookings
```

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based token authentication
- Role-based access control (RBAC)
- Email verification
- 2FA support (future)

### Database Security
- Row-Level Security (RLS) on all tables
- Encrypted connections (SSL/TLS)
- Audit logging
- Automated backups

### Data Protection
- CORS policy enforcement
- CSRF protection
- XSS prevention (React auto-escapes)
- SQL injection prevention (parameterized queries)

### API Security
- Rate limiting (optional)
- Request validation
- Output encoding
- Error message sanitization

---

## 📈 Performance Optimization

### Frontend
- Code splitting with Vite
- Tree shaking
- Image lazy loading
- Component memoization (React.memo)

### Backend
- Database indexes on frequently queried columns
- Connection pooling
- Query optimization
- Caching (future)

### Network
- CDN for static assets
- Image optimization
- Gzip compression
- HTTP/2 push

---

## 🚀 Deployment Architecture

```
GitHub Repository
    ↓
Webhook Trigger
    ↓
CI/CD Pipeline (Vercel/Netlify)
    ↓
    ├── Build Process
    │   ├── npm install
    │   ├── npm run build
    │   └── Type checking
    │
    ├── Tests (optional)
    │
    └── Deploy to CDN
        ↓
    Vercel/Netlify Servers
        ↓
    Global CDN Distribution
```

---

## 📦 Bundle Size

### Production Build
- **Main Bundle:** 624.73 KB (gzip: 192.40 KB)
- **DashboardPage:** 497.78 KB (gzip: 127.74 KB)
- **ReviewSection:** 34.00 KB (gzip: 11.91 KB)
- **VehiclesPage:** 32.25 KB (gzip: 8.48 KB)
- **EventsPage:** 23.99 KB (gzip: 6.49 KB)
- **StaysPage:** 22.54 KB (gzip: 6.38 KB)
- **Total Modules Transformed:** 2976

---

## 🔄 Version Management

### Environment Variables

**Development (.env.local)**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=eyJhxxxxx
VITE_API_URL=http://localhost:5173
```

**Production (.env.production)**
```
VITE_SUPABASE_URL=https://prod-xxxx.supabase.co
VITE_SUPABASE_KEY=eyJhxxxxx-prod
VITE_API_URL=https://pearlhub.lk
```

---

## 📚 Technology Selection Rationale

### Why React?
- Large ecosystem
- Component reusability
- Strong community
- Excellent tooling

### Why TypeScript?
- Type safety reduces bugs
- Better IDE support
- Self-documenting code
- Enterprise-grade

### Why Tailwind?
- Rapid UI development
- Consistent design system
- Low CSS overhead
- Highly customizable

### Why Supabase?
- Open source
- Real-time capabilities
- Built on PostgreSQL
- Affordable pricing
- Easy scalability

### Why Vercel?
- Optimized for Next/React
- Excellent UX
- Fast deployments
- Global CDN
- Serverless functions

---

## 🔄 Future Tech Considerations

1. **Next.js** - For better performance and SSR
2. **GraphQL** - For flexible data querying
3. **Redis** - For caching layer
4. **Kubernetes** - For scalable deployment
5. **WebSockets** - Already supported via Supabase Realtime
6. **PWA** - Progressive Web App capabilities
7. **Stripe** - Enhanced payment processing

---

**Last Updated:** March 16, 2026  
**Maintainer:** Pearl Hub Development Team
