# Theme System Documentation

The Typesense Search Plugin includes a comprehensive theme system that allows you to customize the appearance and behavior of the `HeadlessSearchInput` component.

## Quick Start

### Basic Usage

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'

function SearchPage() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      theme="modern" // Choose from: modern, minimal, elegant, dark, colorful
      placeholder="Search..."
    />
  )
}
```

### Available Themes

- **`modern`** - Clean, professional design with subtle shadows (default)
- **`minimal`** - Flat design with minimal styling
- **`elegant`** - Sophisticated design with gradients and premium feel
- **`dark`** - Perfect for dark mode applications
- **`colorful`** - Vibrant, modern design with bright accents

## Advanced Configuration

### Custom Theme Configuration

```tsx
import type { ThemeConfig } from 'typesense-search-plugin'

const customTheme: ThemeConfig = {
  theme: 'modern',
  colors: {
    inputBorder: '#e879f9',
    inputBorderFocus: '#ec4899',
    inputBackground: '#ffffff',
    // ... more color overrides
  },
  spacing: {
    inputPadding: '1rem 1.25rem',
    inputBorderRadius: '1.5rem',
    // ... more spacing overrides
  },
  enableAnimations: true,
  enableShadows: true,
  enableRoundedCorners: true,
}

<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  theme={customTheme}
  placeholder="Custom themed search..."
/>
```

### Theme Overrides

You can override specific aspects of any theme:

```tsx
const overrideTheme: ThemeConfig = {
  theme: 'minimal',
  colors: {
    inputBorderFocus: '#10b981', // Green focus instead of default
    inputBackground: '#f0fdf4', // Light green background
  },
  spacing: {
    inputBorderRadius: '2rem', // More rounded corners
    inputPadding: '1.5rem 2rem', // More padding
  },
}
```

## Theme Structure

### Colors

The theme system provides comprehensive color control:

```typescript
interface ThemeColors {
  // Input colors
  inputBackground: string
  inputBorder: string
  inputBorderFocus: string
  inputText: string
  inputPlaceholder: string

  // Results container colors
  resultsBackground: string
  resultsBorder: string
  resultsShadow: string

  // Header colors
  headerBackground: string
  headerText: string
  headerBorder: string

  // Result item colors
  resultBackground: string
  resultBackgroundHover: string
  resultBackgroundFocus: string
  resultBorder: string

  // Text colors
  titleText: string
  descriptionText: string
  metaText: string
  highlightBackground: string
  highlightText: string

  // Interactive elements
  collectionBadge: string
  collectionBadgeText: string
  scoreBadge: string
  scoreBadgeText: string

  // State colors
  loadingText: string
  errorBackground: string
  errorText: string
  noResultsText: string

  // Facet colors (if enabled)
  facetBackground: string
  facetText: string
  facetBorder: string
  facetActiveBackground: string
  facetActiveText: string
}
```

### Spacing

Control spacing and sizing:

```typescript
interface ThemeSpacing {
  // Input spacing
  inputPadding: string
  inputBorderRadius: string
  inputFontSize: string

  // Results spacing
  resultsPadding: string
  resultsBorderRadius: string
  resultsMaxHeight: string

  // Item spacing
  itemPadding: string
  itemBorderRadius: string
  itemMargin: string

  // Header spacing
  headerPadding: string
  headerFontSize: string

  // Meta spacing
  metaPadding: string
  metaFontSize: string
}
```

### Typography

Control fonts and text styling:

```typescript
interface ThemeTypography {
  // Font families
  fontFamily: string
  fontFamilyMono: string

  // Font weights
  fontWeightNormal: string
  fontWeightMedium: string
  fontWeightSemibold: string
  fontWeightBold: string

  // Font sizes
  fontSizeXs: string
  fontSizeSm: string
  fontSizeBase: string
  fontSizeLg: string
  fontSizeXl: string
  fontSize2xl: string

  // Line heights
  lineHeightTight: string
  lineHeightNormal: string
  lineHeightRelaxed: string
}
```

### Animations

Control animations and transitions:

```typescript
interface ThemeAnimations {
  // Transition durations
  transitionFast: string
  transitionNormal: string
  transitionSlow: string

  // Easing functions
  easeIn: string
  easeOut: string
  easeInOut: string

  // Animation durations
  animationFast: string
  animationNormal: string
  animationSlow: string
}
```

### Shadows

Control shadow effects:

```typescript
interface ThemeShadows {
  // Shadow definitions
  shadowSm: string
  shadowMd: string
  shadowLg: string
  shadowXl: string

  // Focus shadows
  focusShadow: string
  focusShadowColor: string
}
```

## Feature Toggles

### Performance Options

```tsx
const performanceTheme: ThemeConfig = {
  theme: 'minimal',
  enableAnimations: false, // Disable all animations
  enableShadows: false, // Disable shadows
  enableRoundedCorners: false, // Use sharp corners
}
```

### Responsive Design

```tsx
const responsiveTheme: ThemeConfig = {
  theme: 'modern',
  responsive: true,
  mobileOptimized: true,
  spacing: {
    inputFontSize: '16px', // Prevents zoom on iOS
    resultsMaxHeight: '20rem', // Smaller on mobile
  },
}

// Note: Use with useResponsiveTheme hook for full functionality
import { useState } from 'react'
import { useResponsiveTheme } from 'typesense-search-plugin'

