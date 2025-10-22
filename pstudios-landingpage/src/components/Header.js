import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo-submark-marks-iconography/verticalStacked_01a.svg';
import '../styles/Header.css';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="main-header">
      <nav className="nav-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src={logoImage} alt="Paradigm Studios Logo" className="header-vertical-logo" />
          </Link>
        </div>
        
        <ul className="nav-menu">
          <li className={`nav-item ${isActive('/')}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className={`nav-item ${isActive('/about')}`}>
            <Link to="/about" className="nav-link">About Us</Link>
          </li>
          <li className={`nav-item ${isActive('/portfolio')}`}>
            <Link to="/portfolio" className="nav-link">Our Portfolio</Link>
          </li>
          <li className={`nav-item ${isActive('/services')}`}>
            <Link to="/services" className="nav-link">Services</Link>
          </li>
          <li className={`nav-item ${isActive('/contact')}`}>
            <Link to="/contact" className="nav-link">Contact Us</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
