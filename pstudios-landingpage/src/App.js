import logo from './lp_logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import BackgroundVideo from './components/BackgroundVideo';


function App() {
  
  const [showImage, setShowImage] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [fadeInLogo, setFadeInLogo] = useState(false);
  const [fadeOutLogo, setFadeOutLogo] = useState(false);

  // Auto-transition from landing page to main site
  useEffect(() => {
    // Start fade-out after 2.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOutLogo(true);
    }, 2500);

    // Complete transition after fade-out (2.5s + 1.5s = 4s total)
    const transitionTimer = setTimeout(() => {
      setShowImage(false);
      setIsVideoActive(true);
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

const handleImageClick = () => {
  if (showImage) {
    // Clicked logo to enter video mode (keeping this as backup)
    setFadeOutLogo(true);
    setTimeout(() => {
      setShowImage(false);
      setIsVideoActive(true);
    }, 1500);
  } else {
    // Clicked "Home" to return
    setIsVideoActive(false);
    setFadeOutLogo(false);

    setTimeout(() => {
      setShowImage(true);
      setFadeInLogo(true);
    }, 100);

    setTimeout(() => {
      setFadeInLogo(false);
    }, 1600);
  }
};

  return (

      
        <div className="Lp-logo-container" tabIndex={-1}>
          {showImage ? (
            <div className={`App ${fadeInLogo ? 'fade-in' : ''} ${fadeOutLogo ? 'fade-out-logo' : ''}`} tabIndex={-1}>

              <img src={logo} 

              className="App-logo" 
              alt="logo" 
              tabIndex={-1} 
              reload="auto"
              onClick={handleImageClick}
              />

            </div>
          ) : (

            <div className="Lp-logo-container" >
              <BackgroundVideo isVideoActive={isVideoActive} onBack={handleImageClick}/>
            </div>
          )}
        </div>
  );
}

export default App;
