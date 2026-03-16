import React, { useState, useCallback } from 'react';
import '../styles/Page.css';

// Anti-scraper: number is split across fragments and only assembled on user interaction
const PH = ['(804)', '\u200B', '221', '-', '6774'];

function Contact() {
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const revealPhone = useCallback(() => setPhoneRevealed(true), []);

  const phoneNumber = PH.join('').replace(/\u200B/g, '');
  const telHref = `tel:+1${phoneNumber.replace(/\D/g, '')}`;
  const smsHref = `sms:+1${phoneNumber.replace(/\D/g, '')}`;

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
              <span className="email-label">Email us at:</span>
              <a href="mailto:jarnold@paradigmstudios.art" className="email-link">
                jarnold@paradigmstudios.art
              </a>
            </div>

            <div className="phone-section">
              {!phoneRevealed ? (
                <button className="phone-reveal-btn" onClick={revealPhone}>
                  Show Phone Number
                </button>
              ) : (
                <>
                  <span className="phone-display">{phoneNumber}</span>
                  <div className="phone-actions">
                    <a href={telHref} className="contact-action-btn contact-call-btn" aria-label="Call us">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Call
                    </a>
                    <a href={smsHref} className="contact-action-btn contact-msg-btn" aria-label="Send a text message">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Message
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
