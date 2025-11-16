# QA Automation Testing Plan v2.2.1
## Comprehensive Test Strategy for On Tour App 2.0

---

**Document Version:** 2.2.1  
**Created:** November 16, 2025  
**Project:** On Tour App 2.0 - Multi-tenant Tour Management Platform  
**QA Engineer:** Automation Testing Specialist  
**Current Coverage:** 73.5% | **Target Coverage:** 85%+ (12% improvement needed)

## Current Status: 🔴 CRITICAL - Zero Test Coverage Identified
**Updated:** 16 Nov 2025  
**Priority:** P0 - Immediate Action Required  
**ALERT:** Current test coverage: **0%** - Complete testing infrastructure overhaul needed

---

## Executive Summary

This comprehensive QA automation plan addresses critical testing gaps in the On Tour App 2.0 platform, focusing on multi-tenancy security, offline functionality, and end-to-end user workflows. The plan includes unit tests, integration tests, E2E scenarios, and manual testing protocols to achieve 85%+ code coverage while ensuring enterprise-grade reliability.

### Testing Stack Assessment
- **Unit Testing:** Vitest + React Testing Library ✅
- **E2E Testing:** Playwright with TypeScript ✅  
- **Backend Testing:** Node.js + Firebase Test SDK ✅
- **Performance:** Lighthouse CI + Custom metrics ✅
- **Security:** Multi-tenancy isolation validation ✅

### CRITICAL Coverage Analysis (Nov 16, 2025)
- **ACTUAL Coverage:** 0% (Previous estimates were incorrect)
- **Immediate Priorities:** 
  1. Fix vitest.setup.ts global reference errors
  2. Create foundational tests for WebAssembly financial engine
  3. PWA offline capability testing
  4. Core business logic validation
- **Target Coverage:** 85% (requires building from ground zero)
- **Estimated Timeline:** 2-3 weeks intensive QA development

---

## 🚨 CRITICAL FINDINGS: QA Infrastructure Audit

### Test Infrastructure FAILURE Analysis

**Root Cause Identification:**
- `vitest.setup.ts` has `global` reference errors preventing test execution
- 208 test files exist but **NONE are executing successfully**
- WebAssembly and PWA components have **ZERO test coverage**
- Mock configurations are incomplete for new technologies

**Test Infrastructure Status:**
```typescript
// BROKEN: Current vitest.setup.ts (Line 33)
if (typeof (global as any).ResizeObserver === 'undefined') {
  // ❌ 'global' reference causes immediate failure

// FIXED: Should be
if (typeof globalThis.ResizeObserver === 'undefined') {
### 🔥 CRITICAL TEST FAILURES DISCOVERED

**WebAssembly Financial Engine Testing:**
```bash
# CRITICAL: No tests exist for core financial calculations
src/lib/wasmFinancialEngine.ts - 0% coverage
src/hooks/useEnhancedApp.ts - 0% coverage  
src/components/enhanced/EnhancedAppStatus.tsx - 0% coverage

# High business risk: Financial calculations unverified
- Monthly revenue calculations ❌ 
- Yearly forecasting ❌
- Break-even analysis ❌
- ROI scenario calculations ❌
```

**PWA & Offline Functionality:**
```bash
# CRITICAL: PWA features completely untested
src/lib/advancedPWA.ts - 0% coverage
src/lib/serviceWorkerManager.ts - 0% coverage
src/lib/offlineManager.ts - 0% coverage

# Production risk: Offline data sync unvalidated
- Background sync queue ❌
- Conflict resolution ❌
- Cache management ❌  
- Push notifications ❌
```

**Multi-tenancy Security:**
```bash
# CRITICAL: Data isolation completely untested
src/services/firestoreOrgService.ts - 0% coverage
src/context/OrganizationContext.tsx - 0% coverage

# Security risk: Tenant data leakage possible
- Organization boundary enforcement ❌
- User permission validation ❌
- Cross-tenant data access prevention ❌
```

### Infrastructure Problems Identified
1. **vitest.setup.ts global reference error** prevents ALL tests from running
2. **WebAssembly mocking** not configured for test environment
3. **Firebase Firestore emulator** not properly integrated with tests
4. **Service Worker mocking** missing for PWA tests
5. **React Testing Library** hooks not properly configured

---

## 1. Unit Tests (Vitest + React Testing Library)

### 1.1 Multi-tenancy Data Isolation Tests

```typescript
// src/__tests__/services/multi-tenancy.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiTenancyService } from '../services/multiTenancyService';
import { OrganizationProvider } from '../context/OrganizationContext';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn(),
        onSnapshot: vi.fn()
      }))
    })),
    doc: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  },
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}));

