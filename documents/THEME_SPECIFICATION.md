# Webgenix Theme Specification

A complete, reusable design system extracted from the Webgenix hosting platform.

---

## 1. Colors

### Dark Neutral Base (Backgrounds/Surfaces)
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `--color-dark-900` | `#0a0a0a` | `rgb(10, 10, 10)` | Primary background, body |
| `--color-dark-800` | `#141414` | `rgb(20, 20, 20)` | Card backgrounds, sections |
| `--color-dark-700` | `#1a1a1a` | `rgb(26, 26, 26)` | Elevated surfaces, hover states |
| `--color-dark-600` | `#262626` | `rgb(38, 38, 38)` | Borders, dividers |

### Text Hierarchy
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `--color-text-primary` | `#fafafa` | `rgb(250, 250, 250)` | Headings, primary text |
| `--color-text-secondary` | `#a1a1a1` | `rgb(161, 161, 161)` | Body text, descriptions |
| `--color-text-muted` | `#525252` | `rgb(82, 82, 82)` | Captions, helper text |

### Accent Colors (Primary Action)
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `--color-accent` | `#3b82f6` | `rgb(59, 130, 246)` | Primary buttons, links, focus states |
| `--color-accent-hover` | `#2563eb` | `rgb(37, 99, 235)` | Button hover, link hover |

### Semantic Colors (State)
| Token | HEX | RGB | Usage |
|-------|-----|-----|-------|
| `--color-success` | `#22c55e` | `rgb(34, 197, 94)` | Success states, trust indicators |
| `--color-warning` | `#f59e0b` | `rgb(245, 158, 11)` | Warnings, "coming soon" badges |
| `--color-error` | `#ef4444` | `rgb(239, 68, 68)` | Error states (implied) |

### Additional Colors Found in Code
| Color | HEX | Usage |
|-------|-----|-------|
| Red (terminal) | `#ef4444` / `bg-red-500` | Terminal close button |
| Yellow (terminal) | `#eab308` / `bg-yellow-500` | Terminal minimize button |
| Green (terminal) | `#22c55e` / `bg-green-500` | Terminal maximize button |
| Code accent | `#60a5fa` / `text-blue-400` | Code highlights (accent-light) |

---

## 2. Typography

### Font Family
```
--font-family-sans: 'Inter', system-ui, -apple-system, sans-serif
```

**Font Load:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **H1** | `text-4xl sm:text-5xl lg:text-6xl` | `font-semibold` (600) | `leading-tight` (1.25) | Normal |
| **H1 Alt** (Service Hero) | `text-5xl lg:text-7xl` | `font-bold` (700) | `leading-tight` | `tracking-tight` |
| **H2** | `text-3xl lg:text-4xl` | `font-semibold` (600) | `leading-tight` (1.25) | Normal |
| **H3** | `text-xl` | `font-semibold` (600) | `leading-tight` | Normal |
| **H4** (Card titles) | `text-lg` / `text-base` | `font-semibold` (600) | `leading-tight` | Normal |
| **Body Large** | `text-lg sm:text-xl` | `font-normal` (400) | `leading-normal` (1.6) | Normal |
| **Body** | `text-base` (16px) | `font-normal` (400) | `1.6` | Normal |
| **Body Small** | `text-sm` (14px) | `font-normal` (400) | `1.5` | Normal |
| **Caption** | `text-xs` (12px) | `font-medium` (500) | `1.4` | `uppercase tracking-wider` |

### Font Weights Used
- `font-normal` (400) - Body text
- `font-medium` (500) - Buttons, labels, nav links
- `font-semibold` (600) - Headings, section titles, card titles
- `font-bold` (700) - Hero headlines, stats numbers

---

## 3. Spacing & Layout

### Container Widths
| Class | Value | Usage |
|-------|-------|-------|
| `max-w-7xl` | 1280px | Main page containers |
| `max-w-6xl` | 1152px | Feature grids |
| `max-w-5xl` | 1024px | How it works, centered content |
| `max-w-4xl` | 896px | Hero content, text-heavy sections |
| `max-w-3xl` | 768px | Conversion footer, narrow content |
| `max-w-md` | 448px | Auth forms, modals |

### Padding Scale
| Class | Value | Usage |
|-------|-------|-------|
| `px-4` | 16px | Mobile horizontal padding |
| `px-6` | 24px | Standard section padding |
| `lg:px-8` | 32px | Large screen section padding |

### Vertical Section Spacing
| Class | Value | Usage |
|-------|-------|-------|
| `py-24` | 96px | Standard section vertical padding |
| `lg:py-32` | 128px | Large section vertical padding |
| `pt-16` | 64px | Account for fixed header |
| `pt-20` | 80px | Main content padding (header height) |

