const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Joi = require('joi');
const PortfolioItem = require('../models/PortfolioItem');
const { authenticateToken, requireEditor } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireEditor);

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

module.exports = router;
