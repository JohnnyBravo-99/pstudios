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
    'http://localhost:3001',
    'http://localhost:3002',
    'https://johnnybravo-99.github.io',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key']
}));

// Body parsing middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// Mock blog posts for development
const mockBlogPosts = [
  {
    _id: 'blog_1',
    title: 'The Art of Game Visual Design: Creating Immersive Worlds',
    subject: 'Game Design',
    body: 'Game visual design is more than just creating pretty graphics. It\'s about crafting an immersive experience that draws players into your world. In this post, we explore the fundamental principles of visual design in games, from color theory to environmental storytelling. Learn how to use visual elements to guide player attention, establish mood, and reinforce narrative themes.',
    slug: 'art-of-game-visual-design-creating-immersive-worlds',
    media: {
      image: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmMzYzQ1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWUgVmlzdWFsIERlc2lnbjwvdGV4dD48L3N2Zz4=',
        alt: 'Game Visual Design Concept',
        caption: 'Exploring immersive game worlds'
      }
    },
    order: 1,
    isPublished: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    _id: 'blog_2',
    title: 'Brand Identity Systems: Building Cohesive Visual Languages',
    subject: 'Branding',
    body: 'A strong brand identity is the foundation of any successful business. It\'s not just about a logo—it\'s about creating a cohesive visual language that communicates your values, resonates with your audience, and sets you apart from competitors. We break down the essential components of brand identity systems and share practical tips for developing your own.',
    slug: 'brand-identity-systems-building-cohesive-visual-languages',
    media: {
      image: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYW5kIElkZW50aXR5PC90ZXh0Pjwvc3ZnPg==',
        alt: 'Brand Identity System',
        caption: 'Building cohesive brand systems'
      }
    },
    order: 2,
    isPublished: true,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  },
  {
    _id: 'blog_3',
    title: '3D Asset Creation Workflow: From Concept to Game Engine',
    subject: '3D Art',
    body: 'Creating 3D assets for games requires a well-structured workflow that balances quality with performance. In this comprehensive guide, we walk through the entire process—from initial concept sketches to optimized assets ready for your game engine. Learn about modeling techniques, texturing workflows, and optimization strategies that will help you create professional-quality 3D assets efficiently.',
    slug: '3d-asset-creation-workflow-from-concept-to-game-engine',
    media: {
      image: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTYzYzQ1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjNEIEFzc2V0IENyZWF0aW9uPC90ZXh0Pjwvc3ZnPg==',
        alt: '3D Asset Creation',
        caption: 'From concept to game engine'
      }
    },
    order: 3,
    isPublished: true,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05')
  },
  {
    _id: 'blog_4',
    title: 'Narrative Design: Crafting Stories That Resonate',
    subject: 'Narrative Design',
    body: 'Great games tell great stories. Narrative design is the art of weaving compelling narratives into interactive experiences. Whether you\'re creating a linear story or an open-world adventure, understanding narrative structure, character development, and player agency is crucial. Discover how to craft narratives that engage players emotionally and keep them invested in your game world.',
    slug: 'narrative-design-crafting-stories-that-resonate',
    media: {
      image: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjM0YjQ1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5hcnJhdGl2ZSBEZXNpZ248L3RleHQ+PC9zdmc+',
        alt: 'Narrative Design',
        caption: 'Crafting compelling game stories'
      }
    },
    order: 4,
    isPublished: true,
    createdAt: new Date('2024-12-28'),
    updatedAt: new Date('2024-12-28')
  },
  {
    _id: 'blog_5',
    title: 'UI/UX Design for Games: Creating Intuitive Interfaces',
    subject: 'UI/UX',
    body: 'User interface design in games is a unique challenge. Unlike traditional web or app interfaces, game UIs must be intuitive, unobtrusive, and enhance the gameplay experience rather than distract from it. Learn about information hierarchy, menu design, HUD elements, and accessibility considerations that will help you create interfaces players love to use.',
    slug: 'ui-ux-design-for-games-creating-intuitive-interfaces',
    media: {
      image: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNzM1YTQ1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWUgVUkgRGVzaWduPC90ZXh0Pjwvc3ZnPg==',
        alt: 'Game UI/UX Design',
        caption: 'Creating intuitive game interfaces'
      }
    },
    order: 5,
    isPublished: true,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20')
  }
];

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

