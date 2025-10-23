const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  images: [{
    src: { type: String, required: true },
    alt: { type: String, required: true },
    caption: { type: String, default: '' }
  }],
  video: {
    src: String,
    poster: String
  },
  model3d: {
    src: String
  }
});

const portfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['3d-asset', 'branding', 'ui-ux', 'cinematic', 'game', 'web'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  meta: {
    // Dynamic meta fields based on type
    role: String,
    year: Number,
    engine: String,
    software: [String],
    
    // 3D asset specific
    polycount: String,
    maps: [String],
    texelDensity: String,
    fileTypes: [String],
    
    // Branding specific
    deliverables: [String],
    colorSystem: String,
    typography: String,
    
    // UI/UX specific
    platform: String,
    components: [String],
    prototypingTools: [String],
    
    // Game specific
    performance: String,
    platforms: [String],
    
    // Cinematic specific
    duration: String,
    resolution: String,
    codec: String,
    fps: Number
  },
  media: {
    type: mediaSchema,
    default: () => ({ images: [] })
  },
  links: {
    live: String,
    download: String,
    repo: String
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
portfolioItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate slug from title
portfolioItemSchema.pre('save', function(next) {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'portfolio-item';
    }
    
    this.slug = baseSlug;
  }
  next();
});

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