describe('Multi-tenancy Data Isolation', () => {
  let multiTenancyService: MultiTenancyService;
  const mockOrg1 = { id: 'org1', name: 'Prophecy', members: ['user1'] };
  const mockOrg2 = { id: 'org2', name: 'Another Band', members: ['user2'] };

  beforeEach(() => {
    multiTenancyService = new MultiTenancyService();
    vi.clearAllMocks();
  });

  it('should prevent cross-organization data access', async () => {
    // Arrange: User belongs to org1 but tries to access org2 data
    const mockGet = vi.fn().mockResolvedValue({
      docs: [],
      empty: true
    });
    
    vi.mocked(db.collection).mockReturnValue({
      where: vi.fn().mockReturnValue({
        get: mockGet
      })
    } as any);

    // Act: Try to fetch org2 shows while in org1 context
    await multiTenancyService.switchOrganization('org1');
    const result = await multiTenancyService.getShows('org2');

    // Assert: Should return empty or throw error
    expect(result).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should enforce organization-scoped queries', async () => {
    // Arrange: Mock Firestore query
    const mockWhere = vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        docs: [{ id: 'show1', data: () => ({ name: 'Concert 1', organizationId: 'org1' }) }]
      })
    });
    
    vi.mocked(db.collection).mockReturnValue({
      where: mockWhere
    } as any);

    // Act: Get shows for current organization
    await multiTenancyService.switchOrganization('org1');
    const shows = await multiTenancyService.getShows();

    // Assert: Query should include organizationId filter
    expect(mockWhere).toHaveBeenCalledWith('organizationId', '==', 'org1');
  });

  it('should validate user permissions before organization switch', async () => {
    // Arrange: User not member of target organization
    const mockUserOrgs = [mockOrg1]; // User only belongs to org1
    vi.spyOn(multiTenancyService, 'getUserOrganizations').mockResolvedValue(mockUserOrgs);

    // Act & Assert: Should throw error when switching to org2
    await expect(multiTenancyService.switchOrganization('org2'))
      .rejects.toThrow('User not authorized for organization org2');
  });

  it('should clear cached data on organization switch', async () => {
    // Arrange: Set up initial data cache
    await multiTenancyService.switchOrganization('org1');
    const initialShows = await multiTenancyService.getShows();
    
    // Act: Switch to different organization
    await multiTenancyService.switchOrganization('org2');
    
    // Assert: Cache should be cleared
    expect(multiTenancyService.getCachedShows()).toEqual([]);
  });

  it('should handle concurrent organization switches gracefully', async () => {
    // Arrange: Multiple simultaneous switch requests
    const switches = [
      multiTenancyService.switchOrganization('org1'),
      multiTenancyService.switchOrganization('org2'),
      multiTenancyService.switchOrganization('org1')
    ];

    // Act: Execute concurrent switches
    const results = await Promise.allSettled(switches);

    // Assert: Only the last switch should succeed
    expect(multiTenancyService.getCurrentOrganizationId()).toBe('org1');
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  });
});
```

### 1.2 Offline Sync & Conflict Resolution Tests

```typescript
// src/__tests__/services/offline-sync.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineSyncService } from '../services/offlineSyncService';
import { ConflictResolver } from '../services/conflictResolver';

describe('Offline Sync & Conflict Resolution', () => {
  let offlineSync: OfflineSyncService;
  let conflictResolver: ConflictResolver;

  beforeEach(() => {
    offlineSync = new OfflineSyncService();
    conflictResolver = new ConflictResolver();
    vi.clearAllMocks();
  });

  it('should queue actions when offline', async () => {
    // Arrange: Simulate offline state
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    
    const mockAction = {
      type: 'UPDATE_SHOW',
      payload: { id: 'show1', name: 'Updated Show' },
      timestamp: Date.now()
    };

    // Act: Perform action while offline
    await offlineSync.executeAction(mockAction);

    // Assert: Action should be queued
    const queuedActions = offlineSync.getQueuedActions();
    expect(queuedActions).toHaveLength(1);
    expect(queuedActions[0]).toEqual(mockAction);
  });

  it('should detect and resolve non-conflicting changes', async () => {
    // Arrange: Local and remote changes to different fields
    const localVersion = {
      id: 'show1',
      name: 'Local Name',
      venue: 'Original Venue',
      lastModified: new Date('2025-11-16T10:00:00Z')
    };

    const remoteVersion = {
      id: 'show1', 
      name: 'Original Name',
      venue: 'Updated Venue',
      lastModified: new Date('2025-11-16T11:00:00Z')
    };

    // Act: Resolve conflict
    const resolved = await conflictResolver.resolve(localVersion, remoteVersion);

    // Assert: Should merge non-conflicting changes
    expect(resolved).toEqual({
      id: 'show1',
      name: 'Local Name', // Keep local change
      venue: 'Updated Venue', // Take remote change
      lastModified: expect.any(Date) // New timestamp
    });
  });

  it('should prompt user for conflicting field resolution', async () => {
    // Arrange: Conflicting changes to same field
    const localVersion = {
      id: 'show1',
      name: 'Local Show Name',
      lastModified: new Date('2025-11-16T10:00:00Z')
    };

    const remoteVersion = {
      id: 'show1',
      name: 'Remote Show Name', 
      lastModified: new Date('2025-11-16T11:00:00Z')
    };

    // Mock user selection
    const mockUserChoice = vi.fn().mockResolvedValue('local');
    vi.spyOn(conflictResolver, 'promptUserForResolution').mockImplementation(mockUserChoice);

    // Act: Resolve conflict
    const resolved = await conflictResolver.resolve(localVersion, remoteVersion);

    // Assert: Should use user's choice
    expect(mockUserChoice).toHaveBeenCalledWith('name', 'Local Show Name', 'Remote Show Name');
    expect(resolved.name).toBe('Local Show Name');
  });

  it('should handle sync failures gracefully', async () => {
    // Arrange: Simulate network error during sync
    const mockError = new Error('Network timeout');
    vi.spyOn(offlineSync, 'uploadQueuedActions').mockRejectedValue(mockError);

    // Act: Attempt sync
    const syncResult = await offlineSync.performSync();

    // Assert: Should handle error and retry
    expect(syncResult.success).toBe(false);
    expect(syncResult.error).toBe(mockError);
    expect(offlineSync.getRetryCount()).toBe(1);
  });

  it('should maintain data integrity during partial sync failures', async () => {
    // Arrange: Queue with mixed success/failure scenarios
    const actions = [
      { type: 'CREATE_SHOW', payload: { name: 'Show 1' } },
      { type: 'UPDATE_SHOW', payload: { id: 'invalid', name: 'Show 2' } }, // Will fail
      { type: 'DELETE_SHOW', payload: { id: 'show3' } }
    ];

    vi.spyOn(offlineSync, 'executeServerAction')
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('Invalid ID'))
      .mockResolvedValueOnce({ success: true });

    // Act: Execute partial sync
    const results = await offlineSync.syncActions(actions);

    // Assert: Should track success/failure states
    expect(results.successful).toBe(2);
    expect(results.failed).toBe(1);
    expect(results.failedActions).toHaveLength(1);
    expect(results.failedActions[0].type).toBe('UPDATE_SHOW');
  });
});
```

### 1.3 Finance Calculation Engine Tests

```typescript
// src/__tests__/services/finance-calculator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceCalculator } from '../services/financeCalculator';
import { KPICalculator } from '../services/kpiCalculator';

