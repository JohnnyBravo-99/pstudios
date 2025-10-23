const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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
    'http://localhost:3000',
    'https://johnnybravo-99.github.io',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// Mock data for development
const mockPortfolioItems = [
  {
    _id: '1',
    title: '3D Sci-Fi Weapon',
    type: '3d-asset',
    description: 'High-poly sci-fi weapon model with PBR materials',
    tags: ['PBR', 'Realtime', 'Sci-Fi'],
    meta: {
      role: 'Modeling, Texturing',
      year: 2025,
      engine: 'Unity 2022 LTS',
      software: ['Blender', 'Substance 3D Painter'],
      polycount: '12,340 tris',
      maps: ['BaseColor', 'Normal', 'Roughness', 'AO'],
      texelDensity: '10.24 px/cm',
      fileTypes: ['FBX', 'GLB', 'PNG']
    },
    media: {
      images: [
        { _id: 'media_1_1', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNjaS1GaSBXZWFwb24gRnJvbnQ8L3RleHQ+PC9zdmc+', alt: 'Sci-Fi Weapon Front View' },
        { _id: 'media_1_2', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNjaS1GaSBXZWFwb24gU2lkZTwvdGV4dD48L3N2Zz4=', alt: 'Sci-Fi Weapon Side View' }
      ]
    },
    links: {
      live: 'https://example.com',
      download: 'https://example.com/download'
    },
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'Brand Identity System',
    type: 'branding',
    description: 'Complete brand identity for tech startup',
    tags: ['Logo', 'Guidelines', 'Typography'],
    meta: {
      role: 'Identity, System',
      year: 2025,
      software: ['Illustrator', 'Photoshop', 'Figma'],
      fileTypes: ['SVG', 'PDF', 'PNG', 'AI']
    },
    media: {
      images: [
        { _id: 'media_2_1', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYW5kIElkZW50aXR5IDE8L3RleHQ+PC9zdmc+', alt: 'Logo Variations' },
        { _id: 'media_2_2', src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYW5kIElkZW50aXR5IDI8L3RleHQ+PC9zdmc+', alt: 'Brand Guidelines' }
      ]
    },
    links: {
      live: 'https://example.com/brand'
    },
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    title: 'Mobile App UI/UX',
    type: 'ui-ux',
    description: 'Modern mobile app interface design',
    tags: ['Mobile', 'iOS', 'Android'],
    meta: {
      role: 'UI/UX Designer',
      year: 2025,
      software: ['Figma', 'Sketch', 'Principle'],
      fileTypes: ['Figma', 'PNG', 'SVG']
    },
    media: {
      images: [
        { src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vYmlsZSBBcHAgMTwvdGV4dD48L3N2Zz4=', alt: 'App Screens' },
        { src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vYmlsZSBBcHAgMjwvdGV4dD48L3N2Zz4=', alt: 'User Flow' }
      ]
    },
    links: {
      live: 'https://example.com/app',
      repo: 'https://github.com/example/app'
    },
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Development server running with mock data',
    timestamp: new Date().toISOString()
  });
});

// Portfolio routes
app.get('/api/portfolio', (req, res) => {
  const publishedItems = mockPortfolioItems.filter(item => item.isPublished);
  res.json(publishedItems);
});

app.get('/api/portfolio/:id', (req, res) => {
  const item = mockPortfolioItems.find(item => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  res.json(item);
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@pstudios.com' && password === 'admin123') {
    res.cookie('token', 'mock-jwt-token', { 
      httpOnly: true, 
      secure: false, // false for development
      sameSite: 'lax'
    });
    res.json({ 
      message: 'Login successful',
      user: { 
        id: '1', 
        email: 'admin@pstudios.com', 
        role: 'admin' 
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (token === 'mock-jwt-token') {
    res.json({ 
      id: '1', 
      email: 'admin@pstudios.com', 
      role: 'admin' 
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Admin routes (mock)
app.get('/api/admin/portfolio', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(mockPortfolioItems);
});

app.get('/api/admin/portfolio/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const item = mockPortfolioItems.find(item => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  res.json(item);
});

app.post('/api/admin/portfolio', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const newItem = {
    _id: (mockPortfolioItems.length + 1).toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockPortfolioItems.push(newItem);
  res.status(201).json(newItem);
});

app.patch('/api/admin/portfolio/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const itemIndex = mockPortfolioItems.findIndex(item => item._id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  
  mockPortfolioItems[itemIndex] = {
    ...mockPortfolioItems[itemIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(mockPortfolioItems[itemIndex]);
});

app.delete('/api/admin/portfolio/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const itemIndex = mockPortfolioItems.findIndex(item => item._id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  
  mockPortfolioItems.splice(itemIndex, 1);
  res.json({ message: 'Portfolio item deleted' });
});

// Media upload endpoint
app.post('/api/admin/portfolio/:id/media', upload.single('media'), (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const item = mockPortfolioItems.find(item => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  
  // Handle the uploaded file
  const uploadedFile = req.file;
  let mediaItem;
  
  if (uploadedFile) {
    // Convert uploaded file to base64 data URL
    const fileBuffer = uploadedFile.buffer;
    const base64Data = fileBuffer.toString('base64');
    const mimeType = uploadedFile.mimetype || 'image/jpeg';
    
    mediaItem = {
      _id: `media_${Date.now()}`,
      src: `data:${mimeType};base64,${base64Data}`,
      alt: uploadedFile.originalname || req.body.alt || 'Uploaded media',
      type: 'image',
      uploadedAt: new Date().toISOString()
    };
  } else {
    // Fallback to mock image if no file uploaded
    mediaItem = {
      _id: `media_${Date.now()}`,
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lZGlhIFVwbG9hZDwvdGV4dD48L3N2Zz4=',
      alt: req.body.alt || 'Uploaded media',
      type: 'image',
      uploadedAt: new Date().toISOString()
    };
  }
  
  // Add media to the portfolio item
  if (!item.media) {
    item.media = { images: [] };
  }
  if (!item.media.images) {
    item.media.images = [];
  }
  item.media.images.push(mediaItem);
  
  res.json({
    message: 'Media uploaded successfully',
    media: mediaItem
  });
});

// Delete media endpoint
app.delete('/api/admin/portfolio/:id/media/:mediaId', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const item = mockPortfolioItems.find(item => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  
  if (!item.media || !item.media.images) {
    return res.status(404).json({ error: 'Media not found' });
  }
  
  const mediaIndex = item.media.images.findIndex(media => media._id === req.params.mediaId);
  if (mediaIndex === -1) {
    return res.status(404).json({ error: 'Media item not found' });
  }
  
  item.media.images.splice(mediaIndex, 1);
  
  res.json({ message: 'Media deleted successfully' });
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
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on port ${PORT}`);
  console.log(`📊 Mock data mode - no database required`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
  console.log(`💡 Admin login: admin@pstudios.com / admin123`);
});

module.exports = app;
