const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Load environment variables based on NODE_ENV
// Use absolute path to ensure .env file is found regardless of working directory
const envFileName = process.env.NODE_ENV === 'development' 
  ? '.env.development' 
  : '.env';
const envFile = path.join(__dirname, '..', envFileName);

require('dotenv').config({ path: envFile });

const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');

const app = express();
// Default to 3001 in development to avoid conflict with frontend on 3000
const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 3001 : 3000);

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

// CORS configuration - Enhanced for mobile compatibility
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      'https://www.paradigmstudios.art',
      'https://paradigmstudios.art',
      'https://johnnybravo-99.github.io',
      'https://johnnybravo-99.github.io/pstudios',
      // Local development origins
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS blocked origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight requests explicitly for mobile browsers
app.options('*', cors());

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

// Request logging middleware for admin routes (development only)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/admin', (req, res, next) => {
    console.log(`[Admin] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
// Use different database URLs for dev vs production
const getDatabaseUrl = () => {
  // If DATABASE_URL is explicitly set, use it (but ensure correct port for dev)
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    // In development, ensure MongoDB port is 27017 (not 3000)
    if (process.env.NODE_ENV === 'development') {
      // Replace any incorrect port with 27017 for MongoDB
      const correctedUrl = url.replace(/mongodb:\/\/[^:]+:\d+/, (match) => {
        if (match.includes(':3000')) {
          return match.replace(':3000', ':27017');
        }
        return match;
      });
      return correctedUrl;
    }
    return url;
  }
  // Development default: use separate dev database on port 27017
  if (process.env.NODE_ENV === 'development') {
    return 'mongodb://localhost:27017/pstudios-dev';
  }
  // Production default
  return 'mongodb://localhost:27017/pstudios';
};

const databaseUrl = getDatabaseUrl();

mongoose.connect(databaseUrl)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