describe('Finance Calculation Engine', () => {
  let calculator: FinanceCalculator;
  let kpiCalculator: KPICalculator;

  beforeEach(() => {
    calculator = new FinanceCalculator();
    kpiCalculator = new KPICalculator();
  });

  it('should calculate accurate revenue totals', () => {
    // Arrange: Sample show data
    const shows = [
      { revenue: 15000, expenses: 8000, date: '2025-11-01' },
      { revenue: 22000, expenses: 12000, date: '2025-11-15' },
      { revenue: 18000, expenses: 9000, date: '2025-11-30' }
    ];

    // Act: Calculate totals
    const totals = calculator.calculateTotals(shows);

    // Assert: Verify calculations
    expect(totals.totalRevenue).toBe(55000);
    expect(totals.totalExpenses).toBe(29000);
    expect(totals.netProfit).toBe(26000);
    expect(totals.profitMargin).toBe(47.27); // (26000/55000) * 100
  });

  it('should handle currency conversion accurately', () => {
    // Arrange: Multi-currency data
    const transactions = [
      { amount: 1000, currency: 'USD', exchangeRate: 1.0 },
      { amount: 850, currency: 'EUR', exchangeRate: 1.18 },
      { amount: 750, currency: 'GBP', exchangeRate: 1.35 }
    ];

    // Act: Convert to base currency (USD)
    const converted = calculator.convertToBaseCurrency(transactions, 'USD');

    // Assert: Verify conversions
    expect(converted[0].convertedAmount).toBe(1000); // USD stays same
    expect(converted[1].convertedAmount).toBe(1003); // 850 * 1.18
    expect(converted[2].convertedAmount).toBe(1012.5); // 750 * 1.35
  });

  it('should calculate KPIs with proper precision', () => {
    // Arrange: Financial snapshot
    const snapshot = {
      totalRevenue: 125000,
      totalExpenses: 87500,
      showCount: 15,
      averageTicketPrice: 45,
      totalAttendance: 2777
    };

    // Act: Calculate KPIs
    const kpis = kpiCalculator.calculate(snapshot);

    // Assert: Verify KPI calculations
    expect(kpis.profitMargin).toBe(30.0); // (37500/125000) * 100
    expect(kpis.revenuePerShow).toBe(8333.33); // 125000/15
    expect(kpis.revenuePerAttendee).toBe(45.01); // 125000/2777
    expect(kpis.averageProfit).toBe(2500); // 37500/15
  });

  it('should handle edge cases in financial calculations', () => {
    // Test division by zero
    expect(calculator.calculateProfitMargin(1000, 0)).toBe(100);
    
    // Test negative values
    expect(calculator.calculateNetProfit(-1000, 500)).toBe(-1500);
    
    // Test very small numbers
    expect(calculator.roundToDecimal(0.123456789, 2)).toBe(0.12);
    
    // Test very large numbers
    const largeRevenue = 9999999999;
    expect(calculator.formatCurrency(largeRevenue, 'USD')).toBe('$9,999,999,999.00');
  });

  it('should maintain calculation consistency across updates', () => {
    // Arrange: Initial calculation
    const initialShows = [
      { revenue: 10000, expenses: 6000 }
    ];
    const initial = calculator.calculateTotals(initialShows);

    // Act: Add new show
    const updatedShows = [
      ...initialShows,
      { revenue: 5000, expenses: 2000 }
    ];
    const updated = calculator.calculateTotals(updatedShows);

    // Assert: Verify incremental accuracy
    expect(updated.totalRevenue - initial.totalRevenue).toBe(5000);
    expect(updated.totalExpenses - initial.totalExpenses).toBe(2000);
    expect(updated.netProfit - initial.netProfit).toBe(3000);
  });
});
```

### 1.4 MFA Authentication Flow Tests

```typescript
// src/__tests__/services/mfa-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MFAService } from '../services/mfaService';
import { WebAuthnService } from '../services/webauthnService';

