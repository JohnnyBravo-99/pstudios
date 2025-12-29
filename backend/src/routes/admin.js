const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Joi = require('joi');
const PortfolioItem = require('../models/PortfolioItem');
const BlogPost = require('../models/BlogPost');
const { authenticateToken, requireEditor, validateApiKeyOrToken } = require('../middleware/auth');

const router = express.Router();

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

// Apply authentication to all admin routes
router.use(async (req, res, next) => {
  
  next();
});

// Conditional authentication: check for API key on blog POST, otherwise use JWT
router.use((req, res, next) => {
  // For blog POST route, use API key or token authentication
  if (req.path === '/blog' && req.method === 'POST') {
    return validateApiKeyOrToken(req, res, (err) => {
      if (err) return next(err);
      // After validateApiKeyOrToken, ensure requireEditor runs
      return requireEditor(req, res, next);
    });
  }
  // For all other routes, use standard JWT authentication
  return authenticateToken(req, res, (err) => {
    if (err) return next(err);
    return requireEditor(req, res, next);
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', 'portfolio', req.params.id || 'temp');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'model/gltf-binary',
    'application/octet-stream' // for .glb files
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and 3D models are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Configure multer for blog uploads
const blogStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', 'blog', req.params.id || 'temp');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const blogFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const blogUpload = multer({
  storage: blogStorage,
  fileFilter: blogFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Validation schemas
const portfolioItemSchema = Joi.object({
  title: Joi.string().required(),
  type: Joi.string().valid('3d-asset', 'branding', 'ui-ux', 'cinematic', 'game', 'web').required(),
  tags: Joi.array().items(Joi.string()),
  meta: Joi.object(),
  links: Joi.object({
    live: Joi.string().uri(),
    download: Joi.string().uri(),
    repo: Joi.string().uri()
  }),
  order: Joi.number().default(0),
  isPublished: Joi.boolean().default(false)
});

const blogPostSchema = Joi.object({
  title: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  order: Joi.number().default(0),
  isPublished: Joi.boolean().default(false),
  positionedImages: Joi.array().optional()  // Optional - Discord bot doesn't send this
});

// Get all portfolio items (admin view)
router.get('/portfolio', async (req, res) => {
  
  try {
    
    const items = await PortfolioItem.find()
      .sort({ order: 1, createdAt: -1 });

    res.json(items);
  } catch (error) {
    
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single portfolio item (admin view)
router.get('/portfolio/:id', async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new portfolio item
router.post('/portfolio', async (req, res) => {
  try {
    const { error, value } = portfolioItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const item = new PortfolioItem(value);
    await item.save();

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update portfolio item
router.patch('/portfolio/:id', async (req, res) => {
  try {
    const { error, value } = portfolioItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const item = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete portfolio item
router.delete('/portfolio/:id', async (req, res) => {
  try {
    const item = await PortfolioItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    // Clean up associated files
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', 'portfolio', req.params.id);
    try {
      await fs.rmdir(uploadPath, { recursive: true });
    } catch (fsError) {
      console.warn('Could not remove upload directory:', fsError.message);
    }

    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload media for portfolio item
router.post('/portfolio/:id/media', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const item = await PortfolioItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    const fileUrl = `/media/portfolio/${req.params.id}/${req.file.filename}`;
    
    // Determine file type and add to appropriate media field
    if (req.file.mimetype.startsWith('image/')) {
      item.media.images.push({
        src: fileUrl,
        alt: req.body.alt || 'Portfolio image',
        caption: req.body.caption || ''
      });
    } else if (req.file.mimetype.startsWith('video/')) {
      item.media.video = {
        src: fileUrl,
        poster: req.body.poster || ''
      };
    } else if (req.file.mimetype.includes('gltf') || req.file.originalname.endsWith('.glb')) {
      item.media.model3d = {
        src: fileUrl
      };
    }

    await item.save();

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media from portfolio item
router.delete('/portfolio/:id/media/:mediaId', async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    // Remove from images array
    item.media.images = item.media.images.filter(img => img._id.toString() !== req.params.mediaId);
    
    // Save the updated item
    await item.save();

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== BLOG POST ROUTES ==========

// Get all blog posts (admin view)
router.get('/blog', async (req, res) => {
  
  try {
    
    const posts = await BlogPost.find()
      .sort({ order: 1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single blog post (admin view)
router.get('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new blog post
router.post('/blog', async (req, res) => {
  
  try {
    
    const { error, value } = blogPostSchema.validate(req.body);
    
    if (error) {
      
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate slug from title if not provided (before creating instance)
    if (!value.slug && value.title) {
      value.slug = value.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    const post = new BlogPost(value);
    
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    
    console.error('Error creating blog post:', error);
    console.error('Error details:', {name: error.name, message: error.message, code: error.code, stack: error.stack});
    if (error.code === 11000) {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update blog post
router.patch('/blog/:id', async (req, res) => {
  try {
    const { error, value } = blogPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete blog post
router.delete('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Clean up associated files
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', 'blog', req.params.id);
    try {
      await fs.rmdir(uploadPath, { recursive: true });
    } catch (fsError) {
      console.warn('Could not remove upload directory:', fsError.message);
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload media for blog post
router.post('/blog/:id/media', blogUpload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const fileUrl = `/media/blog/${req.params.id}/${req.file.filename}`;
    
    // Determine file type and add to appropriate media field
    if (req.file.mimetype.startsWith('image/')) {
      post.media.image = {
        src: fileUrl,
        alt: req.body.alt || 'Blog image',
        caption: req.body.caption || ''
      };
    } else if (req.file.mimetype.startsWith('video/')) {
      post.media.video = {
        src: fileUrl,
        poster: req.body.poster || ''
      };
    }

    await post.save();

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media from blog post
router.delete('/blog/:id/media', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Remove media
    post.media = {};
    
    // Save the updated post
    await post.save();

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== POSITIONED IMAGES ROUTES ==========
// Note: These routes use JWT-only authentication (not API key) since positioning requires visual admin interface

// Add or update positioned image for blog post
router.patch('/blog/:id/positioned-images/:imageId?', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const { imageId, src, alt, position, size, zIndex, anchorPostId, scale } = req.body;

    // Initialize positionedImages if it doesn't exist
    if (!post.positionedImages) {
      post.positionedImages = [];
    }

    // If imageId is provided in params, update existing image
    if (req.params.imageId) {
      const existingIndex = post.positionedImages.findIndex(
        img => img._id && img._id.toString() === req.params.imageId
      );

      if (existingIndex === -1) {
        return res.status(404).json({ error: 'Positioned image not found' });
      }

      // Update existing image
      if (src !== undefined) post.positionedImages[existingIndex].src = src;
      if (alt !== undefined) post.positionedImages[existingIndex].alt = alt;
      if (position !== undefined) post.positionedImages[existingIndex].position = position;
      if (size !== undefined) post.positionedImages[existingIndex].size = size;
      if (zIndex !== undefined) post.positionedImages[existingIndex].zIndex = zIndex;
      if (anchorPostId !== undefined) post.positionedImages[existingIndex].anchorPostId = anchorPostId;
      if (scale !== undefined) post.positionedImages[existingIndex].scale = scale;
    } else {
      // Add new positioned image
      const newImage = {
        imageId: imageId || Date.now().toString(),
        src: src || '',
        alt: alt || '',
        position: position || { x: 0, y: 0, unit: 'px' },
        size: size || { width: 200, height: 200 },
        zIndex: zIndex !== undefined ? zIndex : 0,
        anchorPostId: anchorPostId || req.params.id,
        scale: scale !== undefined ? scale : 1.0
      };
      post.positionedImages.push(newImage);
    }

    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error updating positioned image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete positioned image from blog post
router.delete('/blog/:id/positioned-images/:imageId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (!post.positionedImages) {
      return res.status(404).json({ error: 'Positioned image not found' });
    }

    const imageIndex = post.positionedImages.findIndex(
      img => img._id && img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Positioned image not found' });
    }

    post.positionedImages.splice(imageIndex, 1);
    await post.save();

    res.json({ message: 'Positioned image deleted successfully' });
  } catch (error) {
    console.error('Error deleting positioned image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