### Spacing Between Elements
| Class | Value | Usage |
|-------|-------|-------|
| `gap-4` | 16px | Small gaps, button groups |
| `gap-6` | 24px | Card grids, standard spacing |
| `gap-8` | 32px | Feature grids, section content |
| `gap-12` | 48px | Large feature layouts |
| `gap-16` | 64px | Major section divisions |

### Header Dimensions
- Height: `h-20` (80px)
- Fixed position with `pt-20` offset on main content

### Grid System
- `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3` (Features)
- `grid-cols-2` → `md:grid-cols-4` (Footer links)
- `flex` with `flex-wrap` and `justify-center` for service categories

---

## 4. Components

### Buttons (CTAButton)

**Base Styles:**
```
inline-flex items-center justify-center
font-medium rounded-lg
transition-all duration-200
focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
disabled:opacity-50 disabled:cursor-not-allowed
```

**Variants:**

| Variant | Background | Text | Border | Shadow | Hover |
|---------|------------|------|--------|--------|-------|
| **Primary** | `bg-accent` | `text-white` | None | `shadow-lg shadow-accent/20` | `bg-accent-hover`, `shadow-accent/30` |
| **Secondary** | `bg-transparent` | `text-text-primary` | `border border-dark-600` | None | `bg-dark-700`, `border-dark-500` |

**Sizes:**

| Size | Padding | Font Size |
|------|---------|-----------|
| `small` | `px-4 py-2` | `text-sm` |
| `default` | `px-6 py-3` | `text-base` |
| `large` | `px-8 py-4` | `text-lg` |

**Special Button (Submit/Login):**
```
w-full py-3 px-6 rounded-lg
bg-accent hover:bg-accent-hover text-white
font-medium text-sm
shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/35
transition-all duration-200
focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
active:scale-[0.98]
```

### Cards

**Standard Card:**
```
bg-dark-800/50 (or bg-dark-800)
border border-dark-700
rounded-2xl (or rounded-xl)
hover:border-accent/50 (interactive cards)
transition-colors
p-6 (content padding)
```

**Glass Card (Auth Forms):**
```
bg-dark-800/60 backdrop-blur-xl
border border-dark-600/60
rounded-2xl
p-8
shadow-2xl shadow-black/40
```

**Feature Card with Icon:**
```
p-6 rounded-2xl
bg-dark-800/50 border border-dark-700
hover:border-accent/50 transition-colors group

// Icon container
w-12 h-12 rounded-xl bg-dark-700
flex items-center justify-center text-accent mb-6
group-hover:scale-110 transition-transform
```

**Trust Feature Card:**
```
flex items-center gap-4
p-5 rounded-xl
bg-dark-800 border border-dark-700
hover:border-dark-600 transition-colors
```

### Forms

**Input Fields:**
```
w-full px-4 py-3 rounded-lg text-sm
bg-dark-700/80 border border-dark-600
text-text-primary placeholder-text-muted
focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
transition-all duration-200
```

**Input with Icon:**
```
// Add pr-11 for right padding when icon present
relative
// Icon button
absolute right-3 top-1/2 -translate-y-1/2
text-text-muted hover:text-text-secondary transition-colors
```

**Labels:**
```
block text-sm font-medium text-text-secondary mb-2
```

**Checkbox:**
```
w-4 h-4 rounded border-dark-600 bg-dark-700 accent-accent cursor-pointer
```

**Divider (Or separator):**
```
relative flex items-center gap-4
<div className="flex-1 h-px bg-dark-600" />
<span className="text-xs text-text-muted">or</span>
```

### Badges

**Structure:**
```
inline-flex items-center
px-2 py-0.5
text-xs font-medium
rounded-full
border
```

**Variants:**

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| **AI** | `bg-accent/20` | `text-accent` | `border-accent/30` |
| **Popular** | `bg-success/10` | `text-success` | `border-success/30` |
| **Coming Soon** | `bg-warning/10` | `text-warning/80` | `border-warning/20` |

### Navigation (Header)

**Header Container:**
```
fixed top-0 left-0 right-0 z-50
bg-dark-900/90 backdrop-blur-xl
border-b border-dark-700/50
shadow-lg shadow-black/10
```

**Nav Links:**
```
text-base font-medium text-text-secondary
hover:text-accent transition-colors
py-2 px-3 rounded-lg
hover:bg-dark-800/50
```

### Tooltip (Service Item Hover)

```
absolute z-[60] left-1/2 -translate-x-1/2 bottom-[calc(100%-0.5rem)]
w-[calc(100%+2rem)] min-w-[240px] max-w-[320px]
p-4 rounded-xl
bg-[#1a1a1a]/95 backdrop-blur-md
shadow-2xl border border-white/10
opacity-0 invisible group-hover:opacity-100 group-hover:visible
transition-all duration-300 ease-in-out
translate-y-2 group-hover:-translate-y-1

// Arrow
absolute -bottom-1.5 left-1/2 -translate-x-1/2
w-3 h-3 bg-[#1a1a1a] border-b border-r border-white/10 rotate-45
```

