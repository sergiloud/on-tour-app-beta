/\*\*

- Design System Documentation & Integration Guide
-
- ============================================================================
- OVERVIEW
- ============================================================================
-
- The On Tour App Design System provides centralized, type-safe design tokens
- for colors, typography, and spacing. This ensures consistency across the UI
- and makes future theme changes (dark mode, etc) trivial.
-
- ============================================================================
- QUICK START
- ============================================================================
-
- 1.  Import tokens in your component:
- ```tsx

  ```
- import { colors, typography, spacing } from '@/design-system';
- ```

  ```
-
- 2.  Use in inline styles:
- ```tsx

  ```
- <button style={{
-      backgroundColor: colors.primary[500],
-      padding: spacing.md,
-      fontSize: typography.fontSize.base,
-      fontWeight: typography.fontWeight.semibold
- }} />
- ```

  ```
-
- 3.  Use with Tailwind (after config integration):
- ```tsx

  ```
- <button className="bg-primary-500 p-4 text-base font-semibold" />
- ```

  ```
-
- ============================================================================
- TOKEN STRUCTURE
- ============================================================================
-
- COLOR TOKENS (src/design-system/colors.ts)
- ***
-
- Palettes:
- - primary: Brand color (blue-500 base)
- - success: Positive states (green-500 base)
- - danger: Errors & destructive (red-500 base)
- - warning: Alerts & cautions (amber-500 base)
- - info: Information (cyan-500 base)
- - gray: Neutral text & backgrounds
- - accent: Brand accents (purple, amber, emerald, rose, indigo)
- - states: Hover, focus, active, disabled states
-
- Each palette has 11 shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- 500 is typically the "base" color for the palette
-
- Usage:
- ```tsx

  ```
- colors.primary[500] // Base primary color: #0ea5e9
- colors.success[700] // Dark success: #15803d
- colors.danger[100] // Light error: #fee2e2
- colors.gray[500] // Neutral text: #6b7280
- colors.accent.purple // Brand accent: #a855f7
- ```

  ```
-
-
- TYPOGRAPHY TOKENS (src/design-system/typography.ts)
- ***
-
- Font Families:
- - sans: System font stack (Segoe UI, Roboto, etc)
- - mono: Monospace stack (SF Mono, Monaco, etc)
- - serif: Serif stack (Georgia, Times, etc)
-
- Font Sizes (base 16px = 1rem):
- - xs (12px), sm (14px), base (16px), lg (18px), xl (20px)
- - 2xl (24px), 3xl (30px), 4xl (36px), 5xl (48px), 6xl (60px)
-
- Font Weights:
- - thin (100), extralight (200), light (300), normal (400), medium (500)
- - semibold (600), bold (700), extrabold (800), black (900)
-
- Line Heights:
- - tight (1.1), snug (1.25), normal (1.5), relaxed (1.625), loose (2)
-
- Letter Spacing:
- - tight (-0.02em), normal (0), wide (0.02em), wider (0.05em), widest (0.1em)
-
- Semantic Styles (complete style objects):
- - heading1, heading2, heading3, heading4, heading5, heading6
- - body, bodySmall, bodySmaller
- - code, label, caption, button, nav
-
- Usage:
- ```tsx

  ```
- typography.fontSize.xl // \"1.25rem\"
- typography.fontWeight.bold // 700
- typography.lineHeight.normal // 1.5
- typography.styles.heading1 // Full h1 style object
- typography.styles.body // Full body text style
- ```

  ```
-
-
- SPACING TOKENS (src/design-system/spacing.ts)
- ***
-
- Base Unit: 4px (consistent with Tailwind)
- - 0 (0px), 1 (4px), 2 (8px), 3 (12px), 4 (16px)
- - 5 (20px), 6 (24px), 8 (32px), 12 (48px), 16 (64px), 20 (80px), etc
-
- Semantic Sizes:
- - xs (8px), sm (12px), md (16px), lg (24px), xl (32px), 2xl (48px)
-
- Paddings, Margins, Gaps:
- - All use same scale as space
- - x/y variants for horizontal/vertical padding
- - left/right/top/bottom specific variants
-
- Border Radius:
- - none (0), xs (2px), sm (3px), md (4px), lg (6px), xl (8px)
- - 2xl (12px), 3xl (16px), full (9999px - pill-shaped)
-
- Shadows (depth indicators):
- - none, xs, sm, md, lg, xl, 2xl, inner
-
- Z-Index Stack (prevents z-index wars):
- - hide (-1), base (0), dropdown (1000), sticky (1020)
- - fixed (1030), modal_backdrop (1040), modal (1050)
- - popover (1060), tooltip (1070), notification (1080)
-
- Timing & Easing (for animations):
- - timing: fast (150ms), base (200ms), slow (300ms), slower (500ms)
- - easing: linear, in, out, inOut
-
- Usage:
- ```tsx

  ```
