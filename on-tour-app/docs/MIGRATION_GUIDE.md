# Migration Guide: Using New UI Components

## Overview

This guide shows how to migrate existing components to use the new UI Component Library while maintaining functionality and improving consistency.

## Migration Strategy

### Phase 1: Analysis

- Identify components that can use the library
- Map existing patterns to new components
- Plan migration order

### Phase 2: Update

- Replace custom components with library components
- Update styling to use design tokens
- Test functionality

### Phase 3: Verification

- Verify visual consistency
- Test responsiveness
- Test dark mode
- Verify animations

## Before & After Examples

### Example 1: Button Component

**Before** (Custom Button)

```tsx
export function CustomButton({ children, onClick, isLoading, className, ...props }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg bg-blue-500 text-white
        hover:bg-blue-600 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isLoading ? 'pointer-events-none opacity-70' : ''}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="animate-spin">⌛</span> : children}
    </button>
  );
}
```

**After** (UI Library Button)

```tsx
import { Button } from '@/components/ui';

// Usage is identical but with more features built-in
<Button onClick={onClick} loading={isLoading}>
  {children}
</Button>

// Access new variants
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>

// Add icons
<Button icon={<SaveIcon />}>Save</Button>

// Multiple sizes and states
<Button fullWidth disabled>
  Disabled Button
</Button>
```

### Example 2: Card Component

**Before** (Custom Card)

```tsx
export function CustomCard({ title, children, hoverable }) {
  return (
    <div
      className={`
      bg-white rounded-lg shadow
      ${hoverable ? 'hover:shadow-lg cursor-pointer' : ''}
      transition-shadow p-4
    `}
    >
      {title && <h3 className="font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
}
```

**After** (UI Library Card)

```tsx
import { Card } from '@/components/ui';

// Simple variant with automatic hover effect
<Card variant="elevated" hover>
  <h3 className="font-bold mb-2">{title}</h3>
  {children}
</Card>

// Different variants for different needs
<Card variant="filled">...</Card>
<Card variant="outlined">...</Card>
<Card variant="gradient">...</Card>
```

### Example 3: Modal/Dialog Component

**Before** (Custom Modal)

```tsx
export function CustomModal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose}>✕</button>
          </div>
          <div className="mb-4">{children}</div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </>
  );
}
```

**After** (UI Library Modal)

```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title={title}
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  {children}
</Modal>;

// Automatic animations, dark mode, responsive sizing
```

## Common Migration Patterns

### Pattern 1: Replace Button

**Find:**

```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>
```

**Replace with:**

```tsx
import { Button } from '@/components/ui';
<Button>Click me</Button>;
```

### Pattern 2: Replace Card/Container

**Find:**

```tsx
<div className="bg-white rounded-lg shadow p-4">{content}</div>
```

**Replace with:**

```tsx
import { Card } from '@/components/ui';
<Card>{content}</Card>;
```

### Pattern 3: Replace Input

**Find:**

```tsx
<input type="text" className="border border-gray-300 rounded px-3 py-2" placeholder="Enter..." />
```

**Replace with:**

```tsx
import { Input } from '@/components/ui';
<Input placeholder="Enter..." />;
```

### Pattern 4: Replace Status Badge

**Find:**

```tsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
```

**Replace with:**

```tsx
import { Badge } from '@/components/ui';
<Badge variant="success">Active</Badge>;
```

### Pattern 5: Replace Alert/Notification

**Find:**

```tsx
<div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
  <p className="font-bold">Error</p>
  <p>Something went wrong</p>
</div>
```

**Replace with:**

```tsx
import { Alert } from '@/components/ui';
<Alert type="error" title="Error">
  Something went wrong
</Alert>;
```

## Migration Checklist

### For Each Component:

- [ ] Review existing component code
- [ ] Identify matching library component
- [ ] Note any custom styling
- [ ] Check for custom behavior
- [ ] Plan for any differences
- [ ] Update imports
- [ ] Replace component usage
- [ ] Update props if needed
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test on mobile
- [ ] Test on desktop
- [ ] Verify animations
- [ ] Commit changes

## Component Mapping