// Blog routes
app.get('/api/blog', (req, res) => {
  console.log('📝 GET /api/blog - Returning mock blog posts');
  const publishedPosts = mockBlogPosts
    .filter(post => post.isPublished)
    .sort((a, b) => {
      // Sort by order first, then by createdAt (newest first)
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  console.log(`📝 Found ${publishedPosts.length} published blog posts`);
  res.json(publishedPosts);
});

app.get('/api/blog/:slug', (req, res) => {
  const post = mockBlogPosts.find(post => post.slug === req.params.slug);
  if (!post || !post.isPublished) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  res.json(post);
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

  // Use environment variables for dev credentials (never hardcode in production!)
  const DEV_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@example.com';
  const DEV_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'changeme';

  if (email === DEV_EMAIL && password === DEV_PASSWORD) {
    res.cookie('token', 'mock-jwt-token', { 
      httpOnly: true, 
      secure: false, // false for development
      sameSite: 'lax'
    });
    res.json({
      message: 'Login successful',
      user: {
        id: '1',
        email: DEV_EMAIL,
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
app.get('/api/admin/blog', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(mockBlogPosts);
});

app.get('/api/admin/blog/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const post = mockBlogPosts.find(post => post._id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  res.json(post);
});

app.post('/api/admin/blog', (req, res) => {
  // Check for API key authentication (Discord bot) or JWT token (admin panel)
  const apiKey = req.headers['x-api-key'] || 
                 (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') 
                   ? req.headers['authorization'].replace('Bearer ', '') 
                   : null);
  const token = req.cookies.token;
  
  // Validate API key if provided (for Discord bot)
  if (apiKey) {
    const expectedApiKey = process.env.DISCORD_BOT_API_KEY || 'dev-api-key-for-testing';
    if (apiKey !== expectedApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    // API key valid, proceed with creating blog post
  } else if (token !== 'mock-jwt-token') {
    // No API key, check JWT token (for admin panel)
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Validate required fields
  if (!req.body.title || !req.body.subject || !req.body.body) {
    return res.status(400).json({ error: 'Missing required fields: title, subject, body' });
  }
  
  // Generate slug if not provided
  let slug = req.body.slug;
  if (!slug && req.body.title) {
    slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  const newPost = {
    _id: `blog_${mockBlogPosts.length + 1}`,
    title: req.body.title,
    subject: req.body.subject,
    body: req.body.body,
    slug: slug,
    order: req.body.order || 0,
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    media: req.body.media || {},
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockBlogPosts.push(newPost);
  console.log(`📝 Created new blog post via ${apiKey ? 'API key' : 'JWT'}: ${newPost.title}`);
  res.status(201).json(newPost);
});

app.patch('/api/admin/blog/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const postIndex = mockBlogPosts.findIndex(post => post._id === req.params.id);
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  
  mockBlogPosts[postIndex] = {
    ...mockBlogPosts[postIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  res.json(mockBlogPosts[postIndex]);
});

app.delete('/api/admin/blog/:id', (req, res) => {
  const token = req.cookies.token;
  if (token !== 'mock-jwt-token') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const postIndex = mockBlogPosts.findIndex(post => post._id === req.params.id);
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Blog post not found' });
  }
  
  mockBlogPosts.splice(postIndex, 1);
  res.json({ message: 'Blog post deleted' });
});

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
  console.log(`📝 Mock blog posts: ${mockBlogPosts.filter(p => p.isPublished).length} published`);
  console.log(`💡 Admin login: admin@pstudios.com / admin123`);
});

module.exports = app;
