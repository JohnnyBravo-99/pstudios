const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Safe logging function - completely non-blocking and error-proof
let logDebug = () => {}; // Default no-op function
try {
  const fs = require('fs').promises;
  const path = require('path');
  // Use absolute path to workspace root .cursor directory
  const LOG_DIR = path.resolve(__dirname, '../../.cursor');
  const LOG_PATH = path.join(LOG_DIR, 'debug.log');
  logDebug = (location, message, data, hypothesisId) => {
    // Fire and forget - don't block execution, catch all errors
    try {
      setImmediate(() => {
        (async () => {
          try {
            // Ensure directory exists
            await fs.mkdir(LOG_DIR, { recursive: true });
            const logEntry = JSON.stringify({location,message,data:{...data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId})+'\n';
            await fs.appendFile(LOG_PATH, logEntry);
          } catch(e) {
            // Silently fail - don't crash the server
          }
        })();
      });
    } catch(e) {
      // If even setImmediate fails, just ignore
    }
  };
} catch(e) {
  // If logging setup fails, use no-op function
  logDebug = () => {};
}

// Verify JWT token from cookie
const authenticateToken = async (req, res, next) => {
  
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    
    next();
  } catch (error) {
    
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user has editor or admin role
const requireEditor = (req, res, next) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Editor access required' });
  }
  next();
};

// Validate API key or fall through to JWT authentication
// This allows Discord bot to authenticate with API key while preserving JWT for admin panel
const validateApiKeyOrToken = async (req, res, next) => {
  // Check for API key in headers
  const apiKey = req.headers['x-api-key'] || 
                 (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') 
                   ? req.headers['authorization'].replace('Bearer ', '') 
                   : null);
  
  // If API key is provided and matches, authenticate as admin
  if (apiKey && process.env.DISCORD_BOT_API_KEY && apiKey === process.env.DISCORD_BOT_API_KEY) {
    // Set req.user with admin role for API key authentication
    req.user = {
      _id: 'discord-bot-service',
      role: 'admin',
      email: 'discord-bot@paradigmstudios.art'
    };
    return next();
  }
  
  // No valid API key, fall through to JWT authentication
  return authenticateToken(req, res, next);
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEditor,
  validateApiKeyOrToken
};
