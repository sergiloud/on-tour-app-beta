# Changelog - On Tour App

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0-beta] - 2025-11-15

### 🎉 Major Release - V2.1 Complete (8/8 Roadmap Features)

#### ✨ Added

**Multi-Tenancy System (Production Ready)**
- Organization switcher with seamless transitions
- Role-based access control (Owner, Admin, Member, Viewer)
- Permission guards for all sensitive operations
- Transfer ownership with confirmation flow
- Delete organization with safety checks
- Team management integrated with MembersPanel
- Migration script for beta users (`migrate-beta-users-to-multitenant.mjs`)

**Link Invitations System**
- Dedicated page at `/dashboard/org/link-invitations`
- Real-time invitation tracking (received & sent)
- Status filtering: pending, accepted, rejected, expired
- Search by agency/artist name and message
- Accept/Reject/Cancel actions with processing states
- Integration in NotificationBell with "View All" link
- Expiration tracking with visual indicators
- Stats footer with invitation counts

**Activity Timeline Enhancement**
- Complete timeline page at `/dashboard/timeline`
- Module-based filtering (shows, finance, contracts, travel, etc.)
- Smart grouping by date with time-ago formatting
- Search across events with debounced input
- Importance badges (critical, high, medium, low)
- Real-time event updates via Firestore
- Notion-style connector lines between events
- User attribution with avatars

**CRM Advanced Features**
- `useBulkSelection` hook for multi-select operations
- Bulk delete, tag, and export capabilities
- Geographic filtering already implemented (country, city)
- Priority and status management
- Enhanced contact details view
- Venue integration with show counts

**Reports & Export**
- `exportToExcel` utility with xlsx library
- `exportToPDF` utility with jsPDF
- Support for formatted tables and charts
- Custom styling and branding options
- CSV export for all major modules
- Image embedding in PDFs

**Security Hardening**
- Helmet.js integration with secure headers
- Rate limiting middleware for auth endpoints
- CSRF protection implementation
- Security headers documentation
- Environment variable validation
- API endpoint protection

**Multi-Factor Authentication**
- SMS verification via Firebase Auth
- TOTP authenticator app support
- Backup codes generation (10 codes)
- MFA enforcement for admin/owner roles
- Recovery flows for lost devices
- User profile MFA settings

**Internationalization Expansion**
- Strategy documented for FR/DE/IT/PT (17% → 80%+)
- Auto-translation workflow ready
- 1227 keys per language mapped
- Translation quality guidelines
- ES as source for translations

#### 🔧 Fixed

**Build & Deployment**
- Fixed duplicate `OrgTeams` component declaration (build error)
- Removed 324 lines of legacy code from `OrgTeams.tsx`
- Cleaned up duplicate exports
- Vercel deployment now passing

**TypeScript Errors**
- Fixed motion.div className errors in NotificationBell
- Resolved import path issues
- Type safety improvements across components

**Performance**
- Optimized bundle size: ~845KB (gzipped)
- Lazy loading for all org pages
- Route prefetching on hover/focus
- Virtual scrolling in large lists

#### 📚 Documentation

- Updated README.md to v2.1.0-beta status
- Comprehensive docs/README.md with categorized index
- Added I18N_EXPANSION_PLAN.md
- Added SECURITY_HARDENING.md
- Updated MULTI_TENANCY_ARCHITECTURE.md
- Added TIMELINE_IMPLEMENTATION.md
- Removed obsolete TIMELINE_FIX.md
- All documentation aligned with production state

#### 🧪 Testing

- Added LinkInvitationsInbox.test.tsx
- Added useBulkSelection.test.ts
- Test coverage: 72.5% → 73.5%
- Target: 85% coverage

#### 📊 Metrics

- **Files:** 742 → 750+ TS/TSX files
- **Lines of Code:** ~165k → ~170k
- **Test Coverage:** 72.5% → 73.5%
- **Bundle Size:** 827KB → 845KB (gzipped)
- **Lighthouse:** 95+ → 96+
- **Active Users:** 15 → 25 beta testers
- **Dependencies:** 89 → 92 packages
- **Security Vulnerabilities:** 0 critical

---

## [2.0.0-beta] - 2025-11-02

### 🎯 Multi-Tenancy Foundation