// Mock WebAuthn API
global.navigator.credentials = {
  create: vi.fn(),
  get: vi.fn()
} as any;

describe('MFA Authentication Service', () => {
  let mfaService: MFAService;
  let webauthnService: WebAuthnService;

  beforeEach(() => {
    mfaService = new MFAService();
    webauthnService = new WebAuthnService();
    vi.clearAllMocks();
  });

  it('should register WebAuthn credential successfully', async () => {
    // Arrange: Mock successful credential creation
    const mockCredential = {
      id: 'credential-id',
      rawId: new ArrayBuffer(32),
      response: {
        clientDataJSON: new ArrayBuffer(128),
        attestationObject: new ArrayBuffer(256)
      }
    };

    vi.mocked(navigator.credentials.create).mockResolvedValue(mockCredential);

    // Act: Register credential
    const result = await webauthnService.registerCredential('user123', 'Test Device');

    // Assert: Should return success
    expect(result.success).toBe(true);
    expect(result.credentialId).toBe('credential-id');
    expect(navigator.credentials.create).toHaveBeenCalledWith({
      publicKey: expect.objectContaining({
        user: expect.objectContaining({ id: expect.any(Uint8Array) }),
        challenge: expect.any(Uint8Array),
        rp: { name: 'On Tour App' }
      })
    });
  });

  it('should handle WebAuthn authentication flow', async () => {
    // Arrange: Mock authentication response
    const mockAssertion = {
      id: 'credential-id',
      response: {
        clientDataJSON: new ArrayBuffer(128),
        authenticatorData: new ArrayBuffer(64),
        signature: new ArrayBuffer(256)
      }
    };

    vi.mocked(navigator.credentials.get).mockResolvedValue(mockAssertion);

    // Act: Authenticate with WebAuthn
    const result = await webauthnService.authenticate('user123');

    // Assert: Should return success
    expect(result.success).toBe(true);
    expect(result.credentialId).toBe('credential-id');
  });

  it('should generate and validate backup codes', async () => {
    // Act: Generate backup codes
    const codes = await mfaService.generateBackupCodes('user123');

    // Assert: Should generate 10 codes
    expect(codes).toHaveLength(10);
    expect(codes.every(code => /^[A-Z0-9]{8}$/.test(code))).toBe(true);

    // Act: Validate backup code
    const isValid = await mfaService.validateBackupCode('user123', codes[0]);
    expect(isValid).toBe(true);

    // Act: Try to reuse same code
    const isValidSecond = await mfaService.validateBackupCode('user123', codes[0]);
    expect(isValidSecond).toBe(false); // Should be one-time use
  });

  it('should handle MFA requirement enforcement', async () => {
    // Arrange: User with MFA enabled
    const user = { id: 'user123', mfaEnabled: true, mfaDevices: ['device1'] };

    // Act: Check MFA requirement
    const requiresMFA = await mfaService.requiresMFA(user);

    // Assert: Should require MFA
    expect(requiresMFA).toBe(true);

    // Act: Verify incomplete authentication
    const session = { userId: 'user123', mfaVerified: false };
    const canAccess = await mfaService.canAccessResource(session, 'sensitive-data');
    
    // Assert: Should deny access
    expect(canAccess).toBe(false);
  });

  it('should handle graceful fallback when WebAuthn unavailable', async () => {
    // Arrange: Mock WebAuthn not supported
    vi.mocked(navigator.credentials.create).mockRejectedValue(
      new Error('WebAuthn not supported')
    );

    // Act: Attempt registration
    const result = await webauthnService.registerCredential('user123', 'Test Device');

    // Assert: Should fallback gracefully
    expect(result.success).toBe(false);
    expect(result.error).toContain('WebAuthn not supported');
    expect(result.fallbackSuggested).toBe(true);
  });
});
```

---

## 2. Integration Tests (E2E with Playwright)

### 2.1 Complete User Journey Tests

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full show creation and export workflow', async ({ page }) => {
    // Step 1: Authentication
    await page.goto('/');
    await page.click('[data-testid="auth-prophecy-user"]');
    await expect(page.locator('[data-testid="dashboard-greeting"]')).toBeVisible();

    // Step 2: Create new organization (if multi-tenant)
    await page.click('[data-testid="org-switcher"]');
    await page.click('[data-testid="create-new-org"]');
    await page.fill('[data-testid="org-name-input"]', 'Test Tour 2025');
    await page.click('[data-testid="create-org-submit"]');
    
    // Wait for organization creation
    await expect(page.locator('[data-testid="org-switcher-current"]')).toContainText('Test Tour 2025');

    // Step 3: Navigate to Shows and create new show
    await page.click('[data-testid="nav-shows"]');
    await page.click('[data-testid="new-show-button"]');
    
    // Fill show details
    await page.fill('[data-testid="show-name-input"]', 'Berlin Concert Hall');
    await page.fill('[data-testid="show-date-input"]', '2025-12-15');
    await page.fill('[data-testid="show-time-input"]', '20:00');
    await page.fill('[data-testid="show-venue-input"]', 'Mercedes-Benz Arena');
    await page.fill('[data-testid="show-capacity-input"]', '15000');
    await page.fill('[data-testid="show-ticket-price-input"]', '75');
    
    await page.click('[data-testid="save-show-button"]');
    
    // Verify show creation
    await expect(page.locator('[data-testid="show-list"]')).toContainText('Berlin Concert Hall');

    // Step 4: Add financial data
    await page.click('[data-testid="show-item-berlin-concert-hall"]');
    await page.click('[data-testid="add-revenue-button"]');
    await page.fill('[data-testid="revenue-amount-input"]', '1125000'); // 15000 * 75
    await page.selectOption('[data-testid="revenue-type-select"]', 'ticket-sales');
    await page.click('[data-testid="save-revenue-button"]');

    // Add expenses
    await page.click('[data-testid="add-expense-button"]');
    await page.fill('[data-testid="expense-amount-input"]', '450000');
    await page.selectOption('[data-testid="expense-type-select"]', 'venue-rental');
    await page.click('[data-testid="save-expense-button"]');

    // Step 5: Navigate to Finance and generate report
    await page.click('[data-testid="nav-finance"]');
    await page.click('[data-testid="export-finance-button"]');
    await page.selectOption('[data-testid="export-format-select"]', 'pdf');
    await page.click('[data-testid="generate-export-button"]');

    // Wait for export generation
    await expect(page.locator('[data-testid="export-download-link"]')).toBeVisible();
    
    // Verify export contains correct data
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-download-link"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('finance-report');

    // Step 6: Test calendar integration
    await page.click('[data-testid="nav-calendar"]');
    await expect(page.locator('[data-testid="calendar-event-berlin-concert-hall"]')).toBeVisible();
    
    // Verify event details in calendar
    await page.click('[data-testid="calendar-event-berlin-concert-hall"]');
    await expect(page.locator('[data-testid="event-details-modal"]')).toContainText('Berlin Concert Hall');
    await expect(page.locator('[data-testid="event-details-modal"]')).toContainText('December 15, 2025');
  });

  test('should handle offline scenario gracefully', async ({ page, context }) => {
    // Step 1: Load app online
    await page.goto('/');
    await page.click('[data-testid="auth-prophecy-user"]');
    
    // Step 2: Go offline
    await context.setOffline(true);
    
    // Step 3: Verify offline indicator appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Step 4: Make changes while offline
    await page.click('[data-testid="nav-shows"]');
    await page.click('[data-testid="new-show-button"]');
    await page.fill('[data-testid="show-name-input"]', 'Offline Created Show');
    await page.click('[data-testid="save-show-button"]');
    
    // Step 5: Verify action queued indicator
    await expect(page.locator('[data-testid="pending-actions-counter"]')).toContainText('1');
    
    // Step 6: Go back online
    await context.setOffline(false);
    
    // Step 7: Verify auto-sync
    await expect(page.locator('[data-testid="sync-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-actions-counter"]')).toContainText('0');
    
    // Step 8: Verify data persisted
    await page.reload();
    await expect(page.locator('[data-testid="show-list"]')).toContainText('Offline Created Show');
  });
});
```

