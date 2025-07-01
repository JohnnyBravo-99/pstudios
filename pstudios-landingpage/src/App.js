import logo from './lp_logo.svg';
import './App.css';
import React, { useState } from "react";
import BackgroundVideo from './components/BackgroundVideo';


function App() {
  
  const [showImage, setShowImage] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [fadeInLogo, setFadeInLogo] = useState(false);


const handleImageClick = () => {
  if (showImage) {
    // Clicked logo to enter video mode
    setShowImage(false);
    setIsVideoActive(true);
  } else {
    // Clicked "Home" to return
    setIsVideoActive(false);

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
            <div className={`App ${fadeInLogo ? 'fade-in' : ''}`} tabIndex={-1}>

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
