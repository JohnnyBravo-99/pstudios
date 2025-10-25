import React from 'react';
import '../styles/Page.css';

function About() {
  return (
    <div className="page-container about-page">
      <div className="about-content-section">
        <div className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-content">
          Paradigm Studios exists to forge meaningful visual identities and immersive digital worlds by blending artistic ingenuity 
          with technical excellence. We collaborate with the talented to bring clarity, distinction, and imagination 
          to the brands and worlds we help shape.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Our Approach</h2>
          <p className="section-content">
            Every project begins with immersive discovery. We collaborate 
            deeply with our clients to translate ambitions into experiences, 
            then sculpt bold, intelligent visuals that elevate brands into 
            the future."
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Our Manifesto</h2>
          <p className="section-content">
          At Paradigm Studios, we believe design is more than craft — it is catalyst.
          It is a catalyst for connection, imagination, and evolution.
          We build brands not only to be seen, but to be remembered, trusted, and celebrated.
          The future belongs to those bold enough to shape it — and we are here to help shape yours.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Our Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <h3 className="step-title">Discovery</h3>
              <p className="step-content">Understanding your vision, goals, and target audience</p>
            </div>
            <div className="process-step">
              <h3 className="step-title">Design</h3>
              <p className="step-content">Creating concepts and iterating based on your feedback</p>
            </div>
            <div className="process-step">
              <h3 className="step-title">Development</h3>
              <p className="step-content">Bringing designs to life with precision and care</p>
            </div>
            <div className="process-step">
              <h3 className="step-title">Delivery</h3>
              <p className="step-content">Final implementation and ongoing support</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3 className="feature-title">Expert Craftsmanship</h3>
              <p className="feature-content">Years of experience in game visuals, branding, and narrative design</p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Collaborative Process</h3>
              <p className="feature-content">We work closely with you every step of the way</p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Technical Excellence</h3>
              <p className="feature-content">Cutting-edge tools and techniques for optimal results</p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Timely Delivery</h3>
              <p className="feature-content">Projects completed on schedule with consistent communication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
