const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    process.env.GITHUB_PAGES_URL || 'https://johnnybravo-99.github.io/pstudios',
    'https://johnnybravo-99.github.io',
    'https://johnnybravo-99.github.io/pstudios'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Static file serving for uploads
app.use('/media', express.static(process.env.UPLOAD_DIR || './uploads', {
  maxAge: '1y',
  etag: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    allowedOrigins: [
      process.env.CLIENT_ORIGIN,
      process.env.GITHUB_PAGES_URL,
      'https://johnnybravo-99.github.io',
      'https://johnnybravo-99.github.io/pstudios'
    ]
  });
});

// GitHub Pages integration endpoint
app.get('/api/github-pages-info', (req, res) => {
  res.json({
    message: 'Backend ready for GitHub Pages integration',
    apiBaseUrl: `${req.protocol}://${req.get('host')}/api`,
    allowedOrigins: [
      'https://johnnybravo-99.github.io',
      'https://johnnybravo-99.github.io/pstudios'
    ],
    endpoints: {
      auth: '/api/auth',
      portfolio: '/api/portfolio',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/pstudios')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