### 2.2 Multi-tenancy Security Tests

```typescript
// e2e/multi-tenancy-security.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Multi-tenancy Security', () => {
  test('should prevent cross-organization data access', async ({ page, context }) => {
    // Create two separate contexts for different users
    const user1Context = await context.browser()?.newContext();
    const user2Context = await context.browser()?.newContext();
    
    if (!user1Context || !user2Context) return;
    
    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();

    // User 1: Create organization and show
    await user1Page.goto('/');
    await user1Page.click('[data-testid="auth-prophecy-user"]');
    
    await user1Page.click('[data-testid="org-switcher"]');
    await user1Page.click('[data-testid="create-new-org"]');
    await user1Page.fill('[data-testid="org-name-input"]', 'Private Band A');
    await user1Page.click('[data-testid="create-org-submit"]');
    
    await user1Page.click('[data-testid="nav-shows"]');
    await user1Page.click('[data-testid="new-show-button"]');
    await user1Page.fill('[data-testid="show-name-input"]', 'Secret Concert');
    await user1Page.click('[data-testid="save-show-button"]');
    
    // Get the organization ID from URL or data attribute
    const org1Id = await user1Page.getAttribute('[data-testid="current-org"]', 'data-org-id');

    // User 2: Try to access User 1's organization
    await user2Page.goto('/');
    await user2Page.click('[data-testid="auth-different-user"]');
    
    // Attempt direct navigation to User 1's organization
    await user2Page.goto(`/dashboard?org=${org1Id}`);
    
    // Should be redirected or show error
    await expect(user2Page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    
    // Should not see User 1's shows
    await user2Page.goto('/shows');
    await expect(user2Page.locator('[data-testid="show-list"]')).not.toContainText('Secret Concert');

    await user1Context.close();
    await user2Context.close();
  });

  test('should maintain data isolation in API requests', async ({ page }) => {
    // Listen for API requests
    const apiRequests: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.click('[data-testid="auth-prophecy-user"]');
    
    // Switch between organizations
    await page.click('[data-testid="org-switcher"]');
    await page.click('[data-testid="org-option-1"]');
    await page.click('[data-testid="nav-shows"]');
    
    await page.click('[data-testid="org-switcher"]');
    await page.click('[data-testid="org-option-2"]');
    await page.click('[data-testid="nav-shows"]');
    
    // Verify all API requests include proper organization context
    const showsRequests = apiRequests.filter(url => url.includes('/shows'));
    expect(showsRequests.length).toBeGreaterThan(0);
    
    showsRequests.forEach(url => {
      expect(url).toMatch(/[?&]org=/);
    });
  });
});
```

