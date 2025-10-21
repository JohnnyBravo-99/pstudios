import React, { useState, useEffect } from 'react';
import logo from '../assets/logo-submark-marks-iconography/lp_logo.svg';
import './Page.css';

function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [fadeOutLogo, setFadeOutLogo] = useState(false);

  // Auto-transition from landing page to main content
  useEffect(() => {
    // Start fade-out after 2.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOutLogo(true);
    }, 2500);

    // Complete transition after fade-out (2.5s + 1.5s = 4s total)
    const transitionTimer = setTimeout(() => {
      setShowLanding(false);
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  // Allow clicking logo to skip ahead
  const handleLogoClick = () => {
    if (showLanding) {
      setFadeOutLogo(true);
      setTimeout(() => {
        setShowLanding(false);
      }, 1500);
    }
  };

  if (showLanding) {
    return (
      <div className="landing-container">
        <div className={`landing-logo ${fadeOutLogo ? 'fade-out-logo' : ''}`}>
          <img 
            src={logo} 
            className="App-logo" 
            alt="Paradigm Studios Logo" 
            onClick={handleLogoClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container home-page">
      <div className="page-content">
        <h1 className="page-title">
          <span className="title-welcome">Welcome to </span>
          <span className="title-paradigm">Paradigm </span>
          <span className="title-studios">Studios</span>
        </h1>
        <p className="page-description">
          This isn't the full site — but it's not empty either. 
          What you're seeing (and how you're seeing it) is part of what we do. 
          Every frame, every detail — designed by us, with intention.
        </p>
        <p className="page-description">
          At Paradigm Studios, we focus on next-gen visuals for games, branding, and narrative design — 
          blending form with function, aesthetics with strategy.
        </p>
      </div>
    </div>
  );
}

export default Home;
