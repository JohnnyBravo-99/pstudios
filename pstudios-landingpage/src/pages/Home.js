import React from 'react';
import BackgroundVideo from '../components/BackgroundVideo';
import './Page.css';

function Home() {
  return (
    <div className="page-container home-page">
      <BackgroundVideo isVideoActive={true} />
      <div className="page-content overlay-content">
        <h1 className="page-title">Welcome to Paradigm Studios</h1>
        <p className="page-description">
          This isn't the full site — but it's not empty either. 
          What you're seeing (and how you're seeing it) is part of what we do. 
          Every frame, every detail — designed by us, with intention.
        </p>
      </div>
    </div>
  );
}

export default Home;
