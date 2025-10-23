import React from 'react';
import '../styles/Page.css';

function Contact() {
  return (
    <div className="page-container contact-page">
      <div className="page-content">
        <h1 className="page-title">Contact Us</h1>
        <div className="content-section">
          <p className="page-description">
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