- spacing.space[4] // \"1rem\" (16px)
- spacing.sizes.md // \"1rem\" (16px)
- spacing.padding.md // \"1rem\" (16px)
- spacing.margin.lg // \"1.5rem\" (24px)
- spacing.radius.md // \"0.5rem\" (4px)
- spacing.shadow.md // Box shadow string
- spacing.zIndex.modal // 1050
- spacing.timing.base // \"200ms\"
- spacing.easing.inOut // \"cubic-bezier(0.4, 0, 0.2, 1)\"
- ```

  ```
-
- ============================================================================
- INTEGRATION WITH TAILWIND
- ============================================================================
-
- Next: Update tailwind.config.js to use design system tokens
-
- Example config structure:
- ```js

  ```
- module.exports = {
- theme: {
-     extend: {
-       colors: {
-         primary: colors.primary,
-         success: colors.success,
-         danger: colors.danger,
-         warning: colors.warning,
-         info: colors.info,
-         gray: colors.gray,
-       },
-       fontSize: typography.fontSize,
-       fontWeight: typography.fontWeight,
-       lineHeight: typography.lineHeight,
-       spacing: spacing.space,
-       borderRadius: spacing.radius,
-       boxShadow: spacing.shadow,
-       gap: spacing.gaps,
-       padding: spacing.padding,
-     }
- }
- }
- ```

  ```
-
- Then use in Tailwind classes:
- ```tsx

  ```
- <button className=\"bg-primary-500 text-white px-4 py-2 rounded-md shadow-md\" />
- <h1 className=\"text-4xl font-bold leading-tight\" />
- <div className=\"p-6 m-4 gap-4\" />
- ```

  ```
-
- ============================================================================
- COMPONENT PATTERNS
- ============================================================================
-
- PATTERN 1: Inline Styles with Design Tokens
- ***
- Use for styles that can't be Tailwind classes
-
- ```tsx

  ```
- import { colors, typography, spacing } from '@/design-system';
-
- export function Card({ children }) {
- return (
-     <div style={{
-       backgroundColor: colors.gray[50],
-       padding: spacing.lg,
-       borderRadius: spacing.radius.md,
-       boxShadow: spacing.shadow.md,
-     }}>
-       {children}
-     </div>
- );
- }
- ```

  ```
-
-
- PATTERN 2: Tailwind Classes
- ***
- Preferred approach for performance
-
- ```tsx

  ```
- export function Button() {
- return (
-     <button className=\"bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-semibold\">\n *       Click me\n *     </button>\n *   );\n * }\n * ```
  n \*
-
- PATTERN 3: CSS-in-JS with Tokens\n _ --------------------------------\n _ For styled-components or similar\n _\n _ ``tsx\n * import styled from 'styled-components';\n * import { colors, spacing } from '@/design-system';\n *\n * const StyledButton = styled.button`\n *   background-color: ${colors.primary[500]};\n *   padding: ${spacing.md};\n *   border-radius: ${spacing.radius.md};\n *   &:hover {\n *     background-color: ${colors.primary[600]};\n *   }\n * `;\n * ``\n _\n _ ============================================================================\n _ DARK MODE SUPPORT (Future Enhancement)\n _ ============================================================================\n _\n _ When implementing dark mode:\n _ 1. Create a theme switching context\n _ 2. Define separate color palettes for light/dark modes\n _ 3. Use context to select appropriate palette\n _ 4. Export hook: useThemeColor(token, shade)\n _\n _ ============================================================================\n _ PERFORMANCE CONSIDERATIONS\n _ ============================================================================\n _\n _ ✅ Type-safe: Full TypeScript support, autocomplete in IDE\n _ ✅ Tree-shakeable: Only imported tokens are bundled\n _ ✅ No runtime overhead: Tokens are just constants\n _ ✅ Tailwind optimized: Pre-configured for Tailwind integration\n _ ✅ Accessible: WCAG AAA contrast ratios on recommended pairings\n _\n _ ============================================================================\n _ ADDING NEW TOKENS\n _ ============================================================================\n _\n _ To add a new color palette:\n _ 1. Add to colors.ts following existing pattern\n _ 2. Add type to ColorToken union\n _ 3. Update Tailwind config\n _ 4. Document in this file\n _\n _ Example:\n _ ```ts\n _ export const teal = {\n _ 50: '#f0fdfa',\n _ 100: '#ccfbf1',\n _ // ... continue pattern\n _ 500: '#14b8a6',\n _ // ... continue pattern\n _ 950: '#0d3331',\n _ } as const;\n _ ```\n _\n _ ============================================================================\n _ RESOURCES\n _ ============================================================================\n _\n _ Files:\n _ - src/design-system/colors.ts (Color palettes)\n _ - src/design-system/typography.ts (Font & text styles)\n _ - src/design-system/spacing.ts (Layout & spacing)\n _ - src/design-system/index.ts (Master export)\n _\n _ References:\n _ - Tailwind CSS: https://tailwindcss.com/docs\n _ - Design Tokens: https://spectrum.adobe.com/page/design-tokens/\n _ - Accessibility: https://www.w3.org/WAI/WCAG21/quickref/\n _\n _ ============================================================================\n _/\n\nexport {};\n
