# Browser Testing Checklist for Beckan Font

## Pre-Testing Setup

### 1. Build the Application
```bash
cd pstudios/pstudios-landingpage
npm install
npm run build
```

### 2. Serve the Build Locally
```bash
# Option 1: Using serve
npx serve -s build

# Option 2: Using http-server
npx http-server build
```

### 3. Clear Browser Cache
- **Chrome:** Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- **Firefox:** Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- **Safari:** Cmd+Opt+E
- Select "Cached images and files" and clear

---

## Desktop Browser Tests

### Chrome / Edge / Brave (Chromium)

#### Test 1: Font Loading
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Filter by "Font"
- [ ] Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] **Expected:** See `Beckan Regular.woff2` and `Beckan Oblique.woff2` load
- [ ] **Expected:** Status 200, size < 100KB each
- [ ] **Expected:** Both fonts loaded before FCP (First Contentful Paint)

#### Test 2: Font Features
- [ ] Right-click on any heading → Inspect
- [ ] Computed tab → Search for:
  - [ ] `font-family` = `"Beckan", sans-serif`
  - [ ] `font-feature-settings` = `"kern" 1, "liga" 1` (or similar)
  - [ ] `text-rendering` = `optimizeLegibility`
  - [ ] `letter-spacing` on h1 = `0.01em`
  - [ ] `letter-spacing` on h2-h6 = `0.02em`

#### Test 3: Visual Quality
- [ ] Zoom to 200% (Ctrl/Cmd + "+")
- [ ] **Expected:** Text should remain sharp, not pixelated
- [ ] Check for kerning (e.g., "AV" should be closer than "AA")
- [ ] **Expected:** No blurry text on any element
- [ ] **Expected:** Consistent font weight across all text

#### Test 4: Performance
- [ ] Open DevTools → Lighthouse
- [ ] Run Performance audit
- [ ] **Expected:** Performance score ≥ 90
- [ ] **Expected:** First Contentful Paint < 1.5s
- [ ] **Expected:** Largest Contentful Paint < 2.5s
- [ ] Check Accessibility audit
- [ ] **Expected:** No contrast errors
- [ ] **Expected:** Accessibility score = 100

#### Test 5: Caching
- [ ] Second page load (refresh normally)
- [ ] Network tab should show fonts loaded from cache
- [ ] **Expected:** "(memory cache)" or "(disk cache)" in Size column

---

### Firefox

#### Test 1: Font Loading
- [ ] Open DevTools (F12)
- [ ] Network tab → Font filter
- [ ] Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] **Expected:** Both WOFF2 files load successfully
- [ ] **Expected:** No CORS errors in console

#### Test 2: Font Features
- [ ] Inspect heading element
- [ ] Fonts tab (in Inspector sidebar)
- [ ] **Expected:** "Beckan" listed as active font
- [ ] Rules tab → Check for:
  - [ ] `font-feature-settings` applied
  - [ ] `text-rendering: optimizeLegibility`
  - [ ] Correct letter-spacing values

#### Test 3: Text Rendering
- [ ] Compare side-by-side with Chrome
- [ ] **Expected:** Similar rendering quality (minor differences OK)
- [ ] **Expected:** No jagged edges or aliasing issues
- [ ] Test on both Windows and macOS if possible

---

### Safari (macOS)

#### Test 1: Font Loading
- [ ] Open Web Inspector (Cmd+Opt+I)
- [ ] Network tab → Filter "All"
- [ ] Hard reload (Cmd+Shift+R)
- [ ] **Expected:** WOFF2 files load
- [ ] **Expected:** CORS headers allow cross-origin if needed

#### Test 2: Retina Display Rendering
- [ ] **CRITICAL:** Test on actual Retina display (not just in DevTools)
- [ ] Zoom to 100%, 150%, 200%
- [ ] **Expected:** Text crisp at all zoom levels
- [ ] **Expected:** No blurriness from `-webkit-font-smoothing`
- [ ] **Expected:** Consistent rendering in light/dark mode

