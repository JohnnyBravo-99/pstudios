# Paradigm Studios Website - Development Plan

## Project Overview
Transform the current landing page into a full-featured website for Paradigm Studios, focusing on next-gen visuals for games, branding, and narrative design.

---

## Current State
- ✅ Landing page with logo (2.5s display + 1.5s fade-out)
- ✅ Auto-transition to main content
- ✅ BackgroundVideo component (temporary content)
- ✅ Brand colors: #006699 (blue), #ff9933 (orange)
- ✅ Custom fonts: Beckan, Playfair Display

---

## Development Phases

### Phase 1: Main Page Foundation ⏳
**Goal:** Convert BackgroundVideo module into the actual Main Page

#### Tasks:
- [ ] **1.1** Remove placeholder content from BackgroundVideo component
  - Remove "We Are Paradigm Studios" heading
  - Remove placeholder text about the site
  - Remove "Website launching soon" message
  - Remove temporary email contact section
  - Keep "Home" button functionality
- [ ] **1.2** Preserve styling architecture
  - Keep video background system
  - Maintain fade-in/fade-out animations
  - Preserve responsive design (mobile/desktop)
  - Keep color scheme and fonts
- [ ] **1.3** Rename component (optional)
  - Consider renaming `BackgroundVideo.js` → `MainPage.js`
  - Update imports if renamed
- [ ] **1.4** Create base structure for new content
  - Header/Navigation area
  - Content sections framework
  - Footer area

---

### Phase 2: Site Structure & Navigation
**Goal:** Define and implement core pages and navigation

#### Pages to Create:
- [ ] **Home/Main Page** (current BackgroundVideo conversion)
- [ ] **About** - Studio information, team, philosophy
- [ ] **Portfolio/Work** - Project showcase gallery
- [ ] **Services** - What Paradigm Studios offers
- [ ] **Contact** - Contact form and information
- [ ] *(Optional)* **Blog/Insights** - Articles and updates

#### Navigation:
- [ ] Create navigation component
- [ ] Implement routing (React Router)
- [ ] Mobile menu/hamburger for responsive
- [ ] Active page indicators

---

### Phase 3: Content & Design Implementation
**Goal:** Implement Illustrator designs and final content

#### Design Integration:
- [ ] Import Illustrator design files/mockups
- [ ] Break down design into React components
- [ ] Implement layouts (Grid/Flexbox)
- [ ] Add animations and transitions
- [ ] Ensure responsive breakpoints match designs

#### Content Needs:
- [ ] Hero section content
- [ ] Company bio/mission statement
- [ ] Portfolio project details & media
- [ ] Service descriptions
- [ ] Team bios (if applicable)
- [ ] Contact information
- [ ] Social media links

---

### Phase 4: Interactive Features
**Goal:** Add engaging functionality

#### Features to Build:
- [ ] Portfolio gallery with filtering
- [ ] Lightbox/modal for project details
- [ ] Contact form with validation
- [ ] Smooth scroll navigation
- [ ] Loading animations
- [ ] Video showcases (beyond background)
- [ ] Case studies or project deep-dives

---

### Phase 5: Polish & Optimization
**Goal:** Production-ready website

#### Tasks:
- [ ] Performance optimization
  - Image/video compression
  - Lazy loading
  - Code splitting
- [ ] SEO optimization
  - Meta tags
  - Open Graph tags
  - Sitemap
- [ ] Accessibility (WCAG compliance)
  - Keyboard navigation
  - Screen reader support
  - Alt text for images
- [ ] Cross-browser testing
- [ ] Mobile testing on real devices

---

### Phase 6: Deployment
**Goal:** Launch the website

#### Tasks:
- [ ] Build production version
- [ ] Deploy to paradigmstudios.art
- [ ] Set up analytics
- [ ] Test live site
- [ ] Monitor performance

---

## Technical Stack

### Current:
- React 19.1.0
- React Scripts (Create React App)
- Custom CSS (no framework)
- GitHub Pages deployment

### To Consider Adding:
- **React Router** - Page routing/navigation
- **Framer Motion** - Advanced animations
- **EmailJS or FormSpree** - Contact form backend
- **React Helmet** - SEO meta tags
- **React Image Gallery** - Portfolio showcase

---

## Design System

### Colors:
- Primary Blue: `#006699`
- Primary Orange: `#ff9933`
- Background: Dark/Black tones
- Text: White/Light colors

### Typography:
- **Headings:** Beckan (font-weight: 100)
- **Body:** Playfair Display
- Font sizes: Responsive with `clamp()`

### Animations:
- Fade transitions: 1.5s ease-in-out
- Landing page: 2.5s display, 1.5s fade-out
- Video background: 3s fade-in with blur

---

## Notes & Decisions

### Design Import Process:
1. Export artboards from Illustrator as PNG/JPG
2. Share design files for visual interpretation
3. Break down into component structure
4. Implement with React + CSS
5. Iterate based on feedback

### Priority Features:
- Portfolio showcase (core business need)
- Professional, modern aesthetic
- Fast loading times
- Mobile-first responsive

---

## Timeline Estimate
- **Phase 1:** 1-2 days (Main page foundation)
- **Phase 2:** 2-3 days (Navigation & routing)
- **Phase 3:** 3-5 days (Design implementation)
- **Phase 4:** 2-3 days (Interactive features)
- **Phase 5:** 2-3 days (Polish & optimization)
- **Phase 6:** 1 day (Deployment)

**Total Estimate:** 11-17 days of active development

---

## Questions to Answer
- [ ] What portfolio projects to showcase?
- [ ] Need a CMS or keep content in code?
- [ ] Video hosting (self-hosted vs. Vimeo/YouTube)?
- [ ] Contact form - where should submissions go?
- [ ] Any third-party integrations needed?

---

*Last Updated: October 10, 2025*




