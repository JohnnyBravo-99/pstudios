import React, { useState, useCallback } from 'react';
import '../styles/Page.css';
import API_BASE_URL from '../config/api';
import facebookIcon from '../assets/logo-submark-marks-iconography/facebook.png';
import instagramIcon from '../assets/logo-submark-marks-iconography/instagram.png';
import artstationIcon from '../assets/logo-submark-marks-iconography/artstation.png';


// Anti-scraper: number is split across fragments and only assembled on user interaction
const PH = ['(804)', '\u200B', '221', '-', '6774'];

function Contact() {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [intakeStatus, setIntakeStatus] = useState('idle');
  const [intakeError, setIntakeError] = useState('');

  const revealPhone = useCallback(() => setPhoneRevealed(true), []);

  const clearIntakeFeedback = useCallback(() => {
    if (intakeStatus === 'sending') return;
    setIntakeError('');
    if (intakeStatus !== 'idle') setIntakeStatus('idle');
  }, [intakeStatus]);

  /** Single step: POST to API; server sends email (no mail client). */
  const handleIntakeSubmit = useCallback(async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('intake-name') ?? '').trim();
    const email = String(data.get('intake-email') ?? '').trim();
    const subject = String(data.get('intake-subject') ?? '').trim();
    const message = String(data.get('intake-message') ?? '').trim();
    if (!name || !email || !subject || !message) return;

    setIntakeStatus('sending');
    setIntakeError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof payload.error === 'string'
            ? payload.error
            : 'Something went wrong. Please try again.';
        throw new Error(msg);
      }
      setIntakeStatus('success');
      form.reset();
    } catch (err) {
      setIntakeStatus('error');
      setIntakeError(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  }, []);

  const phoneNumber = PH.join('').replace(/\u200B/g, '');
  const telHref = `tel:+1${phoneNumber.replace(/\D/g, '')}`;
  const smsHref = `sms:+1${phoneNumber.replace(/\D/g, '')}`;

  return (
    <div className="page-container contact-page">
      <div className="about-content-section">
        <div className="about-section">
          <h1 className="section-title">Contact Us</h1>
          <p className="section-content">
            We're always interested in ideas that challenge, connect, or surprise. Reach out through
            our social platforms, the intake form below, or by phone for your next big idea!
          </p>
          <div className="social-media-section">

            <a href="https://www.instagram.com/paradigmstudios.art/" className="social-media-link">
              <img src={instagramIcon} alt="Instagram" className="social-media-icon" />
            </a>
            <a href="https://www.artstation.com/jay_arnold" className="social-media-link">
              <img src={artstationIcon} alt="ArtStation" className="social-media-icon" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61573920035177/" className="social-media-link">
              <img src={facebookIcon} alt="Facebook" className="social-media-icon" />
            </a>
          </div>
          <div className="contact-info">
            <div className="email-section intake-section">
              <span className="email-label" id="intake-form-title">
                Project intake
              </span>
              <p className="intake-hint">
                Please fill out the form below to get connected with us.
              </p>
              {intakeStatus === 'success' && (
                <p className="intake-feedback intake-feedback--success" role="status" aria-live="polite">
                  Thanks — your message was sent. We&apos;ll get back to you soon.
                </p>
              )}
              {intakeStatus === 'error' && intakeError && (
                <p className="intake-feedback intake-feedback--error" role="alert">
                  {intakeError}
                </p>
              )}
              <form
                className="intake-form"
                onSubmit={handleIntakeSubmit}
                onInput={clearIntakeFeedback}
                aria-labelledby="intake-form-title"
              >
                <div className="intake-field">
                  <label htmlFor="intake-name" className="intake-label">
                    Name <span className="intake-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="intake-name"
                    name="intake-name"
                    type="text"
                    className="intake-input"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </div>
                <div className="intake-field">
                  <label htmlFor="intake-email" className="intake-label">
                    Your email <span className="intake-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="intake-email"
                    name="intake-email"
                    type="email"
                    className="intake-input"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </div>
                <div className="intake-field">
                  <label htmlFor="intake-subject" className="intake-label">
                    Subject <span className="intake-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="intake-subject"
                    name="intake-subject"
                    type="text"
                    className="intake-input"
                    required
                    maxLength={200}
                    placeholder="e.g. Commission inquiry"
                  />
                </div>
                <div className="intake-field">
                  <label htmlFor="intake-message" className="intake-label">
                    Message <span className="intake-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="intake-message"
                    name="intake-message"
                    className="intake-textarea"
                    required
                    maxLength={8000}
                    rows={6}
                    placeholder="Tell us about your project, timeline, and how we can help."
                  />
                </div>
                <button
                  type="submit"
                  className="intake-submit"
                  disabled={intakeStatus === 'sending'}
                >
                  {intakeStatus === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
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
