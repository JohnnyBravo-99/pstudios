import React from 'react';
import '../styles/Page.css';

function Contact() {
  return (
    <div className="page-container contact-page">
      <div className="about-content-section">
        <div className="about-section">
          <h1 className="section-title">Contact Us</h1>
          <p className="section-content">
            We're always interested in ideas that challenge, connect, or surprise.
          </p>
          <div className="contact-info">
            <div className="email-section">
              <span className="email-label">📩 Email us at:</span>
              <a href="mailto:jarnold@paradigmstudios.art" className="email-link">
                jarnold@paradigmstudios.art
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