---

## 5. Styling Approach

### CSS Methodology
- **Tailwind CSS v4** with `@theme` directive for custom design tokens
- Utility-first approach with semantic custom properties
- No BEM or CSS Modules - pure Tailwind classes

### Theme Configuration (`index.css`)
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-dark-900: #0a0a0a;
  --color-dark-800: #141414;
  --color-dark-700: #1a1a1a;
  --color-dark-600: #262626;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1a1;
  --color-text-muted: #525252;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  /* Typography */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Naming Conventions
- **Colors:** Semantic names (`dark-900`, `text-primary`, `accent`)
- **Spacing:** Tailwind scale (4=16px, 6=24px, etc.)
- **Components:** PascalCase for component files, descriptive names
- **Custom Properties:** kebab-case with `--color-` or `--font-` prefix

### Class Organization Pattern
```jsx
className="
  // Layout
  flex items-center justify-center
  // Sizing
  w-full max-w-md
  // Spacing
  px-6 py-3
  // Colors
  bg-dark-800 text-text-primary
  // Border
  border border-dark-600 rounded-lg
  // Typography
  text-base font-medium
  // Effects
  shadow-lg transition-all duration-200
  // States
  hover:bg-dark-700 focus:outline-none
"
```

---

## 6. Effects & Behavior

### Transitions
| Element | Duration | Easing | Properties |
|---------|----------|--------|------------|
| Buttons | 200ms | `ease` | `all` |
| Links | 200ms | `ease` | `all` |
| Cards hover | 300ms | `ease-in-out` | `border-color` |
| Icon scale | 300ms | `ease-in-out` | `transform` |
| Tooltip | 300ms | `ease-in-out` | `opacity, visibility, transform` |
| Password strength | 300ms | - | `width` |

### Shadows
| Name | Value | Usage |
|------|-------|-------|
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Cards, buttons |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Elevated states |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Modals, auth forms |
| `shadow-black/10` | Black 10% opacity | Header |
| `shadow-black/40` | Black 40% opacity | Auth forms |
| `shadow-accent/20` | Accent color 20% opacity | Primary buttons |
| `shadow-accent/25` | Accent color 25% opacity | Submit buttons |

### Focus States
```
focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
```

### Selection
```css
::selection {
  background-color: var(--color-accent);
  color: white;
}
```

### Backdrop Blur
- Header: `backdrop-blur-xl`
- Auth forms: `backdrop-blur-xl`
- Tooltips: `backdrop-blur-md`

### Gradient Patterns

**Background Gradient:**
```css
bg-gradient-to-b from-dark-900 via-dark-900 to-dark-800
```

**Hero Gradient (Service Pages):**
```css
absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/10 blur-[120px]
```

**Text Gradient:**
```css
text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light
```

**Radial Gradient (Auth Pages):**
```css
radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%)
```

### Grid Background Pattern
```css
bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
bg-[size:24px_24px]
```

### SVG Pattern (Hero)
```
data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E
```
opacity: 0.02

### Scroll Indicator Animation
```css
animate-bounce
```

---

## 7. Assets & Icons

### Icon System
- **Custom SVG Icon Component** (`Icon.jsx`)
- **Style:** Lucide React (line-based icons)
- **Size:** Default 20px, varies by context (16px, 22px, 24px, 28px, 32px)
- **Stroke:** 2px
- **Properties:** `fill="none"`, `stroke="currentColor"`, `strokeLinecap="round"`, `strokeLinejoin="round"`

### Icon Sizes by Context
| Context | Size |
|---------|------|
| Navigation | 20px |
| Feature cards | 24px |
| Trust badges | 22px |
| Mobile menu | 28px |
| How it works | 32px |
| Service items | 20px (icon), 16px (tooltip) |

### Brand Logo
- **File:** `logo.png`
- **Header height:** `h-10` (40px)
- **Footer height:** `h-6` (24px)
- **Style:** Auto width, maintains aspect ratio

### Terminal/Code Visuals
```
// Window controls
w-3 h-3 rounded-full
bg-red-500/80, bg-yellow-500/80, bg-green-500/80

// Code background
bg-[#0D0D12] or bg-dark-900
font-mono text-sm

// Terminal header
bg-[#16161E] border-b border-dark-700/50
```

---

## 8. Theme Implementation Files

