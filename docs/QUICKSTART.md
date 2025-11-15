# 🚀 On Tour App - Quickstart Guide

**Version:** 2.1.0-beta  
**Last Updated:** November 15, 2025  
**For:** Developers joining the project

---

## ⚡ Quick Setup (5 minutes)

### Prerequisites

- **Node.js:** 22.x (use nvm: `nvm use`)
- **npm:** 10.x
- **Firebase Account:** For authentication & database
- **Git:** For version control

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/sergiloud/on-tour-app-beta
cd on-tour-app-beta

# Install dependencies
npm install --legacy-peer-deps

# Time: ~2 minutes
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# Required variables:
# - VITE_FIREBASE_API_KEY
# - VITE_FIREBASE_AUTH_DOMAIN
# - VITE_FIREBASE_PROJECT_ID
# - VITE_FIREBASE_STORAGE_BUCKET
# - VITE_FIREBASE_MESSAGING_SENDER_ID
# - VITE_FIREBASE_APP_ID
```

**Firebase Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication → Email/Password
4. Enable Firestore Database
5. Copy config from Project Settings → Web App
6. Paste into `.env`

### 3. Run Development Server

```bash
npm run dev

# Opens at http://localhost:5173
# Time: ~5 seconds
```

---

## 📱 Available Scripts

### Development
```bash
npm run dev              # Start dev server (Vite)
npm run dev:host         # Dev server accessible on network
npm run preview          # Preview production build
```

### Building
```bash
npm run build            # Production build
npm run build:analyze    # Build + bundle analyzer
```

### Testing
```bash
npm test                 # Run unit tests (Vitest)
npm run test:ui          # Test UI with Vitest UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests (Playwright)
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues
npm run type-check       # TypeScript check
npm run format           # Format with Prettier
```

### Firebase
```bash
npm run firebase:emulators    # Start Firebase emulators
npm run firebase:deploy       # Deploy to Firebase
```

---

## 🏗️ Project Structure

```
on-tour-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Shared components
│   │   ├── organization/   # Multi-tenancy components
│   │   └── crm/           # CRM-specific components
│   ├── pages/              # Route pages
│   │   ├── dashboard/     # Dashboard pages
│   │   └── org/          # Organization pages
│   ├── context/            # React Contexts (state)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic & API
│   ├── lib/                # Utilities & helpers
│   ├── types/              # TypeScript definitions
│   └── styles/             # Global styles
├── docs/                   # Documentation
├── e2e/                    # E2E tests (Playwright)
├── public/                 # Static assets
└── scripts/                # Build & utility scripts
```

---

## 🎯 Key Concepts

### 1. Multi-Tenancy

The app uses **organization-based multi-tenancy**:

```typescript
// Access current organization
import { useOrganizationContext } from '@/context/OrganizationContext';

const { currentOrg, currentRole, canManageMembers } = useOrganizationContext();
```

**Roles:**
- `owner` - Full control, can transfer ownership
- `admin` - Manage members, settings, data
- `member` - Create/edit data
- `viewer` - Read-only access

### 2. State Management

**Context for UI & Auth:**
```typescript
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
```

**React Query for Server State:**
```typescript
import { useContactsQuery } from '@/hooks/useContactsQuery';

const { data: contacts, isLoading } = useContactsQuery();
```

**Custom Stores for Specific Needs:**
```typescript
import { showStore } from '@/shared/showStore';
import { contactStore } from '@/shared/contactStore';
```

### 3. Routing

```typescript
// Lazy-loaded routes
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Shows = lazy(() => import('@/pages/dashboard/Shows'));

// Protected routes with AuthLayout
<Route path="/dashboard/*" element={<AuthLayout><DashboardLayout /></AuthLayout>}>
  <Route path="shows" element={<Suspense><Shows /></Suspense>} />
</Route>
```

### 4. Internationalization

```typescript
import { t } from '@/lib/i18n';
import { useSettings } from '@/context/SettingsContext';

const { lang, setLang } = useSettings();

// Use translations
<h1>{t('dashboard.title')}</h1>

// 6 languages: EN, ES, FR, DE, IT, PT
```

### 5. Firebase Integration

```typescript
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Query with organization isolation
const showsRef = collection(db, `organizations/${orgId}/shows`);
const q = query(showsRef, where('status', '==', 'confirmed'));
const snapshot = await getDocs(q);
```

---

## 🔥 Common Tasks

### Creating a New Page

```bash
# 1. Create page component
touch src/pages/dashboard/MyNewPage.tsx

# 2. Add lazy import in AppRouter.tsx
const MyNewPage = lazy(() => import('@/pages/dashboard/MyNewPage'));

# 3. Add route
<Route path="my-page" element={<Suspense><MyNewPage /></Suspense>} />

# 4. Add navigation link in DashboardLayout.tsx
<NavLink to="/dashboard/my-page">My Page</NavLink>
```

### Adding a New Hook

```typescript
// src/hooks/useMyHook.ts
import { useState, useEffect } from 'react';

export function useMyHook() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Your logic
  }, []);
  
  return { data };
}
```

### Adding Translations

```typescript
// src/lib/i18n.ts
export const TRANSLATIONS = {
  en: {
    'myFeature.title': 'My Feature',
    'myFeature.description': 'Description here',
  },
  es: {
    'myFeature.title': 'Mi Característica',
    'myFeature.description': 'Descripción aquí',
  },
  // ... FR, DE, IT, PT
};
```

### Creating a New Service

```typescript
// src/services/myService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';

export class MyService {
  static async create(orgId: string, data: any) {
    const ref = collection(db, `organizations/${orgId}/myCollection`);
    return await addDoc(ref, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  static async getAll(orgId: string) {
    const ref = collection(db, `organizations/${orgId}/myCollection`);
    const snapshot = await getDocs(query(ref));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
```

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Clear Vite cache
rm -rf .vite dist
npm run build
```

### Firebase Connection Issues

```bash
# Check .env file has all required variables
cat .env | grep VITE_FIREBASE

# Test Firebase connection
npm run firebase:test
```

### TypeScript Errors

```bash
# Run type check
npm run type-check

# Generate types
npm run generate:types
```

### Test Failures

```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts

# Update snapshots
npm test -- -u
```

---

## 📚 Next Steps

1. **Read Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Review Multi-Tenancy:** [MULTI_TENANCY_ARCHITECTURE.md](./MULTI_TENANCY_ARCHITECTURE.md)
3. **Check Security:** [SECURITY.md](./SECURITY.md)
4. **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
5. **User Guide:** [USER_GUIDE.md](./USER_GUIDE.md)

---

## 🆘 Getting Help

- **Documentation:** `/docs` folder
- **Code Comments:** Inline JSDoc comments
- **GitHub Issues:** [Report bugs or request features](https://github.com/sergiloud/on-tour-app-beta/issues)
- **Team Chat:** Slack workspace (beta testers only)

---

## 📝 Contributing

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes with conventional commits
3. Run tests: `npm test`
4. Submit PR to `main` branch

**Commit Convention:**
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

**Happy Coding! 🚀**
