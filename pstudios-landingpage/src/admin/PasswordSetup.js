import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/Admin.css';
import API_BASE_URL from '../config/api';

function PasswordSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-setup-token/${token}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTokenValid(true);
        setUserEmail(data.email);
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid or expired setup token');
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

  const handleSetupPassword = async (e) => {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/complete-setup`, {
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
        setSuccess('Password setup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to setup password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Setup Password</h1>
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
              Invalid or expired setup token. Please request a new setup link.
            </div>
          )}
          {tokenValid && (
            <form onSubmit={handleSetupPassword}>
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
                {loading ? 'Setting up password...' : 'Setup Password'}
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
        <h1>Setup Password</h1>
        {error && <div className="error-message">{error}</div>}
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Please check your email for the password setup link, or contact the administrator.
        </p>
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

export default PasswordSetup;

