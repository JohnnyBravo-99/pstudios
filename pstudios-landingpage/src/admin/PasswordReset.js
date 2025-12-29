import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/Admin.css';
import API_BASE_URL from '../config/api';

function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request', 'reset'
  const [formData, setFormData] = useState({
    email: 'jarnold@paradigmstudios.art',
    password: '',
    confirmPassword: '',
    token: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check if token is in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
      verifyToken(token);
    }
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token/${token}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTokenValid(true);
        setUserEmail(data.email);
        setStep('reset');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid or expired reset token');
        setTokenValid(false);
      }
    } catch (err) {
      setError('Failed to verify token. Please try again.');
      setTokenValid(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('If an account with that email exists, a password reset link has been sent. Please check your email.');
        setFormData(prev => ({ ...prev, email: '' }));
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: formData.token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Reset Password</h1>
          {success && <div style={{ 
            background: '#28a745', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            {success}
          </div>}
          {error && <div className="error-message">{error}</div>}
          {!tokenValid && (
            <div className="error-message">
              Invalid or expired reset token. Please request a new reset link.
            </div>
          )}
          {tokenValid && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userEmail}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="login-button">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link 
              to="/admin" 
              style={{ 
                color: 'var(--color-primary)', 
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Reset Password</h1>
        {success && <div style={{ 
          background: '#28a745', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRequestReset}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a 
            href="/admin" 
            style={{ 
              color: 'var(--color-primary)', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;