### File 1: `index.css` (Tailwind Config)
```css
@import "tailwindcss";

@theme {
  /* Dark neutral base */
  --color-dark-900: #0a0a0a;
  --color-dark-800: #141414;
  --color-dark-700: #1a1a1a;
  --color-dark-600: #262626;
  
  /* Text hierarchy */
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1a1;
  --color-text-muted: #525252;
  
  /* Accent */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  /* Typography */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-family-sans);
  background-color: var(--color-dark-900);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.2;
  font-weight: 600;
}

::selection {
  background-color: var(--color-accent);
  color: white;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

a, button {
  transition: all 0.2s ease;
}

section[id] {
  scroll-margin-top: 100px;
}
```

### File 2: `CTAButton.jsx`
```jsx
import { Link } from 'react-router-dom';

export default function CTAButton({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  to,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-accent hover:bg-accent-hover
      text-white
      shadow-lg shadow-accent/20
      hover:shadow-xl hover:shadow-accent/30
    `,
    secondary: `
      bg-transparent
      text-text-primary
      border border-dark-600
      hover:bg-dark-700 hover:border-dark-500
    `,
  };

  const sizes = {
    default: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
    small: 'px-4 py-2 text-sm',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
```

### File 3: `Badge.jsx`
```jsx
const badgeStyles = {
  ai: 'bg-accent/20 text-accent border-accent/30',
  popular: 'bg-success/10 text-success border-success/30',
  comingSoon: 'bg-warning/10 text-warning/80 border-warning/20',
};

const badgeLabels = {
  ai: 'AI',
  popular: 'Popular',
  comingSoon: 'Coming Soon',
};

export default function Badge({ variant = 'popular' }) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        text-xs font-medium
        rounded-full
        border
        ${badgeStyles[variant] || badgeStyles.popular}
      `}
    >
      {badgeLabels[variant] || variant}
    </span>
  );
}
```

### File 4: `Icon.jsx` (Skeleton)
See original file for complete icon path definitions. Key structure:
```jsx
export default function Icon({ name, size = 20, className = '' }) {
  // iconPaths object with all SVG paths
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}
```

---

## 9. Usage Guide

### Installation

1. **Install Dependencies:**
```bash
npm install react react-dom react-router-dom
npm install -D tailwindcss @tailwindcss/vite vite
```

2. **Configure Vite:**
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

3. **Add Font:**
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

4. **Copy `index.css` content** from Section 8 into your project.

### Basic Page Structure

```jsx
// App.jsx
function App() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="min-h-screen bg-dark-900 pt-20">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
}
```

### Section Template

```jsx
export default function SectionName() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
            Section Title
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Section description
          </p>
        </div>
        
        {/* Content grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Cards */}
        </div>
      </div>
    </section>
  );
}
```

### Form Template

```jsx
<div className="bg-dark-800/60 backdrop-blur-xl border border-dark-600/60 rounded-2xl p-8 shadow-2xl shadow-black/40">
  <form className="space-y-5">
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Label
      </label>
      <input
        className="w-full px-4 py-3 rounded-lg text-sm bg-dark-700/80 border border-dark-600 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
        placeholder="Placeholder"
      />
    </div>
    <button
      type="submit"
      className="w-full py-3 px-6 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-sm shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/35 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 active:scale-[0.98]"
    >
      Submit
    </button>
  </form>
</div>
```

### Quick Reference: Common Patterns

**Container:**
```
max-w-7xl mx-auto px-6 lg:px-8
```

**Card:**
```
bg-dark-800/50 border border-dark-700 rounded-2xl p-6
```

**Section Title:**
```
text-3xl lg:text-4xl font-semibold text-text-primary
```

**Body Text:**
```
text-lg text-text-secondary
```

**Link:**
```
text-accent hover:text-accent-hover transition-colors
```

**Icon Container:**
```
w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-accent
```

---

## 10. Breakpoints Reference

| Name | Width | Tailwind Prefix |
|------|-------|-----------------|
| Mobile (default) | < 640px | None |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |

### Common Responsive Patterns

```jsx
// Font sizes
text-4xl sm:text-5xl lg:text-6xl

// Grids
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Flex direction
flex-col lg:flex-row

// Padding variations
px-4 sm:px-6 lg:px-8

// Display toggle
hidden md:flex
```

---

## Summary

This theme specification captures the **Webgenix Dark UI Design System** with:
- **Dark-first aesthetic** with carefully crafted neutral grays
- **Single blue accent** (#3b82f6) for all interactive elements
- **Inter font family** for clean, modern readability
- **Generous whitespace** with 24-32px gaps and 96-128px section padding
- **Subtle effects** - backdrop blur, soft shadows, gentle transitions
- **Consistent component patterns** for cards, buttons, forms, and navigation

Use this specification to ensure pixel-perfect consistency across all Webgenix-branded projects.
