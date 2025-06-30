import logo from './lp_logo.svg';
import './App.css';
import React, { useState } from "react";
import BackgroundVideo from './components/BackgroundVideo';


function App() {
  
  const [showImage, setShowImage] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);

  const handleImageClick = () => {
    setShowImage(prev => !prev);
    setIsVideoActive(prev => !prev);
  };

  return (

      
        <div className="Lp-logo-container" tabIndex={-1}>
          {showImage ? (
            <div className="App" onClick={handleImageClick} tabIndex={-1}>

              <img src={logo} 

              className="App-logo" 
              alt="logo" 
              tabIndex={-1} 
              draggable={false}
              reload="auto"
              playsInLine
              disabledPictureInPicture
              controls={false}
              />

            </div>
          ) : (

            <div className="Lp-logo-container" >

              <div className="backBtn" onClick={handleImageClick}> Home </div>

              <BackgroundVideo isVideoActive={isVideoActive}/>

            </div>

          )}
        </div>
  );
}

export default App;
