# 🧪 Component Testing Guide

**Status**: 408/449 tests passing (90.9%)
**Last Updated**: November 4, 2025
**Author**: GitHub Copilot

---

## Overview

This guide explains how to properly test React components in the On Tour App 2.0, including how to enable the 41 currently-skipped component tests.

## Current Test Infrastructure

### Test Utilities

All test utilities are centralized in `src/__tests__/test-utils.tsx`:

```typescript
// Basic component rendering with all providers
renderWithProviders(ui, options?)

// Component rendering at a specific route
renderWithProvidersAtRoute(ui, initialRoute, options?)

// Hook rendering with all providers
renderHookWithProviders(hook, options?)

// Selective provider wrapping
createRenderWithContexts(selectedContexts, queryClient?)
```

### Provider Hierarchy

Tests have access to all 9 context providers in proper order:

```
1. MemoryRouter (routing)
2. QueryClientProvider (data caching)
3. AuthProvider (authentication)
4. SettingsProvider (user settings)
5. OrgProvider (organization context)
6. DashboardProvider (dashboard state)
7. ShowModalProvider (modal state)
8. FinanceProvider (finance context)
9. HighContrastProvider (accessibility)
10. MissionControlProvider (mission state)
11. KPIDataProvider (KPI data)
```

## Enabling Skipped Component Tests

### Current Status: 41 Skipped Tests

**Categories:**

| Category           | Count | Examples                                                   |
| ------------------ | ----- | ---------------------------------------------------------- |
| ActionHub          | 4     | Tab switching, filters, kinds filtering                    |
| Shows Editor       | 8     | Undo/redo, accessibility, quick entry, enhancements        |
| UI Components      | 5     | Country select, language selector, KPI sparkline           |
| Navigation         | 2     | CTA navigation, language selector                          |
| Dashboard          | 2     | Import views error handling                                |
| Mission Control    | 2     | Mission HUD, persistence                                   |
| Other              | 6     | Various features                                           |
| Deprecated/Storage | 5     | useSettingsSync, fase3, i18n, e2e auth (have placeholders) |

### Process for Enabling a Test

#### Step 1: Identify the Test File

Find a test with `describe.skip()`:

```bash
grep -r "describe.skip" src/__tests__/*.tsx
```

#### Step 2: Analyze Provider Requirements

Read the test to understand which providers it needs. Look for:

- Context imports (e.g., `SettingsProvider`, `FinanceProvider`)
- Hooks used in tested component (e.g., `useSettings()`, `useFinance()`)
- Manual wrapper functions

**Example - Poor Provider Setup:**

```typescript
// ❌ Only wraps with 2 providers, component needs 9
const wrapper = (
  <MemoryRouter>
    <SettingsProvider>
      <Component />
    </SettingsProvider>
  </MemoryRouter>
);
```

#### Step 3: Fix Provider Wrapping

Replace manual wrappers with `renderWithProviders()`:

**Before (❌):**

```typescript
describe.skip('MyComponent', () => {
  it('does something', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <FinanceProvider>
            <MyComponent />
          </FinanceProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    // test code...
  });
});
```

**After (✅):**

```typescript
describe('MyComponent', () => {
  it('does something', () => {
    renderWithProviders(<MyComponent />);
    // test code...
  });
});
```

#### Step 4: Fix Any Assertion Issues

Component tests often have assertions that assume specific rendering behavior. You may need to:

1. **Add `await` for async rendering:**

```typescript
// ❌ Element might not be ready
expect(screen.getByText('Item')).toBeInTheDocument();

// ✅ Wait for async operations
expect(await screen.findByText('Item')).toBeInTheDocument();
```

2. **Use `queryBy` for optional elements:**

```typescript
// ❌ Fails if element doesn't exist
const element = screen.getByRole('button', { name: /Delete/i });

// ✅ Returns null if not found
const element = screen.queryByRole('button', { name: /Delete/i });
if (element) {
  expect(element).toBeInTheDocument();
}
```

3. **Mock external dependencies:**

```typescript
vi.mock('../services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}));
```

#### Step 5: Handle Provider-Specific Issues

Some providers require specific initialization:

**Finance Provider - Needs data:**

```typescript
// ✅ renderWithProviders includes QueryClient
// with default mock options
renderWithProviders(<Component />);
```

**Settings Provider - Needs language/theme:**

```typescript
// ✅ Settings Provider initializes with defaults
// Access via useSettings() hook in component
renderWithProviders(<Component />);
```

**Mission Control - Needs data setup:**

```typescript
// May need to seed initial data
beforeEach(() => {
  localStorage.setItem('mission:state', JSON.stringify({
    // initial state
  }));
});

renderWithProviders(<Component />);
```

#### Step 6: Run and Debug

```bash
npm run test:run -- src/__tests__/myComponent.test.tsx
```

**Common Errors:**

