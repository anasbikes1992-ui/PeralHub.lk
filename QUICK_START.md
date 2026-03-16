# Pearl Hub - Quick Start Guide

**Get Pearl Hub running locally in 5 minutes!**

---

## ⚡ Fastest Setup

```bash
# 1. Navigate to project
cd D:\pearlhub.lk2\pearlhub.lk2.new

# 2. Install dependencies (if not already done)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit: http://localhost:8080
```

✅ **Done!** Application is now running.

---

## 🔍 First Time Walkthrough

### Step 1: Explore Homepage (1 min)
- [ ] Application loads at http://localhost:8080
- [ ] Hero section visible with search bar
- [ ] See category cards: Properties, Stays, Vehicles, Events
- [ ] Scroll down to see trust indicators and statistics

### Step 2: Browse Categories (2 min)
- [ ] Click "Properties" - view property listings
- [ ] Click "Stays" - view accommodation options
- [ ] Click "Vehicles" - see vehicle rentals with RealTimeTracker
- [ ] Click "Events" - view event/cinema listings
- [ ] Click "Social" - view community posts

### Step 3: Create Account (1 min)
Click "Sign In" or "Dashboard" → "Sign Up"

**Fill signup form:**
- Email: `test@example.com`
- Password: `TestPass123!`
- Full Name: `Test User`
- Role: Select one:
  - `Customer` (browse & book)
  - `Owner` (list properties)
  - `Broker` (multiple properties)
  - `Admin` (manage platform)
  - `Stay Provider` (hotels/villas)
  - `Event Organizer` (events)
  - `SME` (business listing)

### Step 4: Verify Account (1 min)
- Account created in Supabase
- Profile automatically created
- Returns to dashboard
- See role-specific UI

### Step 5: Test Features (varies)
- [ ] Update profile in Settings
- [ ] Send inquiry from Property page
- [ ] View received inquiries in Dashboard
- [ ] Submit review
- [ ] Check dark mode toggle

---

## 📂 Project Structure

```
pearlhub.lk2.new/
├── src/
│   ├── pages/              # 16+ page components
│   ├── components/         # 17 reusable components
│   ├── context/            # Auth & App state
│   ├── integrations/       # Supabase client
│   ├── App.tsx             # Main routing
│   └── main.tsx            # Entry point
├── public/                 # Images, assets
├── dist/                   # Production build
├── .env                    # Supabase credentials
├── vite.config.ts          # Build config
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
└── README.md               # Original docs
```

---

## 🎯 Key Pages & Their Purpose

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | / | Landing page with search |
| **Property** | /property | Property listings & details |
| **Stays** | /stays | Hotel/accommodation booking |
| **Vehicles** | /vehicles | Car rental with GPS tracker |
| **Events** | /events | Cinema/event tickets |
| **Social** | /social | Community posts & comments |
| **Dashboard** | /dashboard | Role-based user dashboard |
| **Auth** | /auth | Login/signup page |
| **Settings** | /settings | User profile settings |
| **Search** | /search | Search results |

---

## 🔐 Test Credentials (For Testing)

After signing up via `/auth`, you'll have a test account. To test different roles:

**Method 1: Multiple Accounts**
- Create separate account for each role in `/auth`
- Switch roles in settings (if allowed)

**Method 2: Direct Database** (for testing)
```sql
-- Log into Supabase SQL Editor
UPDATE profiles SET role = 'admin' WHERE email = 'test@example.com';
-- Page reload reverts to 'customer' - this is for testing only
```

---

## 📱 Testing Different Devices

### Desktop (1920x1080)
```bash
npm run dev
# Open DevTools (F12) → Device Toolbar disabled
```

### Tablet (768x1024)
```
DevTools → Device Toolbar → Select iPad/Tablet
```

### Mobile (375x667)
```
DevTools → Device Toolbar → Select iPhone
```

### Real Mobile Device
```
Get your IP: ipconfig (Windows) / ifconfig (Mac/Linux)
Visit: http://YOUR_IP:8080
Test on phone connected to same WiFi
```

---

## 🐛 Common Issues & Fixes

### "Cannot find module or its corresponding type declarations"
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### "VITE_SUPABASE_URL is undefined"
```
Check: .env file exists and has VITE_ prefix
Check: vite.config.ts defines these environment variables
Restart dev server after .env changes
```

