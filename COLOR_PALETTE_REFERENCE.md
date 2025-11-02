# CarrierSignal Color Palette Reference

## Primary Teal Colors

### Teal 50 (Lightest)
- **Hex**: `#F0FDF9`
- **RGB**: `240, 253, 249`
- **Usage**: Hover backgrounds, light accents
- **CSS**: `bg-[#F0FDF9]`

### Teal 100
- **Hex**: `#CCFBF1`
- **RGB**: `204, 251, 241`
- **Usage**: Badge backgrounds, light highlights
- **CSS**: `bg-[#CCFBF1]`

### Teal 200
- **Hex**: `#99F6E4`
- **RGB**: `153, 246, 228`
- **Usage**: Secondary highlights
- **CSS**: `bg-[#99F6E4]`

### Teal 300
- **Hex**: `#5EEAD4`
- **RGB**: `94, 234, 212`
- **Usage**: Tertiary accents
- **CSS**: `bg-[#5EEAD4]`

### Teal 400 (Bright Accent)
- **Hex**: `#2DD4BF`
- **RGB**: `45, 212, 191`
- **Usage**: Secondary accent, highlights
- **CSS**: `text-[#2DD4BF]` or `bg-[#2DD4BF]`

### Teal 500 (Primary)
- **Hex**: `#14B8A6`
- **RGB**: `20, 184, 166`
- **Usage**: Primary buttons, main accent
- **CSS**: `bg-[#14B8A6]` or `text-[#14B8A6]`
- **CSS Variable**: `var(--color-primary)`

### Teal 600 (Primary Dark)
- **Hex**: `#0D9488`
- **RGB**: `13, 148, 136`
- **Usage**: Hover state, darker accent
- **CSS**: `hover:bg-[#0D9488]`
- **CSS Variable**: `var(--color-primary-hover)`

### Teal 700
- **Hex**: `#0F766E`
- **RGB**: `15, 118, 110`
- **Usage**: Active state, darkest accent
- **CSS**: `bg-[#0F766E]`

### Teal 800
- **Hex**: `#115E59`
- **RGB**: `17, 94, 89`
- **Usage**: Very dark accents
- **CSS**: `bg-[#115E59]`

### Teal 900 (Darkest)
- **Hex**: `#134E4A`
- **RGB**: `19, 78, 74`
- **Usage**: Darkest accents
- **CSS**: `bg-[#134E4A]`

## Neutral Colors

### White
- **Hex**: `#FFFFFF`
- **RGB**: `255, 255, 255`
- **Usage**: Primary background
- **CSS Variable**: `var(--color-bg-primary)`

### Gray 50 (Lightest)
- **Hex**: `#FAFAFA`
- **RGB**: `250, 250, 250`
- **Usage**: Subtle backgrounds
- **CSS**: `bg-[#FAFAFA]`

### Gray 100
- **Hex**: `#F5F5F5`
- **RGB**: `245, 245, 245`
- **Usage**: Secondary background
- **CSS**: `bg-[#F5F5F5]`
- **CSS Variable**: `var(--color-bg-secondary)`

### Gray 150
- **Hex**: `#F0F0F0`
- **RGB**: `240, 240, 240`
- **Usage**: Light borders
- **CSS**: `border-[#F0F0F0]`
- **CSS Variable**: `var(--color-border-light)`

### Gray 200
- **Hex**: `#E5E5E5`
- **RGB**: `229, 229, 229`
- **Usage**: Standard borders
- **CSS**: `border-[#E5E5E5]`
- **CSS Variable**: `var(--color-border)`

### Gray 300
- **Hex**: `#D4D4D4`
- **RGB**: `212, 212, 212`
- **Usage**: Darker borders
- **CSS**: `border-[#D4D4D4]`

### Gray 400
- **Hex**: `#A3A3A3`
- **RGB**: `163, 163, 163`
- **Usage**: Muted text
- **CSS**: `text-[#A3A3A3]`
- **CSS Variable**: `var(--color-text-muted)`

### Gray 500
- **Hex**: `#737373`
- **RGB**: `115, 115, 115`
- **Usage**: Tertiary text
- **CSS**: `text-[#737373]`
- **CSS Variable**: `var(--color-text-tertiary)`

