const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// GET /api/blog - Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug - Get a single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      isPublished: true
    }).select('-__v');

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

module.exports = router;
