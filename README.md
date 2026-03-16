# Pearl Hub 🌴 - Integrated Travel & Events Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Build Status](https://img.shields.io/badge/Build-Passing-success)](#)

Pearl Hub is a modern, comprehensive platform for booking and managing stays, vehicles, events, and professional expertise services. Built with React + TypeScript + Supabase, it provides a seamless experience for both providers and customers.

---

## 🎯 Features

### 🏠 Stays Management
- Browse and book vacation rentals, guest houses, and residential properties
- Providers can add listings with amenities (WiFi, AC, Pool, Gym, Spa, etc.)
- Image uploads (up to 5 per listing) with drag-and-drop support
- Full CRUD operations for stay listings

### 🚗 Vehicles Management
- Rent cars, motorcycles, and other transport options
- Detailed vehicle specifications (make, model, year, transmission, fuel)
- Dynamic pricing with automatic excess KM rate calculation
- Image uploads (up to 6 per vehicle)
- Complete vehicle lifecycle management

### 🎭 Events Management
- Browse concerts, sports, theater, cinema, and conference events
- Multi-tier pricing (Standard, Premium, VIP)
- Capacity management and date/time scheduling
- Image uploads (up to 3 promotional images)

### 🔧 Provider Configuration Dashboard
- Business profile management
- Commission rate settings
- Payment partner selection
- Admin verification workflow
- Multi-provider support (Stay, Vehicle, Event, SME)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18.x+ | npm 9.x+ | Git 2.x+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/anasbikes1992-ui/PeralHub.lk.git
cd PeralHub.lk

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Add: VITE_SUPABASE_URL=your_url
# Add: VITE_SUPABASE_ANON_KEY=your_key

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

---

## 📚 Documentation

- **[Tech Stack](./TECH_STACK.md)** - Technology overview (500+ lines)
- **[Setup Guide](./IMPLEMENTATION_SETUP_GUIDE.md)** - Installation & deployment (500+ lines)
- **[Testing Guide](./TESTING_DEPLOYMENT_GUIDE.md)** - Testing procedures (400+ lines)
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What was built (300+ lines)
- **[GitHub Upload](./GITHUB_UPLOAD_INSTRUCTIONS.md)** - Push to GitHub guide

---

## 🏗️ Architecture

```
Frontend:        React 18 + TypeScript + Tailwind CSS
Styling:         Shadcn/UI + Lucide Icons  
Backend:         Supabase PostgreSQL
Auth:            JWT Email/Password
Storage:         Supabase Storage Buckets
Deployment:      Vercel/Netlify
```

---

## 📊 Build Status

| Metric | Value |
|--------|-------|
| Modules | 2,976 ✅ |
| TypeScript Errors | 0 ✅ |
| Build Time | 11.20s ✅ |
| Bundle Size | 624.73 KB |

---

## 🔄 Development Workflow

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Create optimized build
npm run preview      # Preview production build

# Deployment
vercel              # Deploy to Vercel
netlify deploy      # Deploy to Netlify
```

---

## 🚀 Deploy to Vercel (2 steps)

```bash
npm i -g vercel
vercel
# Follow prompts, add env variables, deploy!
```

---

## 🗄️ Database Setup

```bash
# 1. Create Supabase project (free at supabase.com)
# 2. Run migrations in Supabase SQL Editor:
#    - MIGRATION_CREATE_LISTING_TABLES.sql
#    - MIGRATION_PROVIDER_CONFIG.sql
# 3. Create storage buckets: listings, avatars
# 4. Add API credentials to .env.local
```

---

## 🧪 Testing

### Test Scenarios (8 included)
1. Stay Provider Workflow
2. Vehicle Provider Workflow  
3. Event Organizer Workflow
4. SME Role Access
5. Role-Based Access Control
6. Image Upload System
7. Form Validation
8. Error Handling

**Full guide:** See [TESTING_DEPLOYMENT_GUIDE.md](./TESTING_DEPLOYMENT_GUIDE.md)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ImageUpload not working | Check bucket name in Supabase Storage |
| Auth failing | Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| RLS permission denied | Run MIGRATION_PROVIDER_CONFIG.sql |
| Build fails | `rm -rf node_modules && npm install` |

---

## 📈 New Features (v1.0.0)

- ✅ ProviderConfigDashboard component (450+ lines)
- ✅ ImageUpload fixes in all modals
- ✅ Comprehensive form validation
- ✅ Database provider_configs table
- ✅ Admin verification workflow
- ✅ Complete documentation suite

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes (ensure `npm run build` passes, 0 errors)
4. Submit pull request with description

---

## 📞 Support

- **Quick Start:** [IMPLEMENTATION_SETUP_GUIDE.md](./IMPLEMENTATION_SETUP_GUIDE.md)
- **Tech Stack:** [TECH_STACK.md](./TECH_STACK.md)
- **Issues:** [GitHub Issues](https://github.com/anasbikes1992-ui/PeralHub.lk/issues)

---

## 📄 License

MIT License - see LICENSE for details

---

## 🎯 Version

**Current:** v1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** March 16, 2026

---

<div align="center">

### Made with ❤️ for Travel & Events in Sri Lanka

[Live Demo](https://pearlhub.lk) • [Docs](./IMPLEMENTATION_SETUP_GUIDE.md) • [Issues](https://github.com/anasbikes1992-ui/PeralHub.lk/issues)

⭐ If you find this useful, please star us!

</div>
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
