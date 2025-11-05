# 🎨 UI Component Library - Quick Start Guide

## Installation & Setup

### 1. Wrap your app with ToastProvider

```tsx
// src/App.tsx
import { ToastProvider } from '@/components/ui';

export function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

## Common Usage Patterns

### Buttons

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Loading state
<Button loading>Loading...</Button>

// With icon
<Button icon={<SaveIcon />}>Save</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

### Forms

```tsx
import { Input, Select, Button } from '@/components/ui';
import { useState } from 'react';

export function MyForm() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState('');

  return (
    <form>
      <Input label="Name" value={name} onChange={e => setName(e.target.value)} />

      <Select
        label="Choose option"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
        onChange={setSelected}
        searchable
      />

      <Button fullWidth>Submit</Button>
    </form>
  );
}
```

### Cards

```tsx
import { Card, Badge } from '@/components/ui';

<Card variant="elevated" hover>
  <h3>Card Title</h3>
  <Badge variant="success">Active</Badge>
  <p>Card content</p>
</Card>;
```

### Alerts

```tsx
import { Alert } from '@/components/ui';

<Alert type="success" title="Success!">
  Your operation completed successfully.
</Alert>

<Alert type="error" closeable>
  An error occurred. Please try again.
</Alert>
```

### Modals

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

export function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Confirm</Button>
          </>
        }
      >
        Are you sure?
      </Modal>
    </>
  );
}
```

### Toasts

```tsx
import { useToast } from '@/components/ui';

export function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      type: 'success',
      message: 'Operation completed!',
      duration: 3000,
    });
  };

  return <Button onClick={handleSuccess}>Show Toast</Button>;
}
```

### Skeletons (Loading States)

```tsx
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui';

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SkeletonCard count={3} />;
  }

  return <YourContent />;
}
```

### Animations & Hooks

```tsx
import { useInView, useHoverEffect } from '@/components/ui';
import { motion } from 'framer-motion';

export function MyComponent() {
  // Detect when element enters viewport
  const { isInView, ref } = useInView();

  // Hover effect with debounce
  const { isHovered, handlers } = useHoverEffect(
    () => console.log('entered'),
    () => console.log('left'),
    100
  );

  return <div ref={ref}>{isInView && <p>Element is visible!</p>}</div>;
}
```

## Design Tokens

Access design tokens from anywhere:

```tsx
import {
  colors,
  spacing,
  typography,
  shadows,
  transitionTokens,
  animationPresets,
  breakpoints,
} from '@/components/ui';

// Usage
<div
  style={{
    background: colors.primary,
    padding: spacing.md,
    color: colors.text.primary,
  }}
>
  Content
</div>;
```

## Dark Mode

All components automatically support dark mode:

```tsx
// Just works! No extra config needed
<Button>This works in light and dark mode</Button>
```

## Component Reference

### Core Components

- **Button** - Interactive button
- **Card** - Container component
- **Badge** - Status indicator
- **Input** - Form input

### Form Components

- **Select** - Dropdown selector

### Feedback Components

- **Alert** - Notification alert
- **Modal** - Dialog overlay
- **Toast** - Toast notification (use `useToast`)
- **Skeleton** - Loading placeholder

### Hooks

- `useInView` - Viewport detection
- `useHoverEffect` - Hover state management
- `useCounterAnimation` - Counter animation
- `useStaggerAnimation` - Staggered animations
- `useScrollAnimation` - Scroll position tracking
- `useSystemTheme` - System theme detection
- `useToast` - Toast notifications
- And 5 more...

## Best Practices

### 1. Use Consistent Spacing

```tsx
// Good
<div className="space-y-4">
  <Button>Item 1</Button>
  <Button>Item 2</Button>
</div>;

// Better - use design tokens
import { spacing } from '@/components/ui';
```

### 2. Leverage Variants

```tsx
// Use variant prop instead of custom styling
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// Same with other components
<Card variant="elevated">...</Card>
<Input variant="default">...</Input>
```

### 3. Animations Built-in

```tsx
// Animations are included - no extra config needed
<Card hover animated>
  Animations work automatically
</Card>
```

### 4. Type Safety

```tsx
// TypeScript ensures correct props
<Button variant="invalid">  // ❌ TypeScript error
<Button variant="primary">  // ✅ Correct
```

## Troubleshooting

### Toast not appearing?

Make sure your app is wrapped with `ToastProvider`:

```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

### Animations not working?

Ensure Framer Motion is installed:

```bash
npm install framer-motion
```

### Dark mode not working?

Make sure Tailwind dark mode is configured in `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class',
  // ...
};
```

## More Information

- Full documentation: `docs/COMPONENT_LIBRARY.md`
- Design tokens: `src/lib/designSystem/tokens.ts`
- Examples: `src/components/examples/ComponentLibraryExample.tsx`
- Hooks: `src/lib/designSystem/hooks.ts`

---

**Version**: 1.0.0
**Last Updated**: Q1 2026
**Status**: Production Ready ✅