| Existing Pattern       | Library Component | Migration Effort |
| ---------------------- | ----------------- | ---------------- |
| Custom Button          | Button            | 5 min            |
| Custom Card            | Card              | 5 min            |
| Custom Badge           | Badge             | 3 min            |
| Custom Input           | Input             | 5 min            |
| Custom Select/Dropdown | Select            | 10 min           |
| Custom Modal/Dialog    | Modal             | 15 min           |
| Custom Alert           | Alert             | 5 min            |
| Custom Loading State   | Skeleton          | 10 min           |
| Custom Notification    | Toast + useToast  | 10 min           |

## Step-by-Step Migration Example

### Migrating a Dashboard Component

**Step 1: Analyze Current Component**

```tsx
// Before: src/components/dashboard/Stats.tsx
export function Stats({ title, value, status }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <span
        className={`
        text-xs px-2 py-1 rounded
        ${status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
      `}
      >
        {status}
      </span>
    </div>
  );
}
```

**Step 2: Plan Migration**

- Use Card for container
- Use Badge for status
- Use design tokens for colors
- Add animations

**Step 3: Implement New Component**

```tsx
// After: src/components/dashboard/Stats.tsx
import { Card, Badge } from '@/components/ui';

export function Stats({ title, value, status }) {
  return (
    <Card variant="elevated" hover>
      <h3 className="text-slate-600 dark:text-slate-400">{title}</h3>
      <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{value}</p>
      <Badge variant={status === 'up' ? 'success' : 'danger'}>{status}</Badge>
    </Card>
  );
}
```

**Step 4: Benefits Gained**

- ✅ Automatic dark mode support
- ✅ Hover animations included
- ✅ Better responsive design
- ✅ Type safety
- ✅ Consistent styling
- ✅ Smaller code
- ✅ Better maintainability

## Testing After Migration

### Visual Testing

```tsx
// Test in light mode
export function TestLight() {
  return <YourComponent />;
}

// Test in dark mode
export function TestDark() {
  return (
    <div className="dark bg-slate-900 p-8">
      <YourComponent />
    </div>
  );
}
```

### Responsive Testing

```tsx
// Test on mobile (375px)
// Test on tablet (768px)
// Test on desktop (1024px)
// Test on large desktop (1280px)
```

### Animation Testing

```tsx
// Verify animations play smoothly
// Verify interactions feel responsive
// Verify dark mode transitions smoothly
```

## Common Issues & Solutions

### Issue 1: Custom Styling Lost

```tsx
// If you had custom styles:
<button className="custom-style">

// Now use variant prop:
<Button variant="primary">

// Or extend with className:
<Button className="custom-additions">
```

### Issue 2: Missing Props

```tsx
// If old component had custom props:
<CustomButton customProp="value">

// Check library component for equivalent:
<Button icon={<Icon />} fullWidth>

// If truly missing, create wrapper:
export function WrappedButton(props) {
  return <Button {...props} />;
}
```

### Issue 3: Behavior Changes

```tsx
// If old component had custom behavior:
// Document the difference
// Test thoroughly
// Consider custom wrapper if needed
```

## Benefits of Migration

✅ **Code Reduction**

- Less code to maintain
- Fewer custom implementations
- Easier to understand

✅ **Consistency**

- All components use same patterns
- Same animations everywhere
- Same colors and spacing

✅ **Features**

- Built-in dark mode
- Animations included
- Better accessibility
- Mobile responsive

✅ **Performance**

- Optimized animations
- Better rendering
- Smaller bundle (shared code)

✅ **Maintainability**

- Centralized design tokens
- Easy to update styles
- Type-safe implementations
- Better IDE support

## Timeline Estimate

| Phase                | Components | Hours | Status |
| -------------------- | ---------- | ----- | ------ |
| Dashboard Components | 5-7        | 2-3   | Ready  |
| Shows Components     | 4-6        | 2-3   | Ready  |
| Finance Components   | 3-5        | 1-2   | Ready  |
| Settings Components  | 2-3        | 0.5-1 | Ready  |
| Modals & Overlays    | 3-5        | 1-2   | Ready  |

**Total Migration Time**: 6-11 hours for entire application

## Next Steps

1. ✅ Review this guide
2. ✅ Choose first component to migrate
3. ✅ Create feature branch
4. ✅ Follow step-by-step migration
5. ✅ Test thoroughly
6. ✅ Get code review
7. ✅ Deploy
8. ✅ Repeat for other components

---

**Ready to start migrating? Pick your first component today! 🚀**
