import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataCache } from '../context/DataCacheContext';
import verticalLogo from '../assets/logo-submark-marks-iconography/verticalStacked_01a.svg';
import squareLogo from '../assets/logo-submark-marks-iconography/logo87x87mm.png';
import '../styles/Header.css';

/** Public pages where desktop nav links fade with scroll */
const HEADER_SCROLL_HIDE_PATHS = new Set(['/', '/portfolio', '/contact']);

/** Ease-in-out cubic on [0,1] — slows at ends so fade feels longer through the band */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /** Smoothed opacity for desktop nav links (target is derived from scroll; this eases toward it) */
  const [navLinksOpacity, setNavLinksOpacity] = useState(1);
  const targetOpacityRef = useRef(1);
  const smoothOpacityRef = useRef(1);
  const animFrameRef = useRef(0);
  const loopActiveRef = useRef(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    // Initialize based on current window size
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1400;
    }
    return true; // Default to square logo on server-side
  });
  const { prefetchPortfolio } = useDataCache();

  // Detect screen size to switch logos
  useEffect(() => {
    const checkScreenSize = () => {
      // Use square logo when screen width is less than 1400px to prevent overlap
      setIsSmallScreen(window.innerWidth < 1400);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Prefetch portfolio on link hover
  const handlePortfolioLinkHover = () => {
    if (location.pathname !== '/portfolio') {
      prefetchPortfolio();
    }
  };

  /**
   * Target opacity from scroll: long fade band (~35% of document height, min ~520px),
   * ease-in-out along that band so the change is elongated, not a short ramp.
   */
  const updateTargetFromScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const y = window.scrollY;
    const scrollHeight = root.scrollHeight;
    const revealDepth = Math.max(scrollHeight * 0.38, 560);
    let v = 1;
    if (y <= 0) {
      v = 1;
    } else if (y >= revealDepth) {
      v = 0;
    } else {
      const t = y / revealDepth;
      v = 1 - easeInOutCubic(t);
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      v = y <= 0 ? 1 : y >= revealDepth ? 0 : 1 - y / revealDepth;
    }
    targetOpacityRef.current = v;
  }, []);

  const scrollHideActive =
    HEADER_SCROLL_HIDE_PATHS.has(location.pathname) && !isMobileMenuOpen;

  useEffect(() => {
    if (!scrollHideActive) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = 0;
      }
      loopActiveRef.current = false;
      targetOpacityRef.current = 1;
      smoothOpacityRef.current = 1;
      setNavLinksOpacity(1);
      return undefined;
    }

    /** Per frame: move displayed opacity toward target (elongated ease — not instant snap) */
    const SMOOTH = 0.095;
    const EPS = 0.002;

    const runFrame = () => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const target = targetOpacityRef.current;
      let smooth = smoothOpacityRef.current;

      if (reduceMotion) {
        smooth = target;
      } else {
        smooth += (target - smooth) * SMOOTH;
        if (Math.abs(target - smooth) < EPS) smooth = target;
      }
      smoothOpacityRef.current = smooth;
      setNavLinksOpacity(smooth);

      const settled = Math.abs(target - smooth) < EPS;
      if (!settled && !reduceMotion) {
        animFrameRef.current = requestAnimationFrame(runFrame);
      } else {
        loopActiveRef.current = false;
        animFrameRef.current = 0;
      }
    };

    const onScrollOrResize = () => {
      updateTargetFromScroll();
      if (!loopActiveRef.current) {
        loopActiveRef.current = true;
        animFrameRef.current = requestAnimationFrame(runFrame);
      }
    };

    updateTargetFromScroll();
    smoothOpacityRef.current = targetOpacityRef.current;
    setNavLinksOpacity(targetOpacityRef.current);
    onScrollOrResize();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = 0;
      }
      loopActiveRef.current = false;
    };
  }, [scrollHideActive, location.pathname, updateTargetFromScroll]);

  const navLinksStyle =
    scrollHideActive && !isMobileMenuOpen
      ? {
          opacity: navLinksOpacity,
          pointerEvents: navLinksOpacity < 0.05 ? 'none' : 'auto',
        }
      : undefined;

  return (
    <header className="main-header">
      <nav className="nav-container">
        <div className="logo-section">
          <Link 
            to="/" 
            className="logo-link" 
            onClick={closeMobileMenu}
            state={{ fromHome: true }}
          >
            <img 
              src={isSmallScreen ? squareLogo : verticalLogo} 
              alt="Paradigm Studios Logo" 
              className={isSmallScreen ? "header-square-logo" : "header-vertical-logo"} 
            />
          </Link>
        </div>
        
        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        {/* Desktop page links only — opacity eases with scroll (logo + hamburger stay visible) */}
        <ul
          className={`nav-menu desktop-nav${scrollHideActive ? ' nav-menu--scroll-opacity' : ''}`}
          style={navLinksStyle}
        >
          <li className={`nav-item ${isActive('/')}`}>
            <Link to="/" className="nav-link" state={{ fromHome: true }}>Home</Link>
          </li>
          {/* About page hidden for now - will finish later */}
          <li className={`nav-item ${isActive('/portfolio')}`}>
            <Link 
              to="/portfolio" 
              className="nav-link"
              onMouseEnter={handlePortfolioLinkHover}
            >
              Portfolio
            </Link>
          </li>
          <li className={`nav-item ${isActive('/contact')}`}>
            <Link to="/contact" className="nav-link">Contact</Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}>
        <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
          <ul className="mobile-nav-menu">
            <li className={`mobile-nav-item ${isActive('/')}`}>
              <Link 
                to="/" 
                className="mobile-nav-link" 
                onClick={closeMobileMenu}
                state={{ fromHome: true }}
              >
                Home
              </Link>
            </li>
            {/* About page hidden for now - will finish later */}
            <li className={`mobile-nav-item ${isActive('/portfolio')}`}>
              <Link 
                to="/portfolio" 
                className="mobile-nav-link" 
                onClick={closeMobileMenu}
                onTouchStart={handlePortfolioLinkHover}
              >
                Our Portfolio
              </Link>
            </li>
            <li className={`mobile-nav-item ${isActive('/contact')}`}>
              <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>Contact Us</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