#### Test 3: Font Smoothing
- [ ] Check computed styles show:
  - [ ] `-webkit-font-smoothing: antialiased`
  - [ ] `-moz-osx-font-smoothing: grayscale`
- [ ] **Expected:** Text appears smooth but not overly thick
- [ ] Compare to system fonts (should have similar quality)

#### Test 4: iOS Safari Simulation
- [ ] Open Responsive Design Mode (Cmd+Opt+R)
- [ ] Select iPhone 14 Pro or similar
- [ ] **Expected:** Fonts load and render correctly
- [ ] **Expected:** Touch targets readable and accessible

---

## Mobile Browser Tests

### iOS Safari (Physical Device Recommended)

#### Test 1: Font Loading on Cellular
- [ ] Connect to cellular data (not WiFi)
- [ ] Clear Safari cache: Settings → Safari → Clear History
- [ ] Load site
- [ ] **Expected:** Fonts load within 2 seconds on 4G
- [ ] **Expected:** `font-display: swap` shows fallback then switches

#### Test 2: Rendering Quality
- [ ] Check text sharpness on:
  - [ ] iPhone 12+ (Super Retina)
  - [ ] iPhone SE (Retina)
  - [ ] iPad (various densities)
- [ ] **Expected:** Text crisp on all devices
- [ ] **Expected:** Correct font weights displayed

#### Test 3: Contrast in Sunlight
- [ ] View site outdoors or in bright light
- [ ] **Expected:** Text remains readable
- [ ] **Expected:** No washout due to low contrast

#### Test 4: Accessibility
- [ ] Settings → Accessibility → Display → Text Size
- [ ] Increase text size to 200%
- [ ] **Expected:** Layout doesn't break
- [ ] **Expected:** Font scales appropriately

---

### Android Chrome (Physical Device Recommended)

#### Test 1: Multi-Density Screens
- [ ] Test on devices with different pixel densities:
  - [ ] 1.5x (hdpi)
  - [ ] 2x (xhdpi)
  - [ ] 3x (xxhdpi)
  - [ ] 4x (xxxhdpi)
- [ ] **Expected:** Fonts render well on all densities

#### Test 2: Chrome DevTools Remote Debugging
- [ ] Connect device via USB
- [ ] Chrome DevTools → More Tools → Remote Devices
- [ ] Inspect page on mobile
- [ ] Check Network tab for font loads
- [ ] **Expected:** Same as desktop Chrome tests

#### Test 3: Performance
- [ ] Use "Slow 3G" throttling in DevTools
- [ ] **Expected:** Fonts still load and swap correctly
- [ ] **Expected:** No long blank periods (FOIT)

---

### Samsung Internet (Android)

#### Test 1: Basic Rendering
- [ ] Load site normally
- [ ] **Expected:** Fonts load and display
- [ ] **Expected:** No fallback font stuck
- [ ] **Expected:** Similar quality to Chrome

#### Test 2: Dark Mode
- [ ] Enable system dark mode
- [ ] **Expected:** Text contrast still good
- [ ] **Expected:** Font rendering unchanged

---

## Screenshot Comparison Tests

### Visual Regression Setup

1. **Take baseline screenshots:**
   - Open each browser
   - Navigate to homepage
   - Take full-page screenshot (F12 → Capture full-page screenshot)
   - Save as `baseline-{browser}.png`