| Error                                  | Fix                                                  |
| -------------------------------------- | ---------------------------------------------------- |
| `Context must be used within Provider` | Use `renderWithProviders()` instead of manual render |
| `Element not found`                    | Use `findBy` or `getAllBy` with proper wait          |
| `act()` warnings                       | Wrap state updates in `act()` or use async queries   |
| `Unknown element type`                 | Mock missing components or providers                 |

## Example: Enabling a Real Test

### Before (Skipped)

```typescript
// src/__tests__/shows.nameColumn.test.tsx
describe.skip('Shows table name column', () => {
  it('renders Show header and falls back to city', () => {
    renderWithProviders(<Shows />);

    const listBtn = screen.getByRole('button', { name: /List/i });
    fireEvent.click(listBtn);

    expect(screen.getByRole('columnheader', { name: /Show/i }))
      .toBeInTheDocument();
  });
});
```

### After (Enabled)

```typescript
// Same test, just remove describe.skip
// The full AllTheProviders context is now available
describe('Shows table name column', () => {
  it('renders Show header and falls back to city', () => {
    renderWithProviders(<Shows />);

    const listBtn = screen.getByRole('button', { name: /List/i });
    fireEvent.click(listBtn);

    expect(screen.getByRole('columnheader', { name: /Show/i }))
      .toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Use Semantic Queries

```typescript
// ✅ Semantic - user-focused
screen.getByRole('button', { name: /Add/i });

// ❌ Implementation-focused
screen.getByTestId('add-btn');
```

### 2. Test User Behavior

```typescript
// ✅ Tests actual user interaction
fireEvent.click(button);
expect(screen.getByText('Saved')).toBeInTheDocument();

// ❌ Tests internal state
expect(component.state.saved).toBe(true);
```

### 3. Handle Async Operations

```typescript
// ✅ Wait for async updates
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ❌ Don't wait
expect(screen.getByText('Data loaded')).toBeInTheDocument();
```

### 4. Clean Up Between Tests

```typescript
// ✅ Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
```

### 5. Use Meaningful Descriptions

```typescript
// ✅ Clear intent
it('displays total income when shows are loaded', () => {

// ❌ Vague
it('works', () => {
```

## Roadmap for Component Test Enablement

### Priority 1: Simple UI Components (5-10 tests)

- Language selector
- Country select
- KPI sparkline

**Effort**: 2-3 hours
**Value**: Low (already tested indirectly)

### Priority 2: Shows Editor Tests (8 tests)

- Undo/redo
- Accessibility
- Quick entry
- Enhancements

**Effort**: 5-8 hours
**Value**: Medium (core feature)

### Priority 3: ActionHub Tests (4 tests)

- Tab switching
- Filter chips
- Kind filtering

**Effort**: 3-5 hours
**Value**: Medium (important feature)

### Priority 4: Advanced Tests (20+ hours)

- Mission control
- Dashboard imports
- CTA navigation

**Effort**: 10-15 hours
**Value**: Low (covered by integration tests)

## Testing Patterns by Component Type

### Form Component

```typescript
describe('MyForm', () => {
  it('submits form data', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<MyForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Test' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test' })
      );
    });
  });
});
```

### List Component

```typescript
describe('MyList', () => {
  it('renders items', () => {
    renderWithProviders(
      <MyList items={[{ id: '1', name: 'Item 1' }]} />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
```

### Modal Component

```typescript
describe('MyModal', () => {
  it('closes on backdrop click', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <MyModal open onClose={handleClose}>
        Content
      </MyModal>
    );

    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalled();
  });
});
```

### Context-Dependent Component

```typescript
describe('MyContextComponent', () => {
  it('uses context value', () => {
    renderWithProviders(<MyContextComponent />);

    // Component already has access to all providers
    expect(screen.getByText(/Initialized/i))
      .toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: "Context must be used within Provider"

**Cause**: Component needs a provider that's not included.

**Solution**: Use `renderWithProviders()` instead of manual render:

```typescript
// ❌ Missing provider
render(<Component />);

// ✅ All providers included
renderWithProviders(<Component />);
```

### Issue: "act() Warning: State Update Inside Test"

**Cause**: Async state updates happening after test finishes.

**Solution**: Use `waitFor()` to wait for updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Issue: "Element not Found"

**Cause**: Component renders asynchronously.

**Solution**: Use `findBy` instead of `getBy`:

```typescript
// ❌ Doesn't wait
const element = screen.getByText('Item');

// ✅ Waits for async render
const element = await screen.findByText('Item');
```

### Issue: "Cannot Find Module"

**Cause**: Path resolution issue in test.

**Solution**: Use `@/` alias (configured in TypeScript):

```typescript
// ❌ Relative path
import { MyComponent } from '../components/MyComponent';

// ✅ Alias path
import { MyComponent } from '@/components/MyComponent';
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Next Steps**:

1. Pick ONE component test to enable
2. Follow the process above step-by-step
3. Run `npm run test:run` to verify
4. Commit individually: `git commit -m "Enable test: Component name"`

**Target**: Enable 2-3 tests per session → 420+/449 over time
