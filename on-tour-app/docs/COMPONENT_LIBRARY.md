# UI Component Library

Complete component library following the design system. All components are fully typed with TypeScript and support animations via Framer Motion.

## Core Components

### Button

Reusable button component with multiple variants and states.

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`, `icon`, `small`, `large`

```tsx
import { Button } from '@/components/ui';

export function MyComponent() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      Click me
    </Button>
  );
}
```

**Props**:

- `variant`: Button style variant
- `loading`: Show loading spinner
- `icon`: Icon element to display
- `iconPosition`: 'left' | 'right'
- `fullWidth`: Stretch to full width
- `disabled`: Disabled state
- `animated`: Enable animations

---

### Card

Container component with multiple display variants.

**Variants**: `elevated`, `filled`, `outlined`, `gradient`, `compact`, `interactive`

```tsx
import { Card } from '@/components/ui';

export function MyComponent() {
  return (
    <Card variant="elevated" hover>
      <h3 className="text-lg font-semibold">Card Title</h3>
      <p className="text-sm text-gray-600">Card content</p>
    </Card>
  );
}
```

**Props**:

- `variant`: Card style variant
- `animated`: Enable entrance animation
- `hover`: Enable hover lift effect

---

### Badge

Status indicator or label component.

**Variants**: `primary`, `success`, `warning`, `danger`, `neutral`

```tsx
import { Badge } from '@/components/ui';

export function MyComponent() {
  return <Badge variant="success">Active</Badge>;
}
```

**Props**:

- `variant`: Badge color variant
- `icon`: Icon to display
- `dot`: Show colored dot indicator

---

### Input

Form input with enhanced features.

**Variants**: `default`, `compact`, `filled`

```tsx
import { Input } from '@/components/ui';

export function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <Input
      label="Email"
      type="email"
      value={value}
      onChange={e => setValue(e.target.value)}
      error={value ? undefined : 'Email is required'}
    />
  );
}
```

**Props**:

- `variant`: Input style variant
- `label`: Label text
- `icon`: Icon element
- `iconPosition`: 'left' | 'right'
- `error`: Error message
- `placeholder`: Placeholder text

---

## Feedback Components

### Alert

Display alerts and notifications.

**Types**: `info`, `success`, `warning`, `error`

```tsx
import { Alert } from '@/components/ui';

export function MyComponent() {
  return (
    <Alert type="success" title="Success!">
      Your operation was completed successfully.
    </Alert>
  );
}
```

**Props**:

- `type`: Alert type/color
- `title`: Alert title
- `icon`: Custom icon
- `closeable`: Show close button
- `onClose`: Close handler

---

### Modal

Dialog overlay for displaying content.

**Sizes**: `sm`, `md`, `lg`, `xl`

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Confirm</Button>
          </>
        }
      >
        Are you sure you want to proceed?
      </Modal>
    </>
  );
}
```

**Props**:

- `isOpen`: Show/hide modal
- `onClose`: Close handler
- `title`: Modal title
- `size`: Modal size
- `footer`: Footer content
- `closeButton`: Show close button
- `overlay`: Show overlay backdrop
- `animated`: Enable animations

---

### Toast & useToast

Non-blocking notifications.

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

**Toast Types**: `info`, `success`, `warning`, `error`

**Note**: Wrap your app with `<ToastProvider>` to enable toasts:

```tsx
import { ToastProvider } from '@/components/ui';

export function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

---

### Skeleton

Loading placeholders with shimmer effect.

**Variants**: `text`, `circle`, `rectangle`

```tsx
import { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from '@/components/ui';

export function MyComponent() {
  return (
    <>
      {/* Individual skeleton */}
      <Skeleton variant="text" count={3} />

      {/* Pre-built shapes */}
      <Skeleton variant="circle" width={40} height={40} />
      <Skeleton variant="rectangle" height={200} />

      {/* Composed skeletons */}
      <SkeletonCard count={3} />
      <SkeletonList count={5} />
      <SkeletonTable rows={5} cols={4} />
    </>
  );
}
```

**Props**:

- `variant`: Skeleton type
- `width`: Width (px or %)
- `height`: Height (px)
- `count`: Number of items
- `animated`: Enable shimmer animation

---

## Form Components

### Select

Dropdown selector with search and icons.

```tsx
import { Select } from '@/components/ui';
import { useState } from 'react';

export function MyComponent() {
  const [selected, setSelected] = useState('');

  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', disabled: true },
  ];

  return (
    <Select
      label="Choose an option"
      options={options}
      value={selected}
      onChange={setSelected}
      searchable
      placeholder="Select..."
    />
  );
}
```

**Props**:

- `label`: Select label
- `options`: Array of options with value, label, icon, disabled
- `onChange`: Change handler
- `variant`: Style variant
- `error`: Error message
- `icon`: Leading icon
- `searchable`: Enable search
- `disabled`: Disabled state

---

## Animation Hooks

### useInView

Detect when element enters viewport.

```tsx
import { useInView } from '@/components/ui';