2. **Compare across browsers:**
   - Use tool like [DiffChecker](https://www.diffchecker.com/image-diff/)
   - Upload Chrome, Firefox, Safari screenshots
   - **Expected:** < 5% visual difference
   - Minor antialiasing differences are OK

3. **Save for future reference:**
   - Store screenshots in `pstudios-landingpage/test-screenshots/`
   - Document date and browser version
   - Use for regression testing after updates

---

## Automated Testing Scripts

### Quick Performance Test
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse http://localhost:3000 --view --only-categories=performance,accessibility

# Expected scores:
# Performance: ≥ 90
# Accessibility: 100
```

### Font Loading Test (Node.js)
```javascript
// test-font-loading.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Track font loads
  const fonts = [];
  page.on('response', response => {
    if (response.url().includes('.woff2')) {
      fonts.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length']
      });
    }
  });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  console.log('Fonts loaded:', fonts);
  
  // Check font features
  const h1Styles = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const styles = window.getComputedStyle(h1);
    return {
      fontFamily: styles.fontFamily,
      fontFeatureSettings: styles.fontFeatureSettings,
      letterSpacing: styles.letterSpacing,
      textRendering: styles.textRendering
    };
  });
  
  console.log('H1 Styles:', h1Styles);
  
  await browser.close();
})();
```

Run with:
```bash
node test-font-loading.js
```

---

## Common Issues & Solutions

### Issue: Fonts not loading
**Solution:**
1. Check file paths in browser Network tab
2. Ensure CORS headers set if using CDN
3. Verify MIME type is `font/woff2`
4. Check for typos in `@font-face` declarations

### Issue: Text appears blurry
**Solution:**
1. Remove `backdrop-filter` from parent elements
2. Remove `transform` on text or ancestors
3. Verify antialiasing settings applied
4. Test on actual device, not just DevTools

### Issue: Font weights look wrong
**Solution:**
1. Check `font-weight` range in `@font-face` (should be 100-400)
2. Verify font file itself supports requested weights
3. Test with explicit weights (100, 200, 300, 400)

### Issue: FOIT (Flash of Invisible Text)
**Solution:**
1. Ensure `font-display: swap` is set
2. Add preload links in `<head>`
3. Check fonts load before FCP in Network waterfall

### Issue: Different rendering across browsers
**Solution:**
1. Accept minor differences (browsers render slightly differently)
2. Ensure `-webkit-font-smoothing` on Safari/Chrome
3. Ensure `-moz-osx-font-smoothing` on Firefox
4. Test actual devices, not just browser DevTools

---

## Reporting Results

### Test Report Template

```
# Font Testing Report - [Date]

## Environment
- Operating System: [Windows 11 / macOS 14 / etc.]
- Screen Resolution: [1920x1080 / etc.]
- Pixel Density: [1x / 2x Retina / etc.]

## Browser Tests

### Chrome [Version]
- Font Loading: ✅ / ❌
- Visual Quality: ✅ / ❌
- Performance: [Lighthouse Score]
- Issues: [None / List issues]

### Firefox [Version]
- Font Loading: ✅ / ❌
- Visual Quality: ✅ / ❌
- Performance: [Lighthouse Score]
- Issues: [None / List issues]

### Safari [Version]
- Font Loading: ✅ / ❌
- Visual Quality: ✅ / ❌
- Retina Display: ✅ / ❌
- Issues: [None / List issues]

## Mobile Tests

### iOS Safari [iOS Version]
- Device: [iPhone 14 Pro / etc.]
- Font Loading: ✅ / ❌
- Visual Quality: ✅ / ❌
- Accessibility: ✅ / ❌
- Issues: [None / List issues]

### Android Chrome [Version]
- Device: [Samsung Galaxy S23 / etc.]
- Font Loading: ✅ / ❌
- Visual Quality: ✅ / ❌
- Performance: [Good / Fair / Poor]
- Issues: [None / List issues]

## Overall Status
✅ PASS - All tests passed
⚠️ PARTIAL - Some issues found but acceptable
❌ FAIL - Critical issues require fixes

## Recommendations
[List any recommended improvements or follow-up actions]
```

---

## Test Frequency

### Initial Launch
- [ ] Full browser matrix (all browsers, all devices)
- [ ] Performance audits on all platforms
- [ ] Visual regression tests
- [ ] Accessibility compliance

### After Major Updates
- [ ] Quick smoke test (Chrome, Safari, iOS)
- [ ] Performance check
- [ ] Visual comparison to baseline

### Regular Maintenance
- [ ] **Monthly:** Check on latest Chrome, Safari versions
- [ ] **Quarterly:** Full browser matrix retest
- [ ] **Annually:** Update baseline screenshots

---

**Last Updated:** October 2025  
**Test Lead:** [Your Name]  
**Next Scheduled Test:** [Date]