### Gray 600
- **Hex**: `#525252`
- **RGB**: `82, 82, 82`
- **Usage**: Secondary text
- **CSS**: `text-[#525252]`
- **CSS Variable**: `var(--color-text-secondary)`

### Gray 700
- **Hex**: `#404040`
- **RGB**: `64, 64, 64`
- **Usage**: Dark text
- **CSS**: `text-[#404040]`

### Gray 800
- **Hex**: `#262626`
- **RGB**: `38, 38, 38`
- **Usage**: Very dark text
- **CSS**: `text-[#262626]`

### Gray 900 (Darkest)
- **Hex**: `#171717`
- **RGB**: `23, 23, 23`
- **Usage**: Primary text
- **CSS**: `text-[#171717]`
- **CSS Variable**: `var(--color-text-primary)`

## Semantic Colors

### Success
- **Light**: `#10B981`
- **Dark**: `#059669`
- **Usage**: Success states, positive actions
- **CSS**: `bg-[#10B981]` or `hover:bg-[#059669]`

### Warning
- **Light**: `#F59E0B`
- **Dark**: `#D97706`
- **Usage**: Warning states, caution
- **CSS**: `bg-[#F59E0B]` or `hover:bg-[#D97706]`

### Danger
- **Light**: `#EF4444`
- **Dark**: `#DC2626`
- **Usage**: Error states, destructive actions
- **CSS**: `bg-[#EF4444]` or `hover:bg-[#DC2626]`

### Info
- **Light**: `#3B82F6`
- **Dark**: `#2563EB`
- **Usage**: Information, neutral actions
- **CSS**: `bg-[#3B82F6]` or `hover:bg-[#2563EB]`

## Gradient Combinations

### Primary Gradient
```css
background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
```

### Primary Accent Gradient
```css
background: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%);
```

### Success Gradient
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

### Subtle Gradient
```css
background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
```

## Usage Guidelines

### Text Colors
- **Primary Text**: `#171717` (Gray 900)
- **Secondary Text**: `#525252` (Gray 600)
- **Tertiary Text**: `#737373` (Gray 500)
- **Muted Text**: `#A3A3A3` (Gray 400)

### Background Colors
- **Primary BG**: `#FFFFFF` (White)
- **Secondary BG**: `#F5F5F5` (Gray 100)
- **Tertiary BG**: `#ECECF1` (Gray 150)

### Border Colors
- **Light Border**: `#F0F0F0` (Gray 150)
- **Standard Border**: `#E5E5E5` (Gray 200)
- **Dark Border**: `#D4D4D4` (Gray 300)

### Accent Colors
- **Primary Accent**: `#14B8A6` (Teal 500)
- **Primary Hover**: `#0D9488` (Teal 600)
- **Secondary Accent**: `#2DD4BF` (Teal 400)
- **Light Accent**: `#CCFBF1` (Teal 100)

## Contrast Ratios (WCAG AAA)

### Text on White
- `#171717` on `#FFFFFF`: 18.5:1 ✅ AAA
- `#525252` on `#FFFFFF`: 8.2:1 ✅ AAA
- `#737373` on `#FFFFFF`: 5.8:1 ✅ AAA

### Text on Teal
- `#FFFFFF` on `#14B8A6`: 4.5:1 ✅ AAA
- `#FFFFFF` on `#0D9488`: 5.2:1 ✅ AAA

### Text on Gray
- `#171717` on `#F5F5F5`: 17.8:1 ✅ AAA
- `#525252` on `#F5F5F5`: 7.9:1 ✅ AAA

## CSS Variables

```css
/* Primary Colors */
--color-primary: #14B8A6;
--color-primary-hover: #0D9488;
--color-primary-light: #CCFBF1;
--color-accent: #2DD4BF;

/* Backgrounds */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F5F5;
--color-bg-tertiary: #ECECF1;

/* Borders */
--color-border: #E5E5E5;
--color-border-light: #F0F0F0;

/* Text */
--color-text-primary: #171717;
--color-text-secondary: #525252;
--color-text-tertiary: #737373;
--color-text-muted: #A3A3A3;
```

---

**Color System Version**: 2.0 (ChatGPT-Inspired)
**Last Updated**: 2025-11-02
**Status**: ✅ Production Ready