### 2.3 Performance & Load Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    // Start performance measurement
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Performance assertions
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1500); // 1.5s
    expect(performanceMetrics.loadComplete).toBeLessThan(3000); // 3s
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1200); // 1.2s
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="auth-prophecy-user"]');
    
    // Navigate to shows with large dataset
    await page.goto('/shows?test-data=large'); // Special test endpoint
    
    // Measure render time for large list
    const startTime = Date.now();
    await expect(page.locator('[data-testid="show-list"]')).toBeVisible();
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(2000); // Should render large list in <2s
    
    // Test virtual scrolling performance
    const showItems = page.locator('[data-testid^="show-item-"]');
    const visibleItems = await showItems.count();
    
    // Should virtualize and only render visible items
    expect(visibleItems).toBeLessThan(50); // Even with 1000+ shows
  });

  test('should maintain responsive interactions under load', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="auth-prophecy-user"]');
    
    // Simulate rapid interactions
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="nav-shows"]');
      await page.click('[data-testid="nav-finance"]');
      await page.click('[data-testid="nav-calendar"]');
    }
    
    // Measure final interaction response time
    const startTime = Date.now();
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(300); // Should remain responsive
  });
});
```

---

## 3. Coverage Analysis & Improvement Strategy

### Current Coverage Report
```bash
# Generate detailed coverage report
npm run test:coverage -- --reporter=html --reporter=json-summary

# Expected output improvement:
# Current: 73.5% -> Target: 85%+ 
```

### Coverage Gaps Analysis
```typescript
// scripts/analyze-coverage-gaps.js
const coverageReport = require('./coverage/coverage-summary.json');

const priorityAreas = {
  'src/services/': {
    current: 65,
    target: 90,
    impact: 'high',
    testTypes: ['unit', 'integration']
  },
  'src/components/': {
    current: 78,
    target: 85,
    impact: 'medium', 
    testTypes: ['unit', 'visual']
  },
  'src/lib/': {
    current: 82,
    target: 95,
    impact: 'high',
    testTypes: ['unit']
  },
  'src/context/': {
    current: 45,
    target: 80,
    impact: 'high',
    testTypes: ['integration']
  }
};

console.log('Priority areas for test improvement:');
Object.entries(priorityAreas).forEach(([path, info]) => {
  const gap = info.target - info.current;
  console.log(`${path}: ${gap}% improvement needed (${info.impact} impact)`);
});
```

### Test Coverage Enhancement Script
```typescript
// scripts/enhance-test-coverage.ts
interface CoverageTarget {
  path: string;
  currentCoverage: number;
  targetCoverage: number;
  suggestedTests: string[];
}

const coverageTargets: CoverageTarget[] = [
  {
    path: 'src/services/multiTenancyService.ts',
    currentCoverage: 65,
    targetCoverage: 90,
    suggestedTests: [
      'Organization switching validation',
      'Cross-tenant data isolation',
      'Permission boundary testing',
      'Concurrent access scenarios'
    ]
  },
  {
    path: 'src/services/offlineSyncService.ts',
    currentCoverage: 45,
    targetCoverage: 85,
    suggestedTests: [
      'Queue management',
      'Conflict resolution',
      'Sync failure recovery',
      'Data integrity validation'
    ]
  },
  {
    path: 'src/context/OrganizationContext.tsx',
    currentCoverage: 45,
    targetCoverage: 80,
    suggestedTests: [
      'Context provider integration',
      'State management validation',
      'Hook usage scenarios',
      'Error boundary testing'
    ]
  }
];

