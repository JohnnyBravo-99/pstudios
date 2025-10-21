# Beckan Font - Quick Reference Card

## 📦 Font Files
```
src/assets/fonts/
├── Beckan Regular.woff2  ← Use this (primary)
├── Beckan Oblique.woff2  ← Use this (italic)
└── Beckan Regular.ttf    ← Old (deprecated)
```

## 🎨 Using the Font

### In CSS
```css
/* Already set globally - just use it! */
.my-heading {
  font-family: var(--font-primary);
  /* or */
  font-family: 'Beckan', sans-serif;
}
```

### For Headings
```css
/* Automatic tracking/kerning already applied to h1-h6 */
/* Just use standard heading tags */
<h1>This has tracking and kerning</h1>
```

### CSS Variables Available
```css
--font-primary: 'Beckan', sans-serif;
--font-secondary: 'Playfair-Display', serif;

--letter-spacing-heading: 0.02em;        /* for h2-h6 */
--letter-spacing-heading-large: 0.01em;  /* for h1 */

/* Brand Colors */
--color-primary: #006699;        /* Primary Blue */
--color-secondary: #ff9900;      /* Secondary Orange */
--color-accent: #3399cc;         /* Accent Blue */
--color-graphite-veil: #676767;  /* Graphite Gray */
```

## ✅ What's Already Set Up

### Global Settings (body)
- ✅ Kerning enabled
- ✅ Ligatures enabled
- ✅ Antialiasing on
- ✅ Text rendering optimized

### All Headings (h1-h6)
- ✅ Letter spacing (tracking)
- ✅ Font features enabled
- ✅ Anti-blur properties
- ✅ Optimized rendering

## ⚠️ Don't Do This

### ❌ Bad (causes blur)
```css
.text {
  backdrop-filter: blur(10px);  /* NO! */
  transform: translateY(-2px);  /* NO! (on text) */
  filter: blur(2px);            /* NO! */
}
```

### ✅ Good (keeps text crisp)
```css
.text {
  background: rgba(0, 0, 0, 0.85);  /* Solid bg */
  /* No backdrop-filter */
  /* No transform on text */
}
```

## 🎯 Contrast Guidelines

### Minimum Backgrounds for White Text
```css
/* Good contrast */
background: rgba(0, 0, 0, 0.85);     /* 85% black */
background: rgba(0, 102, 153, 0.85); /* 85% blue */

/* Too light - avoid */
background: rgba(0, 0, 0, 0.3);      /* Only 30% */
```

### Text Colors
```css
/* Good readability */
color: #ffffff;                    /* Pure white */
color: rgba(255, 255, 255, 0.95);  /* 95% white */

/* Too light - avoid */
color: rgba(255, 255, 255, 0.5);   /* Only 50% */
```

## 🚀 Performance Checklist

When adding new text:
- [ ] Use `font-family: var(--font-primary)` or `'Beckan'`
- [ ] Don't add `backdrop-filter` to parent containers
- [ ] Don't add `transform` to text elements
- [ ] Ensure background has ≥ 0.85 opacity
- [ ] Use CSS variables for letter-spacing
- [ ] Use brand colors: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-accent)`

## 📱 Testing Checklist

After adding new text:
- [ ] Zoom to 200% - text should be sharp
- [ ] Check on Chrome, Firefox, Safari
- [ ] Check on mobile (iOS Safari, Android Chrome)
- [ ] Run Lighthouse - Accessibility should be 100

## 🔧 Troubleshooting

### Text looks blurry
1. Check parent for `backdrop-filter` → Remove it
2. Check for `transform` on text → Remove it
3. Add to your element:
   ```css
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   ```

### Font not loading
1. Check Network tab in DevTools
2. Should see `Beckan Regular.woff2` load
3. Check Console for errors
4. Verify file path: `src/assets/fonts/Beckan Regular.woff2`

### Wrong font showing
1. Check computed styles in DevTools
2. Should show `font-family: Beckan, sans-serif`
3. If not, you may have a more specific selector overriding
4. Use `font-family: var(--font-primary) !important;` (last resort)

## 📚 Full Documentation

- `FONT_OPTIMIZATION_GUIDE.md` - Complete implementation details
- `BROWSER_TEST_CHECKLIST.md` - Testing procedures
- `FONT_IMPLEMENTATION_SUMMARY.md` - High-level overview

---

**Quick Test:** Is Beckan working?
1. Open site in Chrome
2. F12 → Elements → Inspect any heading
3. Computed tab → Search "font-family"
4. Should show: `Beckan, sans-serif` ✅

---

**Last Updated:** October 2025

