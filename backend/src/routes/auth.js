const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendPasswordResetEmail, sendPasswordSetupEmail } = require('../utils/email');

// Safe logging function
let logDebug = () => {};
try {
  const fs = require('fs').promises;
  const path = require('path');
  const LOG_DIR = path.resolve(__dirname, '../../.cursor');
  const LOG_PATH = path.join(LOG_DIR, 'debug.log');
  logDebug = (location, message, data, hypothesisId) => {
    try {
      setImmediate(() => {
        (async () => {
          try {
            await fs.mkdir(LOG_DIR, { recursive: true });
            const logEntry = JSON.stringify({location,message,data:{...data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId})+'\n';
            await fs.appendFile(LOG_PATH, logEntry);
          } catch(e) {}
        })();
      });
    } catch(e) {}
  };
} catch(e) {
  logDebug = () => {};
}

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const requestResetSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const setupPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password is set
    if (!user.isPasswordSet || !user.passwordHash) {
      return res.status(401).json({ 
        error: 'Password not set. Please check your email for setup instructions.',
        requiresSetup: true
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      message: 'Login successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logout successful' });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  
  res.json({ user: req.user.toJSON() });
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  try {
    const { error, value } = requestResetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token and expiration (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Clear the token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
    }
  } catch (error) {
    console.error('Request reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ 
      message: 'Token is valid',
      email: user.email
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, password } = value;

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.passwordHash = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isPasswordSet = true;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initial password setup - create user if doesn't exist and send setup email
router.post('/setup-password', async (req, res) => {
  try {
    const { error, value } = requestResetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;
    const normalizedEmail = email.toLowerCase();

    // Only allow setup for the admin email
    if (normalizedEmail !== 'jarnold@paradigmstudios.art') {
      return res.status(403).json({ error: 'Unauthorized email address' });
    }

    // Find or create user
    let user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Create new user
      user = new User({
        email: normalizedEmail,
        role: 'admin',
        isPasswordSet: false
      });
      await user.save();
    }

    // If password is already set, don't allow setup
    if (user.isPasswordSet) {
      return res.status(400).json({ error: 'Password already set. Use password reset instead.' });
    }

    // Generate setup token
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');

    // Save setup token and expiration (24 hours)
    user.resetPasswordToken = setupTokenHash;
    user.resetPasswordExpires = Date.now() + 86400000; // 24 hours
    await user.save();

    // Send setup email
    try {
      await sendPasswordSetupEmail(user.email, setupToken);
      res.json({ 
        message: 'Password setup email has been sent. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('Error sending setup email:', emailError);
      // Clear the token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ error: 'Failed to send setup email. Please try again later.' });
    }
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify setup token
router.get('/verify-setup-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Setup token is required' });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired setup token' });
    }

    res.json({ 
      message: 'Token is valid',
      email: user.email
    });
  } catch (error) {
    console.error('Verify setup token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete password setup
router.post('/complete-setup', async (req, res) => {
  try {
    const { error, value } = setupPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, password } = value;

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired setup token' });
    }

    // Update password
    user.passwordHash = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isPasswordSet = true;
    await user.save();

    res.json({ message: 'Password setup successful. You can now login with your password.' });
  } catch (error) {
    console.error('Complete setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
