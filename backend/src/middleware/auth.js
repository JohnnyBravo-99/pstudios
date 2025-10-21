const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEditor
};
