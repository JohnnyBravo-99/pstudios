import React from 'react';
import './Page.css';

function About() {
  return (
    <div className="page-container about-page">
      <div className="page-content">
        <h1 className="page-title">About Paradigm Studios</h1>
        <div className="content-section">
          <p className="page-description">
            At Paradigm Studios, we focus on next-gen visuals for games, branding, and narrative design — 
            blending form with function, aesthetics with strategy.
          </p>
          <p className="page-description">
            The clips in the background are pieces of our process: real work in motion, not placeholders.
          </p>
          <p className="page-description">
            The rest is coming together, but if something here resonates — a detail, a direction, a feeling — reach out. 
            We're always interested in ideas that challenge, connect, or surprise.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