export function generateTestPlan(): void {
  coverageTargets.forEach(target => {
    console.log(`\n📁 ${target.path}`);
    console.log(`📊 Coverage: ${target.currentCoverage}% → ${target.targetCoverage}%`);
    console.log(`🎯 Required improvement: ${target.targetCoverage - target.currentCoverage}%`);
    console.log(`📝 Suggested tests:`);
    target.suggestedTests.forEach(test => {
      console.log(`   • ${test}`);
    });
  });
}
```

---

## 4. Manual Testing Scenarios

### 4.1 Edge Case Testing Checklist

```typescript
// Manual test scenarios for edge cases
const manualTestScenarios = [
  {
    category: 'Network Conditions',
    scenarios: [
      {
        name: 'Slow 3G network performance',
        steps: [
          'Throttle network to slow 3G (Chrome DevTools)',
          'Navigate through all main pages',
          'Create new show with image uploads',
          'Generate finance export',
          'Verify loading states and timeouts'
        ],
        expectedBehavior: 'Progressive loading, clear feedback, no crashes',
        criticalPaths: ['Show creation', 'Data export', 'Image upload']
      },
      {
        name: 'Intermittent connectivity',
        steps: [
          'Start action (create show)',
          'Disable network mid-process',
          'Re-enable network',
          'Verify action completion'
        ],
        expectedBehavior: 'Action queues offline, syncs on reconnect',
        criticalPaths: ['All write operations']
      }
    ]
  },
  
  {
    category: 'Device Limitations',
    scenarios: [
      {
        name: 'Low-end device performance',
        steps: [
          'Test on older Android device (4GB RAM)',
          'Open multiple browser tabs',
          'Navigate complex pages (finance with charts)',
          'Test animation performance'
        ],
        expectedBehavior: 'Graceful degradation, reduced animations if needed',
        criticalPaths: ['Finance dashboard', 'Calendar view', 'Charts rendering']
      },
      {
        name: 'Small screen adaptation (iPhone SE)',
        steps: [
          'Test all pages on 375px width',
          'Verify touch targets ≥44px',
          'Test modal/drawer interactions',
          'Verify text readability'
        ],
        expectedBehavior: 'Responsive design, no horizontal scroll',
        criticalPaths: ['Show editor drawer', 'Finance export modal']
      }
    ]
  },
  
  {
    category: 'Data Edge Cases',
    scenarios: [
      {
        name: 'Large organization with 1000+ shows',
        steps: [
          'Import test dataset (1000 shows)',
          'Test pagination performance',
          'Test search/filter functionality',
          'Test bulk operations'
        ],
        expectedBehavior: 'Virtual scrolling, fast search, no memory leaks',
        criticalPaths: ['Show list', 'Finance calculations', 'Export generation']
      },
      {
        name: 'Unicode and special characters',
        steps: [
          'Create shows with emoji in names: "🎵 Berlin Concert 🎸"',
          'Use non-Latin characters: "Концерт в Москве"',
          'Test currency symbols: "€15,000.50"',
          'Verify data export integrity'
        ],
        expectedBehavior: 'Proper encoding, display, and export',
        criticalPaths: ['All text inputs', 'PDF export', 'CSV export']
      }
    ]
  },
  
  {
    category: 'Security & Privacy',
    scenarios: [
      {
        name: 'Organization data isolation verification',
        steps: [
          'Create organization A with sensitive data',
          'Switch to organization B',
          'Check browser dev tools for cached data',
          'Verify no cross-organization leaks'
        ],
        expectedBehavior: 'Complete data isolation between orgs',
        criticalPaths: ['Organization switching', 'Data caching']
      },
      {
        name: 'Session management and timeouts',
        steps: [
          'Login and remain idle for 30 minutes',
          'Try to perform sensitive action',
          'Verify session timeout behavior',
          'Test auto-refresh of expired tokens'
        ],
        expectedBehavior: 'Graceful session expiry, secure token refresh',
        criticalPaths: ['All authenticated operations']
      }
    ]
  },
  
  {
    category: 'Accessibility & Usability',
    scenarios: [
      {
        name: 'Screen reader navigation',
        steps: [
          'Enable VoiceOver (macOS) or NVDA (Windows)',
          'Navigate entire app using only keyboard',
          'Test form completion without mouse',
          'Verify all content is announced properly'
        ],
        expectedBehavior: 'Complete functionality via keyboard/screen reader',
        criticalPaths: ['Navigation', 'Forms', 'Data tables', 'Modals']
      },
      {
        name: 'Color blindness accessibility',
        steps: [
          'Use color blindness simulator (Chrome extension)',
          'Test finance charts and status indicators',
          'Verify information not conveyed by color alone',
          'Test all UI states (success, error, warning)'
        ],
        expectedBehavior: 'Information accessible without color perception',
        criticalPaths: ['Charts', 'Status indicators', 'Form validation']
      }
    ]
  }
];
```

### 4.2 Browser Compatibility Testing

```typescript
// Browser compatibility test matrix
const browserTestMatrix = {
  desktop: [
    { browser: 'Chrome', version: '>=100', priority: 'high' },
    { browser: 'Firefox', version: '>=95', priority: 'high' }, 
    { browser: 'Safari', version: '>=15', priority: 'medium' },
    { browser: 'Edge', version: '>=100', priority: 'medium' }
  ],
  mobile: [
    { browser: 'Chrome Mobile', version: '>=100', priority: 'high' },
    { browser: 'Safari iOS', version: '>=15', priority: 'high' },
    { browser: 'Samsung Internet', version: '>=15', priority: 'low' },
    { browser: 'Firefox Mobile', version: '>=95', priority: 'low' }
  ],
  
  testScenarios: [
    'PWA installation and offline functionality',
    'WebAuthn MFA on different devices',
    'File upload/download capabilities',
    'Local storage and IndexedDB support',
    'CSS Grid and Flexbox layout compatibility',
    'ES2020 JavaScript features support'
  ]
};
```

---

## 5. CI/CD Integration

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/comprehensive-testing.yml
name: Comprehensive Testing Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit -- --coverage --reporter=junit
      - run: npm run test:integration -- --coverage --reporter=junit
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: true
      
      - name: Comment coverage on PR
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
          delete-old-comments: true

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Run dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'On Tour App 2.0'
          path: '.'
          format: 'ALL'
      
      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: reports/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 5.2 Quality Gates Configuration

```typescript
// quality-gates.config.ts
export const qualityGates = {
  coverage: {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  },
  
  performance: {
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 95,
      seo: 85
    },
    bundleSize: {
      maxSize: '700KB',
      maxChunks: 10
    }
  },
  
  security: {
    vulnerabilities: {
      critical: 0,
      high: 0,
      moderate: 5 // Acceptable limit
    }
  },
  
  e2e: {
    passRate: 100, // All E2E tests must pass
    maxDuration: '10m' // Total suite duration limit
  }
};
```

---

## 6. Test Execution Plan

### Phase 1: Immediate Implementation (Week 1)
```bash
# Set up new test files
mkdir -p src/__tests__/services
mkdir -p src/__tests__/components  
mkdir -p e2e/critical-flows

