# Paradigm Studios Website - Development Plan

## Project Overview
Transform the current landing page into a full-featured website for Paradigm Studios, focusing on next-gen visuals for games, branding, and narrative design.

---

## 🚀 Executive Summary

**Project Status:** Phase 2 Complete, Phase 3 In Progress

### What's Working:
- ✅ Full site structure with React Router
- ✅ Four functional pages (Home, About, Portfolio, Contact)
- ✅ Professional navigation with active indicators
- ✅ Landing logo animation system
- ✅ Design system with CSS variables
- ✅ Background video component (reusable)

### Current Priority:
**🎨 HOME PAGE:** Add paradigm color palette as flat background image behind logo during landing animation

### Next Up:
- Mobile responsive navigation (hamburger menu)
- Enhanced content for all pages
- Portfolio project showcases
- Contact form implementation

---

## Current State
- ✅ Landing page with logo (2.5s display + 1.5s fade-out)
- ✅ Auto-transition to main content
- ✅ BackgroundVideo component (reusable, used on Portfolio page)
- ✅ Brand colors: #006699 (blue), #ff9933 (orange)
- ✅ Custom fonts: Beckan, Playfair Display
- ✅ React Router DOM installed and configured
- ✅ Header navigation component with active page indicators
- ✅ Four core pages created (Home, About, Portfolio, Contact)
- ✅ Design system with CSS variables (variables.css)

---

## Development Phases

### Phase 1: Main Page Foundation ✅
**Goal:** Convert BackgroundVideo module into the actual Main Page

#### Tasks:
- ✅ **1.1** Remove placeholder content from BackgroundVideo component
  - Converted to reusable component (now used on Portfolio page)
  - Home page has its own content with welcome message
- ✅ **1.2** Preserve styling architecture
  - Video background system maintained as reusable component
  - Fade-in/fade-out animations preserved
  - Responsive design implemented
  - Color scheme and fonts maintained
- ✅ **1.3** Separate components created
  - BackgroundVideo.js is reusable component
  - Home.js created as dedicated home page
- ✅ **1.4** Create base structure for new content
  - Header/Navigation area created (Header.js)
  - Content sections framework in place (Page.css)
  - App.js configured with routing

---

### Phase 2: Site Structure & Navigation ✅ (Mostly Complete)
**Goal:** Define and implement core pages and navigation

#### Pages to Create:
- ✅ **Home/Main Page** - Landing logo animation + welcome content
- ✅ **About** - Studio information with branding images (Our Mission, Our Approach, Manifesto)
- ✅ **Portfolio/Work** - Project showcase with background video
- ⏸️ **Services** - What Paradigm Studios offers (not yet created)
- ✅ **Contact** - Email contact (jarnold@paradigmstudios.art)
- ⏸️ *(Optional)* **Blog/Insights** - Articles and updates (not yet created)

#### Navigation:
- ✅ Create navigation component (Header.js)
- ✅ Implement routing (React Router DOM v6.28.0)
- ⏳ Mobile menu/hamburger for responsive
- ✅ Active page indicators

---

### Phase 3: Content & Design Implementation ⏳
**Goal:** Implement Illustrator designs and final content

#### Design Integration:
- ⏳ Import Illustrator design files/mockups (design-assets folder exists)
- ⏳ Break down design into React components
- ✅ Implement layouts (Grid/Flexbox) - Basic structure in place
- ✅ Add animations and transitions - Fade animations implemented
- ⏳ Ensure responsive breakpoints match designs

#### Content Needs:
- ⏳ Hero section content (basic content on Home page)
- ✅ Company bio/mission statement (images on About page)
- ⏳ Portfolio project details & media (placeholder on Portfolio page)
- ⏸️ Service descriptions (page not created yet)
- ⏸️ Team bios (if applicable)
- ✅ Contact information (email on Contact page)
- ⏸️ Social media links

---

### Phase 4: Interactive Features ⏸️
**Goal:** Add engaging functionality

#### Features to Build:
- [ ] Portfolio gallery with filtering
- [ ] Lightbox/modal for project details
- [ ] Contact form with validation (currently just email link)
- [ ] Smooth scroll navigation
- [ ] Loading animations
- ✅ Video showcases (background video on Portfolio page)
- [ ] Case studies or project deep-dives

---

### Phase 5: Polish & Optimization ⏸️
**Goal:** Production-ready website

#### Tasks:
- [ ] Performance optimization
  - [ ] Image/video compression
  - [ ] Lazy loading
  - [ ] Code splitting
- [ ] SEO optimization
  - [ ] Meta tags
  - [ ] Open Graph tags
  - [ ] Sitemap
- [ ] Accessibility (WCAG compliance)
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Alt text for images
- [ ] Cross-browser testing
- [ ] Mobile testing on real devices

---

### Phase 6: Deployment ⏸️
**Goal:** Launch the website

#### Tasks:
- ✅ Build production version (build folder exists)
- ⏳ Deploy to paradigmstudios.art (CNAME configured)
- [ ] Set up analytics
- [ ] Test live site
- [ ] Monitor performance

