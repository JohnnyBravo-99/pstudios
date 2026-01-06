# Web Integration Guide for Discord Bot

This guide explains how to integrate the Discord bot's announcement posting feature with your website's backend API.

## Overview

The Discord bot can automatically post announcements from designated Discord channels to your website's blog/announcement section. When a message is posted in a configured announcement channel, the bot will:

1. Extract the message content
2. Format it as a blog post
3. POST it to your website's API endpoint
4. The post will appear on your website's main page/blog section

## API Endpoint Requirements

The Discord bot expects to POST to the following endpoint:

```
POST /api/admin/blog
```

### Request Format

The bot sends a JSON payload matching your `BlogPost` model structure:

```json
{
  "title": "Announcement Title",
  "subject": "Discord Announcement",
  "body": "Full announcement content from Discord message",
  "slug": "announcement-title",
  "isPublished": true,
  "order": 0
}
```

### Expected Response

**Success (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Announcement Title",
  "subject": "Discord Announcement",
  "body": "Full announcement content",
  "slug": "announcement-title",
  "isPublished": true,
  "order": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error (400/401/403/500):**
```json
{
  "error": "Error message description"
}
```

## Authentication Options

The Discord bot needs to authenticate with your API. You have several options:

### Option 1: API Key Authentication (Recommended)

Create a dedicated API key endpoint that bypasses JWT authentication for the bot.

**Backend Route (`backend/src/routes/api.js` or similar):**

```javascript
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Joi = require('joi');

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.DISCORD_BOT_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Blog post schema validation
const blogPostSchema = Joi.object({
  title: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  slug: Joi.string().optional(),
  order: Joi.number().default(0),
  isPublished: Joi.boolean().default(true)
});

// POST endpoint for Discord bot
router.post('/blog', validateApiKey, async (req, res) => {
  try {
    const { error, value } = blogPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate slug if not provided
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
    console.error('Error creating blog post from Discord:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Slug already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
```

**Add to your main server file (`backend/src/index.js`):**

```javascript
const apiRoutes = require('./routes/api');
app.use('/api/discord', apiRoutes); // Use /api/discord/blog instead
```

**Environment Variable (`.env`):**
```
DISCORD_BOT_API_KEY=your_secure_random_api_key_here
```

**Update Discord Bot `.env`:**
```
WEB_API_URL=http://localhost:3000/api/discord
WEB_API_KEY=your_secure_random_api_key_here
```

### Option 2: Service Account with JWT

Create a service account user and generate a JWT token for the bot.

**Create Service Account Script (`backend/scripts/createServiceAccount.js`):**

```javascript
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function createServiceAccount() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    
    // Check if service account exists
    let serviceAccount = await User.findOne({ email: 'discord-bot@paradigmstudios.art' });
    
    if (!serviceAccount) {
      serviceAccount = new User({
        email: 'discord-bot@paradigmstudios.art',
        password: require('crypto').randomBytes(32).toString('hex'), // Random password
        role: 'admin',
        name: 'Discord Bot Service Account'
      });
      
      await serviceAccount.save();
      console.log('Service account created:', serviceAccount._id);
    }
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: serviceAccount._id },
      process.env.JWT_SECRET,
      { expiresIn: '365d' } // Long-lived token
    );
    
    console.log('\n=== DISCORD BOT CONFIGURATION ===');
    console.log('Add this to your Discord bot .env file:');
    console.log(`WEB_API_KEY=${token}`);
    console.log('\nKeep this token secure!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createServiceAccount();
```

**Update Discord Bot `services/WebIntegration.js` to use JWT:**

The bot already supports JWT via the `Authorization: Bearer` header. Just ensure your existing `/api/admin/blog` endpoint accepts the service account's JWT token.

### Option 3: Modify Existing Admin Route

If you want to keep using the existing `/api/admin/blog` route, you can add API key support:

**Update `backend/src/routes/admin.js`:**

```javascript
// Add before the existing authenticateToken middleware
const validateApiKeyOrToken = async (req, res, next) => {
  // Check for API key first (Discord bot)
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (apiKey === process.env.DISCORD_BOT_API_KEY) {
    // API key authentication - create a mock user object
    req.user = { role: 'admin', _id: 'discord-bot-service' };
    return next();
  }
  
  // Fall back to JWT authentication
  return authenticateToken(req, res, next);
};

// Update the blog POST route to use the new middleware
router.post('/blog', validateApiKeyOrToken, requireEditor, async (req, res) => {
  // ... existing code ...
});
```

## Testing the Integration

### 1. Test API Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "title": "Test Announcement",
    "subject": "Test",
    "body": "This is a test announcement from Discord bot",
    "isPublished": true
  }'