function ResponsiveSearchComponent() {
  const [isMobile] = useState(window.innerWidth < 768)
  const responsiveConfig = useResponsiveTheme(responsiveTheme, isMobile)

  return <HeadlessSearchInput theme={responsiveConfig} />
}
```

## Theme Provider

For advanced use cases, you can use the ThemeProvider:

```tsx
import { ThemeProvider } from 'typesense-search-plugin'

function App() {
  return (
    <ThemeProvider config={customTheme}>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        placeholder="Search with theme provider..."
      />
    </ThemeProvider>
  )
}
```

## Hooks

### useTheme

Access the current theme context:

```tsx
import { useTheme } from 'typesense-search-plugin'

function CustomComponent() {
  const { theme, classes, applyTheme, isDark } = useTheme()

  return (
    <div style={{ backgroundColor: theme.colors.inputBackground }}>
      <input className={applyTheme('input')} />
    </div>
  )
}
```

### useThemeConfig

Create theme configuration:

```tsx
import { useThemeConfig } from 'typesense-search-plugin'

function ThemedComponent() {
  const themeContext = useThemeConfig({
    theme: 'modern',
    colors: { inputBorderFocus: '#10b981' },
  })

  return <HeadlessSearchInput theme={themeContext.theme} />
}
```

## Examples

### E-commerce Theme

```tsx
const ecommerceTheme: ThemeConfig = {
  theme: 'modern',
  colors: {
    inputBorderFocus: '#059669',
    inputBackground: '#f0fdf4',
    resultsBackground: '#f0fdf4',
    headerBackground: '#ecfdf5',
    collectionBadge: '#d1fae5',
    collectionBadgeText: '#065f46',
    scoreBadge: '#fef3c7',
    scoreBadgeText: '#92400e',
  },
  spacing: {
    inputPadding: '1rem 1.5rem',
    inputBorderRadius: '0.75rem',
    itemPadding: '1.25rem 1.5rem',
  },
}
```

### Blog Theme

```tsx
const blogTheme: ThemeConfig = {
  theme: 'minimal',
  colors: {
    inputBorder: '#e5e7eb',
    inputBorderFocus: '#374151',
    inputBackground: '#ffffff',
    resultsBackground: '#ffffff',
    titleText: '#111827',
    descriptionText: '#4b5563',
    highlightBackground: '#f3f4f6',
    highlightText: '#111827',
  },
  spacing: {
    inputPadding: '0.75rem 1rem',
    inputBorderRadius: '0',
    itemPadding: '1rem 1rem',
    headerPadding: '0.75rem 1rem',
  },
}
```

### Portfolio Theme

```tsx
const portfolioTheme: ThemeConfig = {
  theme: 'elegant',
  colors: {
    inputBorder: '#8b5cf6',
    inputBorderFocus: '#7c3aed',
    inputBackground: '#ffffff',
    resultsBackground: '#ffffff',
    headerBackground: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    resultBackgroundHover: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 100%)',
  },
  spacing: {
    inputPadding: '1.25rem 1.5rem',
    inputBorderRadius: '1rem',
    resultsBorderRadius: '0 0 1rem 1rem',
    itemPadding: '1.25rem 1.5rem',
  },
}
```

## CSS Variables

The theme system also provides CSS variables for advanced customization:

```css
:root {
  --search-input-bg: #ffffff;
  --search-input-border: #d1d5db;
  --search-input-border-focus: #3b82f6;
  --search-input-placeholder: #6b7280;
  --search-input-text: #111827;
  --search-results-bg: #ffffff;
  --search-results-border: #d1d5db;
  --search-header-bg: #f9fafb;
  --search-header-text: #374151;
  --search-title-text: #111827;
  --search-description-text: #6b7280;
  --search-meta-text: #9ca3af;
  --search-highlight-bg: #fef3c7;
  --search-highlight-text: #92400e;
  --search-collection-badge: #dbeafe;
  --search-collection-badge-text: #1e40af;
  --search-score-badge: #f3f4f6;
  --search-score-badge-text: #374151;
  --search-loading-text: #6b7280;
  --search-error-bg: #fef2f2;
  --search-error-text: #dc2626;
  --search-no-results-text: #6b7280;
  --search-facet-bg: #f9fafb;
  --search-facet-text: #374151;
  --search-facet-border: #e5e7eb;
  --search-facet-active-bg: #dbeafe;
  --search-facet-active-text: #1e40af;
  /* ... and more variables for all theme colors */
}
```

## Best Practices

1. **Choose the right base theme** - Start with a theme that's closest to your design
2. **Override selectively** - Only override the colors/spacing you need to change
3. **Test on mobile** - Use `responsive: true` and `mobileOptimized: true` for mobile
4. **Performance first** - Disable animations/shadows if performance is critical
5. **Accessibility** - Ensure sufficient color contrast for all text
6. **Consistency** - Use the same theme across your application

## Migration Guide

### From CSS Classes to Theme System

**Before:**

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  className="my-search"
  inputClassName="custom-input"
  resultsClassName="custom-results"
/>
```

**After:**

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  theme={{
    theme: 'modern',
    colors: {
      inputBorder: 'your-color',
      resultsBackground: 'your-bg',
    },
  }}
/>
```

The theme system provides much more control and consistency than CSS classes, while being easier to maintain and customize.