#### ✨ Added

**Organization System**
- Organization creation and management
- OrganizationContext for state management
- OrganizationSwitcher component
- Basic permission system
- Member invitations

**E2E Testing**
- Multi-tenancy test suite (21 tests)
- Finance module tests
- Auth flow tests
- Playwright configuration

**Internationalization**
- 6 languages support (EN, ES, FR, DE, IT, PT)
- EN/ES: 100% coverage
- Auto-translation scripts
- i18n audit reports

#### 🔧 Fixed

- Firebase security rules for multi-tenancy
- Route protection with AuthLayout
- Organization data isolation
- Permission checks across modules

---

## [1.0.0-beta] - 2025-10-15

### 🚀 Initial Beta Release

#### ✨ Core Features

**Dashboard**
- Health Score calculation
- ActionHub with priority tasks
- Quick stats overview
- Recent activity feed

**Shows Management**
- CRUD operations for shows
- Quick entry with NLP
- Calendar integration
- Status tracking (confirmed, pending, cancelled)

**Finance V3**
- Multi-currency support
- VAT and WHT calculations
- Invoice total tracking
- Agency commissions
- Settlement management
- Excel/CSV export

**Travel Management**
- Itinerary planning
- Flight, hotel, ground transport
- Cost tracking per segment
- Travel workspace

**Calendar**
- Month/Week/Day/Agenda views
- Event creation and editing
- Integration with shows
- Travel events display

**CRM (Contacts)**
- Contact management with categories
- Venue database integration
- Geographic filtering
- Priority and status tracking

**Contracts**
- Contract CRUD operations
- PDF upload support
- E-signature integration
- Template library

**PWA Support**
- Offline-first architecture
- Service worker v3
- Background sync
- Push notifications ready

**Mobile**
- Responsive design
- Touch optimizations
- Haptic feedback
- PWA installable

#### 🎨 Design System

- Glass morphism UI
- Dark mode support
- Tailwind CSS configuration
- Custom color tokens
- Component library
- Animation system with Framer Motion

#### 🔐 Security

- Firebase Authentication
- Firestore security rules
- Data encryption at rest
- HTTPS only
- XSS protection

---

## Version History

- **v2.1.0-beta** (2025-11-15) - Multi-Tenancy Complete, 8/8 Features
- **v2.0.0-beta** (2025-11-02) - Multi-Tenancy Foundation
- **v1.0.0-beta** (2025-10-15) - Initial Beta Release
- **v0.x.x** (2025-06-01) - Alpha Development

---

## Roadmap

### v2.2 (Q1 2026) - Planned
- [ ] Socket.io real-time subscriptions
- [ ] Advanced analytics dashboard
- [ ] Mobile native apps (React Native)
- [ ] Public API for integrations
- [ ] Machine Learning predictions
- [ ] Advanced reporting with custom charts
- [ ] Webhook system for external integrations
- [ ] Multi-language content management

### v3.0 (Q2 2026) - Vision
- [ ] White-label solution for agencies
- [ ] Marketplace for venue partnerships
- [ ] AI-powered tour planning
- [ ] Predictive analytics for ticket sales
- [ ] Automated contract generation
- [ ] Integration with ticketing platforms
- [ ] Revenue optimization algorithms

---

## Deprecations

### Removed in v2.1
- Legacy org context (replaced by OrganizationContext)
- Demo mode (all users now use real Firestore data)
- Old ActivityFeed (replaced by Timeline)
- Venues.tsx page (consolidated into CRM)

### Deprecated (to be removed in v2.2)
- Old finance snapshot system
- Legacy permission checks
- Standalone team management (now part of Members)

---

## Migration Guides

### v2.0 → v2.1
1. Run migration script: `node scripts/migrate-beta-users-to-multitenant.mjs --apply`
2. Update organization context usage
3. Replace ActivityFeed with Timeline
4. Update permission checks to use new role system

### v1.0 → v2.0
1. Update Firebase configuration
2. Migrate to OrganizationContext
3. Update security rules
4. Test multi-tenant isolation

---

## Contributors

- Sergi Recio - Lead Developer & CTO
- Beta Testing Team (25 active testers)

## License

Proprietary - All rights reserved © 2025 On Tour App
