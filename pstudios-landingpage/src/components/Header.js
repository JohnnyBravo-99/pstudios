import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataCache } from '../context/DataCacheContext';
import verticalLogo from '../assets/logo-submark-marks-iconography/verticalStacked_01a.svg';
import squareLogo from '../assets/logo-submark-marks-iconography/logo87x87mm.png';
import '../styles/Header.css';

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        
        {/* Desktop Navigation */}
        <ul className="nav-menu desktop-nav">
          <li className={`nav-item ${isActive('/')}`}>
            <Link to="/" className="nav-link" state={{ fromHome: true }}>Home</Link>
          </li>
          <li className={`nav-item ${isActive('/about')}`}>
            <Link to="/about" className="nav-link">About</Link>
          </li>
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
            <li className={`mobile-nav-item ${isActive('/about')}`}>
              <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>About Us</Link>
            </li>
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