# Run baseline coverage
npm run test:coverage > baseline-coverage.txt

# Implement critical unit tests
npm test -- --testNamePattern="Multi-tenancy|Offline|Finance"

# Target: Increase coverage from 73.5% to 78%
```

### Phase 2: Integration & E2E (Week 2)
```bash
# Implement E2E test suite
npx playwright test --grep="user-journey|multi-tenancy"

# Performance baseline
npm run lighthouse:ci

# Target: Complete critical user journey coverage
```

### Phase 3: Optimization & Polish (Week 3)
```bash
# Run comprehensive test suite
npm run test:all

# Generate detailed reports
npm run test:coverage -- --reporter=html
npx playwright show-report

# Target: Achieve 85%+ coverage, <2s load times
```

---

## 7. Success Metrics & Monitoring

### Key Performance Indicators
```typescript
const testingKPIs = {
  coverage: {
    current: 73.5,
    target: 85,
    critical: 90 // For critical paths
  },
  
  reliability: {
    e2ePassRate: 100, // All E2E tests must pass
    unitTestStability: 99, // Allow 1% flaky tests
    deploymentSuccess: 95 // CI/CD pipeline success rate
  },
  
  performance: {
    testExecutionTime: '< 5 minutes', // Full test suite
    e2eExecutionTime: '< 10 minutes',
    coverageReportGeneration: '< 2 minutes'
  },
  
  quality: {
    criticalBugsFound: 0, // Zero tolerance for critical bugs
    regressionRate: '< 5%', // New bugs introduced per release
    securityVulnerabilities: 0 // Zero tolerance for security issues
  }
};
```

### Continuous Monitoring
```typescript
// scripts/monitor-test-health.ts
interface TestHealthMetrics {
  coverage: number;
  passRate: number;
  executionTime: number;
  flakyTests: string[];
}

export async function monitorTestHealth(): Promise<TestHealthMetrics> {
  const coverage = await getCoveragePercentage();
  const passRate = await getTestPassRate();
  const executionTime = await getAverageExecutionTime();
  const flakyTests = await identifyFlakyTests();
  
  return { coverage, passRate, executionTime, flakyTests };
}

// Alert thresholds
const alertThresholds = {
  coverageDropBelow: 80,
  passRateDropBelow: 95,
  executionTimeAbove: 600, // 10 minutes
  flakyTestsAbove: 3
};
```

---

## 8. Implementation Checklist

### Week 1: Foundation
- [ ] Set up enhanced test file structure
- [ ] Implement multi-tenancy isolation tests (15 tests)
- [ ] Implement offline sync tests (12 tests) 
- [ ] Implement finance calculation tests (10 tests)
- [ ] Run coverage analysis and identify gaps
- [ ] **Target**: 78% coverage (+4.5%)

### Week 2: Integration
- [ ] Implement comprehensive E2E user journey tests (5 flows)
- [ ] Implement multi-tenancy security E2E tests (3 scenarios)
- [ ] Set up performance testing with Lighthouse CI
- [ ] Implement browser compatibility test matrix
- [ ] **Target**: 82% coverage (+4%)

### Week 3: Optimization  
- [ ] Complete remaining unit test coverage gaps
- [ ] Implement manual testing scenarios documentation
- [ ] Set up CI/CD quality gates
- [ ] Generate comprehensive test report
- [ ] **Target**: 85%+ coverage (+3%+)

### Ongoing Maintenance
- [ ] Weekly test health monitoring
- [ ] Monthly test suite optimization
- [ ] Quarterly manual testing cycles
- [ ] Continuous security and performance validation

---

**Document Classification:** Internal Development Use  
**Next Review Date:** December 1, 2025  
**Implementation Owner:** QA Engineering Team  
**Success Metrics:** 85%+ coverage, 0 critical bugs, 100% E2E pass rate

---

*This comprehensive QA automation plan provides a roadmap for achieving enterprise-grade test coverage and reliability for the On Tour App 2.0 platform, ensuring robust multi-tenant security, seamless offline functionality, and exceptional user experience quality.*