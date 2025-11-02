# CarrierSignal Design Implementation Guide

## Quick Reference

### Primary Colors
```css
--color-primary: #14B8A6;        /* Main teal */
--color-primary-hover: #0D9488;  /* Darker teal */
--color-primary-light: #CCFBF1;  /* Light teal */
--color-accent: #2DD4BF;         /* Bright teal */
```

### Neutral Palette
```css
--color-bg-primary: #FFFFFF;     /* White */
--color-bg-secondary: #F5F5F5;   /* Light gray */
--color-bg-tertiary: #ECECF1;    /* Medium gray */
--color-border: #E5E5E5;         /* Border gray */
--color-border-light: #F0F0F0;   /* Light border */
--color-text-primary: #171717;   /* Dark text */
--color-text-secondary: #525252; /* Medium text */
--color-text-tertiary: #737373;  /* Light text */
--color-text-muted: #A3A3A3;     /* Muted text */
```

## Component Styling Patterns

### Cards
```jsx
// Modern card with subtle border and shadow
className="rounded-xl border border-[#F0F0F0] bg-white shadow-sm hover:shadow-md transition-all duration-300"

// Selected/Active state
className="rounded-xl border border-[#14B8A6] bg-[#F5F5F5] shadow-md"
```

### Buttons
```jsx
// Primary button (teal)
className="px-3 py-2 rounded-lg bg-[#14B8A6] text-white hover:bg-[#0D9488] transition-all duration-300"

// Secondary button (gray)
className="px-3 py-2 rounded-lg bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5] hover:bg-[#ECECF1] transition-all duration-300"
```

### Badges
```jsx
// Teal badge
className="px-2.5 py-1 rounded-lg bg-[#CCFBF1] text-[#14B8A6] text-xs font-semibold"

// Gray badge
className="px-2.5 py-1 rounded-lg bg-[#F5F5F5] text-[#525252] text-xs font-medium border border-[#E5E5E5]"
```

### Text Colors
```jsx
// Primary text
className="text-[#171717]"

// Secondary text
className="text-[#525252]"

// Tertiary text
className="text-[#737373]"

// Muted text
className="text-[#A3A3A3]"
```

## Animation Classes

### Entrance Animations
```css
.animate-fadeInScale    /* Fade in with scale effect */
.animate-slideInUp      /* Slide up animation */
.animate-fadeInUp       /* Fade in with upward movement */
.animate-pulse-subtle   /* Gentle pulsing effect */
```

### Usage
```jsx
<div className="animate-fadeInScale">Content</div>
<div className="animate-slideInUp">Content</div>
```

## Spacing System

### Padding/Margin
```css
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
```

### Usage
```jsx
className="p-4 sm:p-5"      /* Responsive padding */
className="gap-3 sm:gap-4"  /* Responsive gap */
className="space-y-3"       /* Vertical spacing */
```

## Border Radius

### Standard Sizes
```css
rounded-lg:  0.5rem   (8px)   /* Older components */
rounded-xl:  0.875rem (14px)  /* Modern components */
rounded-2xl: 1rem     (16px)  /* Large elements */
rounded-3xl: 1.5rem   (24px)  /* Bottom sheets */
```

## Shadow System

### Shadow Levels
```css
shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.02)
shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04)
shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.06)
shadow-lg: 0 10px 25px -5px rgb(0 0 0 / 0.08)
shadow-xl: 0 20px 40px -10px rgb(0 0 0 / 0.10)
```

## Transition Timing

### Standard Durations
```css
--transition-fast: 150ms ease-in-out
--transition-base: 200ms ease-in-out
--transition-slow: 300ms ease-in-out
```

### Usage
```jsx
className="transition-all duration-300"  /* Smooth 300ms transition */
className="transition-colors duration-200" /* Color change only */
```

## Responsive Breakpoints

### Mobile-First Approach
```jsx
// Mobile (default)
className="text-sm"

// Tablet and up
className="sm:text-base"

// Desktop and up
className="md:text-lg"

// Large desktop
className="lg:text-xl"
```

## Hover Effects

### Standard Patterns
```jsx
// Lift effect
className="hover:shadow-md hover:translate-y-[-1px] transition-all duration-300"

// Scale effect
className="hover:scale-105 transition-all duration-300"

// Color change
className="hover:text-[#14B8A6] transition-colors duration-300"

// Combined
className="hover:shadow-lg hover:border-[#14B8A6] transition-all duration-300"
```

## Focus States

### Accessibility
```jsx
// Automatic with CSS
className="focus-visible:outline-2 focus-visible:outline-[#14B8A6] focus-visible:outline-offset-2"

// Or use global styles
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Mobile Touch Targets

### Minimum Size
```jsx
// Ensure 48px minimum height for touch targets
className="min-h-[48px]"

// Padding for comfortable touch
className="px-4 py-3"
```

## Common Component Patterns

### Article Card
```jsx
<div className="rounded-xl border border-[#F0F0F0] bg-white p-4 sm:p-5 transition-all duration-300 hover:shadow-md">
  {/* Content */}
</div>
```

### Sort Button Group
```jsx
<div className="flex gap-1 bg-[#F5F5F5] rounded-lg p-1 border border-[#E5E5E5]">
  <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${active ? 'bg-white text-[#14B8A6]' : 'text-[#525252]'}`}>
    Label
  </button>
</div>
```

### Mobile Navigation Item
```jsx
<button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${active ? 'bg-[#CCFBF1] text-[#14B8A6]' : 'bg-[#F5F5F5] text-[#525252]'}`}>
  <Icon size={20} />
  <span>Label</span>
</button>
```

## Design System Files

### Key Files
- `src/design/tokens.ts` - Design tokens and constants
- `src/index.css` - Global styles and animations
- `src/components/Header.tsx` - Header component
- `src/components/SearchFirst.tsx` - Article cards and controls
- `src/components/MobileNav.tsx` - Mobile navigation

## Best Practices

1. **Use CSS Variables**: Always use `var(--color-*)` for colors
2. **Consistent Spacing**: Use the spacing system consistently
3. **Smooth Transitions**: Use `transition-all duration-300` for interactive elements
4. **Mobile First**: Design for mobile, then enhance for larger screens
5. **Accessibility**: Always include focus states and proper contrast
6. **Performance**: Use `will-change` sparingly for animations
7. **Consistency**: Follow existing patterns for new components

## Testing Checklist

- [ ] Colors match design tokens
- [ ] Spacing is consistent
- [ ] Animations are smooth (60fps)
- [ ] Mobile layout is responsive
- [ ] Touch targets are 48px minimum
- [ ] Focus states are visible
- [ ] Contrast ratios meet WCAG AAA
- [ ] No type errors in build
- [ ] Performance budgets met

---

**Last Updated**: 2025-11-02
**Design System Version**: 2.0 (ChatGPT-Inspired)
**Status**: ✅ Production Ready