---

## 🎯 PAGE-BY-PAGE BREAKDOWN

### 📄 HOME PAGE (Home.js)
**Current Status:** ⏳ In Progress

#### Completed:
- ✅ Landing logo animation (2.5s display + 1.5s fade-out)
- ✅ Auto-transition to main content
- ✅ Click logo to skip animation
- ✅ Welcome message and studio description
- ✅ Basic page structure

#### To Do:
- [ ] **PRIORITY:** Add paradigm color palette as flat background image behind logo during landing animation
  - Design flat image using brand colors (#006699, #ff9933)
  - Should complement/enhance the logo presentation
  - Maintain clean, modern aesthetic
- [ ] Enhance hero section with more engaging content
- [ ] Add call-to-action buttons
- [ ] Improve layout and spacing
- [ ] Add smooth transitions between sections
- [ ] Mobile responsive optimization

---

### 📄 ABOUT PAGE (About.js)
**Current Status:** ⏳ In Progress

#### Completed:
- ✅ Basic page structure
- ✅ Three branding images displayed:
  - Our Mission.webp
  - Our Approach.webp
  - Manifesto_1.webp

#### To Do:
- [ ] Add text content to accompany images
- [ ] Improve image layout and responsiveness
- [ ] Add section headers
- [ ] Add team section (if applicable)
- [ ] Add studio story/history
- [ ] Optimize image loading (lazy load)
- [ ] Add animations on scroll

---

### 📄 PORTFOLIO PAGE (Portfolio.js)
**Current Status:** ⏳ In Progress

#### Completed:
- ✅ Background video integration
- ✅ Basic overlay content
- ✅ Page structure

#### To Do:
- [ ] Add actual portfolio projects/case studies
- [ ] Create project cards/grid layout
- [ ] Add filtering by category (games, branding, narrative)
- [ ] Implement lightbox/modal for project details
- [ ] Add project images and descriptions
- [ ] Add project metadata (client, year, services)
- [ ] Video showcases for selected projects
- [ ] Hover effects and interactions

---

### 📄 CONTACT PAGE (Contact.js)
**Current Status:** ⏳ In Progress

#### Completed:
- ✅ Basic page structure
- ✅ Email contact link (jarnold@paradigmstudios.art)
- ✅ Professional messaging

#### To Do:
- [ ] Replace email link with contact form
- [ ] Add form validation
- [ ] Integrate form backend (EmailJS, FormSpree, or custom)
- [ ] Add social media links
- [ ] Add business address/location (if applicable)
- [ ] Add office hours/timezone info
- [ ] Consider adding a map (if relevant)
- [ ] Add success/error messages for form submission

---

### 📄 SERVICES PAGE (Not Yet Created)
**Current Status:** ⏸️ Not Started

#### To Do:
- [ ] Create Services.js page component
- [ ] Add route in App.js
- [ ] Add navigation link in Header.js
- [ ] Define service categories:
  - [ ] Game Visuals/Design
  - [ ] Branding & Identity
  - [ ] Narrative Design
  - [ ] Other services
- [ ] Add service descriptions and pricing (if applicable)
- [ ] Add service-specific imagery
- [ ] Add call-to-action for each service

---

### 🧩 SHARED COMPONENTS

#### Header (Header.js)
- ✅ Logo/brand name link
- ✅ Navigation links (Home, About, Portfolio, Contact)
- ✅ Active page indicators
- ⏳ Mobile hamburger menu (NOT DONE)
- [ ] Sticky header on scroll
- [ ] Smooth header background on scroll

#### BackgroundVideo (BackgroundVideo.js)
- ✅ Reusable video background component
- ✅ Fade-in animation
- ✅ Conditional rendering based on props
- [ ] Multiple video source support
- [ ] Video optimization for mobile

---

## Technical Stack

### Current:
- ✅ React 18.3.1
- ✅ React Router DOM 6.28.0 (installed and configured)
- ✅ React Scripts 5.0.1 (Create React App)
- ✅ Custom CSS with CSS Variables (variables.css)
- ✅ GitHub Pages deployment (gh-pages 6.3.0)

### To Consider Adding:
- **Framer Motion** - Advanced animations and page transitions
- **EmailJS or FormSpree** - Contact form backend
- **React Helmet** - SEO meta tags and dynamic head management
- **React Image Gallery or Lightbox** - Portfolio showcase with modal viewing
- **Intersection Observer** - Scroll animations and lazy loading

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

## 🎨 IMMEDIATE PRIORITIES (Next Steps)

1. **HOME PAGE:** Add paradigm color palette flat background image behind logo during landing animation
2. **HEADER:** Implement mobile hamburger menu for responsive navigation
3. **ABOUT PAGE:** Add text content to accompany branding images
4. **PORTFOLIO PAGE:** Start adding actual portfolio projects
5. **CONTACT PAGE:** Implement contact form with validation

---

## Legend
- ✅ Complete
- ⏳ In Progress
- ⏸️ Not Started / On Hold
- [ ] To Do

---

*Last Updated: October 12, 2025*




