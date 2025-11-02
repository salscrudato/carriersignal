# CarrierSignal Design Tokens Reference

## Color System

### Primary Colors
```css
--color-primary: #10B981;           /* Modern Green - Main brand color */
--color-primary-hover: #059669;     /* Darker Green - Hover state */
--color-primary-light: #D1FAE5;     /* Light Green - Backgrounds */
--color-primary-lighter: #ECFDF5;   /* Very Light Green - Subtle backgrounds */
```

### Neutral Colors
```css
--color-bg-primary: #FFFFFF;        /* White - Main background */
--color-bg-secondary: #F9FAFB;      /* Off-white - Secondary background */
--color-bg-tertiary: #F3F4F6;       /* Light gray - Tertiary background */
--color-bg-hover: #F0F1F3;          /* Hover background */
--color-border: #E5E7EB;            /* Primary border */
--color-border-light: #F3F4F6;      /* Light border */
--color-border-subtle: #F0F1F3;     /* Subtle border */
```

### Text Colors
```css
--color-text-primary: #111827;      /* Dark gray - Primary text */
--color-text-secondary: #4B5563;    /* Medium gray - Secondary text */
--color-text-tertiary: #6B7280;     /* Light gray - Tertiary text */
--color-text-muted: #9CA3AF;        /* Muted gray - Disabled/muted text */
--color-text-light: #D1D5DB;        /* Very light gray - Subtle text */
```

### Accent Colors
```css
--color-accent: #06B6D4;            /* Cyan - Accent color */
--color-accent-purple: #8B5CF6;     /* Purple - Secondary accent */
```

### Status Colors
```css
--color-success: #10B981;           /* Green - Success */
--color-success-light: #D1FAE5;     /* Light green - Success background */
--color-warning: #F59E0B;           /* Amber - Warning */
--color-warning-light: #FEF3C7;     /* Light amber - Warning background */
--color-danger: #EF4444;            /* Red - Danger */
--color-danger-light: #FEE2E2;      /* Light red - Danger background */
--color-info: #3B82F6;              /* Blue - Info */
--color-info-light: #DBEAFE;        /* Light blue - Info background */
```

---

## Shadow System

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.01);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.03), 0 1px 2px -1px rgb(0 0 0 / 0.02);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.06);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.15);
```

---

## Transition System

```css
--transition-fast: 120ms ease-in-out;      /* Quick interactions */
--transition-base: 200ms ease-in-out;      /* Standard transitions */
--transition-slow: 300ms ease-in-out;      /* Slower animations */
--transition-slower: 400ms ease-in-out;    /* Very slow animations */
```

---

## Gradient Presets

```css
.gradient-primary {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.gradient-accent {
  background: linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.gradient-warning {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.gradient-danger {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.gradient-subtle {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
}

.gradient-bg {
  background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%);
}
```

---

## Component Tokens

### Cards
```css
.card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: var(--shadow-xs);
}

.card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.article-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter), var(--shadow-md);
  background-color: var(--color-primary-lighter);
}
```

### Buttons
```css
button {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

button:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  box-shadow: var(--shadow-sm);
}

button.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Inputs
```css
input, textarea, select {
  border: 1px solid var(--color-border-light);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

input:focus, textarea:focus, select:focus {
  background-color: var(--color-bg-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
  border-color: var(--color-primary);
}
```

---

## Animation Classes

```css
.animate-smoothFadeIn {
  animation: smoothFadeIn 300ms ease-out;
}

.animate-smoothSlideInUp {
  animation: smoothSlideInUp 300ms ease-out;
}

.animate-smoothSlideInDown {
  animation: smoothSlideInDown 300ms ease-out;
}

.animate-smoothScaleIn {
  animation: smoothScaleIn 300ms ease-out;
}

.animate-fadeInScale {
  animation: fadeInScale 300ms ease-out;
}

.animate-slideInUp {
  animation: slideInUp 300ms ease-out;
}

.animate-fadeInUp {
  animation: fadeInUp 300ms ease-out;
}
```

---

## Typography

```css
h1 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

small, .text-sm {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}
```

---

## Spacing Scale

```css
/* Tailwind-compatible spacing */
0.25rem (4px)
0.5rem (8px)
0.75rem (12px)
1rem (16px)
1.5rem (24px)
2rem (32px)
2.5rem (40px)
3rem (48px)
4rem (64px)
```

---

## Border Radius

```css
0.5rem (8px)    /* Small elements */
0.75rem (12px)  /* Cards, buttons */
1rem (16px)     /* Larger elements */
1.5rem (24px)   /* Large cards */
3xl (24px)      /* Bottom sheets */
```

---

## Z-Index Scale

```css
10   /* Sticky elements */
20   /* Dropdowns */
30   /* Modals overlay */
40   /* Modals */
50   /* Tooltips, popovers */
```

---

## Usage Examples

### Modern Card
```jsx
<div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
  Content here
</div>
```

### Primary Button
```jsx
<button className="bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition-all duration-300">
  Click me
</button>
```

### Modern Input
```jsx
<input 
  className="border border-[#E5E7EB] rounded-lg px-3 py-2 focus:border-[#10B981] focus:shadow-[0_0_0_3px_#ECFDF5] transition-all duration-200"
  placeholder="Enter text..."
/>
```

---

## Notes

- All colors are designed for WCAG AAA compliance
- Shadows use refined opacity for depth
- Transitions are optimized for smooth 60fps performance
- Gradients use 135° angle for modern appearance
- All values are CSS custom properties for easy theming

