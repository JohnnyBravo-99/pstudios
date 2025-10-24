const express = require('express');
const PortfolioItem = require('../models/PortfolioItem');

const router = express.Router();

// Get all published portfolio items
router.get('/', async (req, res) => {
  try {
    const items = await PortfolioItem.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single portfolio item by slug
router.get('/:slug', async (req, res) => {
  try {
    const item = await PortfolioItem.findOne({ 
      slug: req.params.slug,
      isPublished: true 
    });

    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