```

### 2. Test from Discord Bot

1. Set up your `.env` file in the Discord bot directory
2. Use `/setannouncementchannel` command in Discord to designate a channel
3. Post a message in that channel
4. Check your website/blog to see if it appears

### 3. Check Bot Logs

The Discord bot logs all API interactions. Check `Discord/logs/bot.log` for:
- Successful posts: `Announcement posted to website`
- Errors: `Error posting announcement to website`

## Error Handling

The Discord bot handles these error scenarios:

- **401/403**: Authentication failed - check API key
- **400**: Validation error - check request format
- **500**: Server error - check backend logs
- **Network errors**: Connection timeout or unreachable server

All errors are logged but don't notify Discord users to avoid spam.

## Security Considerations

1. **API Key Security**:
   - Use a strong, random API key (at least 32 characters)
   - Store it securely in environment variables
   - Never commit API keys to version control
   - Rotate keys periodically

2. **Rate Limiting**:
   - Consider adding rate limiting for the Discord bot endpoint
   - The bot already has built-in error handling and won't spam requests

3. **Content Validation**:
   - The bot sends pre-validated content, but you should still validate on the backend
   - Consider adding content filters or moderation

4. **CORS**:
   - Ensure your CORS settings allow requests from your Discord bot server
   - If bot runs on same server, this may not be needed

## Environment Variables Summary

**Website Backend (`.env`):**
```
DISCORD_BOT_API_KEY=your_secure_api_key_here
```

**Discord Bot (`.env`):**
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
WEB_API_URL=http://localhost:3000/api/admin
WEB_API_KEY=your_secure_api_key_here
```

For production, update `WEB_API_URL` to your production API URL:
```
WEB_API_URL=https://api.paradigmstudios.art/api/admin
```

## Troubleshooting

### Bot can't connect to API
- Check `WEB_API_URL` is correct
- Verify API server is running
- Check firewall/network settings
- Test with `curl` first

### Authentication fails
- Verify `WEB_API_KEY` matches on both sides
- Check API key is in correct header format
- Ensure middleware is set up correctly

### Posts not appearing on website
- Check `isPublished: true` in response
- Verify blog posts are being fetched correctly on frontend
- Check database for created posts
- Review bot logs for errors

### Slug conflicts
- Bot generates slugs from titles
- If conflicts occur, backend should handle gracefully
- Consider adding timestamp to slugs if needed

## Example Integration Flow

```
1. Admin uses /setannouncementchannel in Discord
   └─> Bot adds channel to announcement list

2. User posts message in announcement channel
   └─> Bot detects message
   └─> Bot extracts title and content
   └─> Bot POSTs to /api/admin/blog
   └─> Backend validates and creates blog post
   └─> Blog post appears on website

3. Website displays blog post
   └─> Frontend fetches from /api/blog
   └─> Post appears in blog/announcement section
```

## Support

For issues or questions:
1. Check Discord bot logs: `Discord/logs/bot.log`
2. Check backend server logs
3. Verify environment variables are set correctly
4. Test API endpoint directly with curl/Postman

## Next Steps

1. Choose authentication method (Option 1 recommended)
2. Implement the API endpoint or modify existing one
3. Set `DISCORD_BOT_API_KEY` in backend `.env`
4. Update Discord bot `.env` with correct `WEB_API_URL` and `WEB_API_KEY`
5. Test the integration
6. Use `/setannouncementchannel` in Discord to enable auto-posting

