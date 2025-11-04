# ⚡ QUICK START - E2E TESTING

**Installation Status**: ✅ Complete  
**Build Status**: ✅ Clean  
**Ready to Execute**: ✅ Yes

---

## 🚀 Get First Tests Running in 60 Minutes

### Terminal 1: Start Dev Server

```bash
cd /Users/sergirecio/Documents/On\ Tour\ App\ 2.0/on-tour-app
npm run dev
# Keep this running in background
```

Wait for:

```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Edit: Add Selectors to Login Component

Find your login component and add these 5 attributes:

```tsx
<form data-testid="login-form">
  <input data-testid="email-input" type="email" />
  <input data-testid="password-input" type="password" />
  <button data-testid="login-submit" type="submit">
    Login
  </button>
  <button data-testid="logout-btn">Logout</button>
  {error && <div data-testid="error-message">{error}</div>}
</form>
```

### Terminal 2: Run Tests

```bash
cd /Users/sergirecio/Documents/On\ Tour\ App\ 2.0/on-tour-app
npm run test:e2e
```

### View Results

```bash
npx playwright show-report
```

---

## 📋 Common Commands

```bash
# Run all tests
npm run test:e2e

# Interactive UI (watch mode)
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- e2e/auth/login.spec.ts

# Run with grep filter
npm run test:e2e -- --grep "login"

# View HTML report
npx playwright show-report
```

---

## 📁 Files & Locations

```
Config:
  playwright.config.ts

Tests:
  e2e/auth/login.spec.ts (12 tests)

Fixtures:
  e2e/fixtures/auth.fixtures.ts
  e2e/fixtures/data.fixtures.ts

Docs:
  docs/IMMEDIATE_ACTION_ITEMS.md (step-by-step)
  docs/PLAYWRIGHT_INSTALLATION_COMPLETE.md (full guide)
  docs/WEEK_4_FINAL_STATUS.md (details)
```

---

## ✅ Success = When You See

```
Running 12 tests...
✓ chromium › Authentication › should login with valid credentials
✓ chromium › Authentication › should handle invalid credentials
✓ chromium › Authentication › should require email field
✓ chromium › Authentication › should require password field
✓ chromium › Authentication › should logout successfully
✓ chromium › Authentication › should block access to protected pages
✓ chromium › Authentication › should persist session on page reload
✓ chromium › Authentication › should keep separate logins for multiple users
✓ chromium › Fixture-based tests › should use authenticatedPage
✓ chromium › Fixture-based tests › should use adminPage
✓ chromium › Fixture-based tests › should use viewerPage
✓ chromium › Fixture-based tests › should coordinate fixtures

12 passed (45s)
```

---

## ❌ Common Issues

**"Element with selector not found"**

- Add data-testid to component
- Verify spelling matches exactly
- Check element exists with: `document.querySelector('[data-testid="..."]')`

**"Cannot find module @playwright/test"**

- Playwright already installed ✅
- Run: `npm install` to ensure node_modules current

**"Dev server not responding"**

- Verify `npm run dev` is running in Terminal 1
- Visit http://localhost:5173 in browser
- Wait 30 seconds for full startup

**"Timeout waiting for server"**

- Increase timeout in playwright.config.ts (already set to 180s)
- Or start dev server separately before running tests

---

## 🎯 Next After First Tests Pass

1. ✅ Review HTML report
2. ✅ Read IMMEDIATE_ACTION_ITEMS.md for next steps
3. ✅ Create Show lifecycle tests
4. ✅ Create Filtering tests
5. ✅ Expand to 50+ total E2E tests

---

## 📞 Where to Get Help

- **Setup problems**: `docs/IMMEDIATE_ACTION_ITEMS.md`
- **Commands**: `docs/PLAYWRIGHT_INSTALLATION_COMPLETE.md`
- **Detailed info**: `docs/WEEK_4_FINAL_STATUS.md`
- **Architecture**: `docs/E2E_TESTING_SETUP_GUIDE.md`

---

**Ready? Let's go!** 🚀

Start Terminal 1 → Add selectors → Run Terminal 2 → View results

**Estimated time: 60 minutes to first passing E2E test**