### "Port 8080 already in use"
```bash
# Find process on port 8080
netstat -ano | findstr :8080

# Kill process (Windows - get PID from above)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### "Cannot connect to Supabase"
```
1. Verify .env file has correct URL
2. Check internet connection
3. Verify Supabase project is active
4. Check browser Network tab for failed requests
5. Review Supabase logs (https://app.supabase.com)
```

### "Build fails with TypeScript error"
```bash
# Check TypeScript errors
npm run build

# Fix errors in VS Code (usually shows squiggly lines)
# Then retry: npm run build
```

---

## 🚀 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for type errors
npm run type-check

# Format code
npm run format

# Lint code
npm run lint

# Install new dependency
npm install package-name

# Update all dependencies
npm update
```

---

## 📊 Development Workflow

### Daily Workflow
1. **Start day**: `npm run dev`
2. **Make changes**: Edit files in src/
3. **Hot reload**: Changes appear automatically
4. **Test**: Browse http://localhost:8080
5. **Check console**: Press F12 to see errors

### Before Committing
```bash
npm run build      # Verify production build works
npm run lint        # Check code quality
npm run type-check  # Verify TypeScript
```

### Deploying
```bash
npm run build       # Create dist/ folder
# Push to GitHub → Auto-deploy via Vercel/Netlify
```

---

## 🧪 Testing Checklist

### ✅ Basic Functionality
- [ ] Homepage displays without errors
- [ ] All pages can be navigated to
- [ ] Images load correctly
- [ ] Dark mode toggle works
- [ ] Mobile responsive

### ✅ User Authentication
- [ ] Signup creates account
- [ ] Login works with correct password
- [ ] Logout clears session
- [ ] Password reset works
- [ ] Profile page shows user data

### ✅ User Interactions
- [ ] Can submit inquiry form
- [ ] Can submit review
- [ ] Can update profile
- [ ] Can toggle favorites
- [ ] Can filter/search listings

### ✅ Real-Time Features
- [ ] Real-time tracker shows GPS movement
- [ ] Maps display correctly
- [ ] Notifications appear
- [ ] Comments load in real-time

### ✅ Browser Compatibility
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile browsers ✅

---

## 💡 Pro Tips

### Speed Up Development
1. **Use VS Code**: Built-in terminal, file explorer
2. **Enable TypeScript IntelliSense**: Full autocomplete
3. **Use React DevTools Extension**: Debug component state
4. **Use Network Throttling**: Test on slow connections
5. **Use Lighthouse**: Check performance

### Debug Common Issues
```javascript
// Add in components to debug state
console.log('Current user:', authContext.user);
console.log('Component props:', props);

// Check Supabase queries
supabase
  .from('inquiries')
  .select('*')
  .then(({ data, error }) => {
    console.log('Query result:', data, error);
  });
```

### Performance Optimization
```bash
# Check bundle size
npm run build -- --analyze

# Monitor build time
npm run build -- --debug

# Enable source maps for production debugging
# See vite.config.ts -> build.sourcemap
```

---

## 📚 Learning Resources

- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Vite Docs**: https://vitejs.dev/guide/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs

---

## 🆘 Need Help?

### Check These First
1. **Error Message**: Google the exact error
2. **Documentation**: Check files in root (`PRODUCTION_GUIDE.md`, `DEVELOPER_GUIDE.md`)
3. **Code Comments**: Read inline explanations in src/
4. **Browser Console**: F12 → Console tab
5. **Network Tab**: F12 → Network tab (check failed requests)

### Still Stuck?
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Clear cache: Delete `.vite` folder
3. Reinstall deps: `rm node_modules && npm install`
4. Check GitHub Issues: Original repo may have solutions

---

## 🎓 Next Steps After Setup

1. **Explore the Code**: Read src/components and src/pages
2. **Understand Authentication**: Review src/context/AuthContext.tsx
3. **Learn Supabase**: Connect to https://app.supabase.com
4. **Build Features**: Add new pages or components
5. **Deploy**: Follow PRODUCTION_GUIDE.md

---

**🎉 You're all set! Start hacking!**

*Last Updated: March 16, 2026*
