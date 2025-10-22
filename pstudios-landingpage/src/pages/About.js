import React from 'react';
import '../styles/Page.css';

function About() {
  return (
    <div className="page-container about-page">
      <div className="about-content-section">
        <div className="about-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-content">
            At Paradigm Studios, we craft next-generation visual experiences that push the boundaries of digital artistry.
            From immersive game worlds to striking brand identities, our mission is to transform creative visions into
            stunning realities that captivate and inspire.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Our Approach</h2>
          <p className="section-content">
            Every project begins with deep collaboration and strategic thinking. We blend artistic intuition with
            technical precision, ensuring that each design serves both aesthetic beauty and functional purpose.
            Our process is transparent, iterative, and always client-focused.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Our Manifesto</h2>
          <p className="section-content">
            Design is not just about making things look beautiful—it's about creating experiences that matter.
            We believe in the power of visual storytelling, the importance of pixel-perfect execution, and the
            endless potential of creative collaboration. Every project is an opportunity to innovate, inspire,
            and leave a lasting impression.
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