export function MyComponent() {
  const { isInView, ref } = useInView();

  return <div ref={ref}>{isInView && <p>Element is visible!</p>}</div>;
}
```

---

### useHoverEffect

Manage hover state with debounce.

```tsx
import { useHoverEffect } from '@/components/ui';

export function MyComponent() {
  const { isHovered, handlers } = useHoverEffect(
    () => console.log('entered'),
    () => console.log('left'),
    100 // delay in ms
  );

  return <div {...handlers}>{isHovered ? 'Hovered!' : 'Hover me'}</div>;
}
```

---

### useCounterAnimation

Animate counter incrementally.

```tsx
import { useCounterAnimation } from '@/components/ui';

export function MyComponent() {
  const count = useCounterAnimation(1000, 2000);

  return <div>Count: {count}</div>;
}
```

---

### useStaggerAnimation

Create staggered animations for lists.

```tsx
import { useStaggerAnimation } from '@/components/ui';
import { motion } from 'framer-motion';

export function MyComponent() {
  const { container, item } = useStaggerAnimation(5);
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  return (
    <motion.div variants={container} initial="initial" animate="animate">
      {items.map((item, idx) => (
        <motion.div key={idx} variants={item(idx)}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

### useScrollAnimation

Track scroll position.

```tsx
import { useScrollAnimation } from '@/components/ui';

export function MyComponent() {
  const scrollY = useScrollAnimation();

  return <div>Scroll Y: {scrollY}px</div>;
}
```

---

### useSystemTheme

Detect system theme preference.

```tsx
import { useSystemTheme } from '@/components/ui';

export function MyComponent() {
  const isDark = useSystemTheme();

  return <div>{isDark ? 'Dark mode' : 'Light mode'}</div>;
}
```

---

## Design Tokens

All design system values are available for import:

```tsx
import {
  colors,
  spacing,
  typography,
  shadows,
  transitionTokens,
  animationPresets,
  breakpoints,
  zIndex,
} from '@/components/ui';
```

### Colors

- **Primary**: sky-500 and variants
- **Accent**: purple-500, pink-500, cyan-500
- **State**: success (green), warning (amber), critical (red), info (sky)
- **Gray**: Complete gray scale (50-950)
- **Semantic**: background, surface, border, text

### Spacing

8 levels from `xs` (4px) to `4xl` (4rem)

### Typography

- Headings: h1 through h6
- Body: sm, base, lg
- Labels: sm, md, lg
- Mono: sm, base

### Animations

- `fadeIn`: Fade entrance
- `fadeInUp`: Fade + slide up
- `slideInLeft`: Slide from left
- `scaleIn`: Scale entrance
- `hoverScale`: Hover scale effect
- `staggerContainer`: Container for staggered children
- `staggerItem`: Individual staggered item

---

## Usage Tips

### 1. Consistent Styling

Use design tokens for all styling to maintain consistency:

```tsx
import { colors, spacing } from '@/components/ui';

export function MyComponent() {
  return <div style={{ backgroundColor: colors.primary, padding: spacing.md }}>Content</div>;
}
```

### 2. Dark Mode

All components support dark mode automatically via Tailwind's `dark:` prefix.

### 3. Type Safety

All components are fully typed with TypeScript for better IDE support.

### 4. Accessibility

Components follow WCAG guidelines with proper ARIA attributes.

### 5. Performance

- Components use `React.forwardRef` for optimal ref passing
- Animations use Framer Motion for GPU acceleration
- List animations use stagger to reduce jank

---

## Component Status

| Component | Status      | Variants     | Hooks    | Notes                  |
| --------- | ----------- | ------------ | -------- | ---------------------- |
| Button    | ✅ Complete | 8            | -        | Full animation support |
| Card      | ✅ Complete | 6            | -        | Hover lift included    |
| Badge     | ✅ Complete | 5            | -        | Icon & dot support     |
| Input     | ✅ Complete | 3            | -        | Error states included  |
| Alert     | ✅ Complete | 4            | -        | Closeable option       |
| Modal     | ✅ Complete | 4 sizes      | -        | Full screen-center     |
| Toast     | ✅ Complete | 4            | useToast | Auto-dismiss support   |
| Skeleton  | ✅ Complete | 3 + composed | -        | Shimmer animation      |
| Select    | ✅ Complete | 3            | -        | Searchable option      |
| Hooks     | ✅ Complete | 12           | -        | Animation utilities    |

---

**Last Updated**: Q1 2026  
**Design System Version**: 1.0.0  
**Component Library Version**: 1.0.0
