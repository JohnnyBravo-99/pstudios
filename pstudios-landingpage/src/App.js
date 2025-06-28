import logo from './lp_logo.svg';
import './App.css';
import React, { useState } from "react";


function App() {
  
  const [showImage, setShowImage] = useState(true);

  const handleImageClick = () => {
    setShowImage(prev => !prev);
  };

  return (

      
        <div className="Lp-logo-container">
          {showImage ? (
            <div className="App" onClick={handleImageClick}>

              <img src={logo} className="App-logo" alt="logo" />

            </div>
          ) : (

            <div className="Lp-logo-container" >

              <div className="contact-info" onClick={handleImageClick}>
                <h1>
                  <p>
                      Test writing...
                  </p>
                </h1>
              </div>

            </div>

          )};
        </div>
  );
}

export default App;
