# Webgenix Theme - Quick Reference

## Colors (Copy-Paste HEX Values)

| Purpose | Value |
|---------|-------|
| Background | `#0a0a0a` |
| Cards/Sections | `#141414` |
| Borders | `#262626` |
| Primary Text | `#fafafa` |
| Secondary Text | `#a1a1a1` |
| Muted Text | `#525252` |
| Primary Button | `#3b82f6` |
| Button Hover | `#2563eb` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |

## Common Tailwind Class Patterns

### Container
```
max-w-7xl mx-auto px-6 lg:px-8
```

### Section
```
py-24 lg:py-32
```

### Section Header
```
text-center mb-16
```

### Card
```
bg-dark-800/50 border border-dark-700 rounded-2xl p-6 hover:border-accent/50 transition-colors
```

### Feature Card with Icon
```
p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-colors group
```

### Icon Container (inside card)
```
w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform
```

### Primary Button
```
inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
```

### Secondary Button
```
inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-transparent text-text-primary border border-dark-600 hover:bg-dark-700 hover:border-dark-500 transition-all duration-200
```

### Form Input
```
w-full px-4 py-3 rounded-lg text-sm bg-dark-700/80 border border-dark-600 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200
```

### Form Label
```
block text-sm font-medium text-text-secondary mb-2
```

### Section Title (H2)
```
text-3xl lg:text-4xl font-semibold text-text-primary mb-4
```

### Section Subtitle
```
text-lg text-text-secondary max-w-2xl mx-auto
```

### Navigation Link
```
text-base font-medium text-text-secondary hover:text-accent transition-colors py-2 px-3 rounded-lg hover:bg-dark-800/50
```

### Glass Card (Auth Forms)
```
bg-dark-800/60 backdrop-blur-xl border border-dark-600/60 rounded-2xl p-8 shadow-2xl shadow-black/40
```

### Badge - AI
```
inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border bg-accent/20 text-accent border-accent/30
```

### Badge - Popular
```
inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border bg-success/10 text-success border-success/30
```

### Badge - Coming Soon
```
inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border bg-warning/10 text-warning/80 border-warning/20
```

### Link Style
```
text-accent hover:text-accent-hover transition-colors
```

### Trust Feature Card
```
flex items-center gap-4 p-5 rounded-xl bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors
```

### Icon Container (Trust Features)
```
flex-shrink-0 w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center
```

## Typography Scale

| Element | Classes |
|---------|---------|
| H1 (Hero) | `text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight` |
| H1 (Service) | `text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight` |
| H2 | `text-3xl lg:text-4xl font-semibold text-text-primary` |
| H3 | `text-xl font-semibold text-text-primary mb-2` |
| Body Large | `text-lg sm:text-xl text-text-secondary` |
| Body | `text-base text-text-secondary` |
| Caption | `text-sm text-text-muted` |
| Micro | `text-xs text-text-muted uppercase tracking-wider` |

## Spacing Quick Reference

| Value | Tailwind | Usage |
|-------|----------|-------|
| 16px | `4` / `gap-4` | Small gaps |
| 24px | `6` / `gap-6` / `px-6` | Standard padding/gap |
| 32px | `8` / `gap-8` / `p-8` | Card padding, larger gaps |
| 48px | `12` / `gap-12` | Major spacing |
| 64px | `16` / `mb-16` | Section header margin |
| 96px | `24` / `py-24` | Section vertical padding |
| 128px | `32` / `lg:py-32` | Large section padding |

## Shadows

| Usage | Class |
|-------|-------|
| Cards | `shadow-lg` |
| Elevated | `shadow-xl` |
| Modals/Forms | `shadow-2xl shadow-black/40` |
| Primary Button | `shadow-lg shadow-accent/20` |
| Button Hover | `hover:shadow-xl hover:shadow-accent/30` |

## Effects

### Backdrop Blur
- Header: `backdrop-blur-xl`
- Auth forms: `backdrop-blur-xl`
- Tooltips: `backdrop-blur-md`

### Transitions
- Standard: `transition-all duration-200`
- Cards: `transition-colors duration-300`
- Icons: `transition-transform duration-300`

### Focus Ring
```
focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
```

## Breakpoints

| Prefix | Width | Use for |
|--------|-------|---------|
| (none) | < 640px | Mobile default |
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large screens |

## Grid Patterns

### 3-Column Features
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
```

### 2-Column Content
```
grid md:grid-cols-2 gap-8 lg:gap-16 items-center
```

### Footer Links
```
grid grid-cols-2 md:grid-cols-4 gap-8
```

## Header Offset

The header is fixed with height `80px` (`h-20`). Main content needs:
```
pt-20  // Padding to account for fixed header
```

## Code Block Styling

```
bg-[#0D0D12] rounded-2xl border border-dark-700 shadow-2xl
font-mono text-sm text-text-secondary
```

## Gradient Text
```
text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400
```

## Glass Header
```
bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/50 shadow-lg shadow-black/10
```

---

## One-Liner Component Templates

**Hero Section:**
```jsx
<section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900 to-dark-800" />
  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight mb-6">
      Headline
    </h1>
    <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
      Description
    </p>
    <button className="px-8 py-4 text-lg font-medium rounded-lg bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all">
      CTA
    </button>
  </div>
</section>
```

**Feature Grid Card:**
```jsx
<div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-accent/50 transition-colors group">
  <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
    <Icon size={24} />
  </div>
  <h3 className="text-lg font-semibold text-white mb-2">Title</h3>
  <p className="text-text-secondary text-sm">Description</p>
</div>
```

**Auth Form Container:**
```jsx
<div className="bg-dark-800/60 backdrop-blur-xl border border-dark-600/60 rounded-2xl p-8 shadow-2xl shadow-black/40">
  <form className="space-y-5">
    {/* form fields */}
  </form>
</div>
```

---

**Need the full spec?** See `THEME_SPECIFICATION.md`
**Need JavaScript values?** See `theme.js`
**Need CSS file?** See `theme.css`
