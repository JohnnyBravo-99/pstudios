# Discord Bot Integration - Development Environment Testing Guide

## Overview

This guide explains how to test the Discord bot web integration in the development environment before deploying to production.

## Development Environment Setup

### 1. Configure Environment Variables

Add to your `.env` or `.env.development` file in the `backend` directory:

```env
DISCORD_BOT_API_KEY=dev-api-key-for-testing
```

**Note:** For development testing, you can use a simple key like `dev-api-key-for-testing`. For production, use a secure random key (at least 32 characters).

### 2. Start Development Server

```bash
cd backend
npm run dev:mock
```

This starts the mock development server on port 3001 with in-memory data (no database required).

## Testing API Key Authentication

### Test 1: API Key Authentication (Discord Bot)

```bash
curl -X POST http://localhost:3001/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-for-testing" \
  -d '{
    "title": "Test Announcement from Discord Bot",
    "subject": "Discord Announcement",
    "body": "This is a test announcement posted via API key authentication. It should appear in the blog feed.",
    "isPublished": true,
    "order": 0
  }'
```

**Expected Response (201 Created):**
```json
{
  "_id": "blog_6",
  "title": "Test Announcement from Discord Bot",
  "subject": "Discord Announcement",
  "body": "This is a test announcement...",
  "slug": "test-announcement-from-discord-bot",
  "order": 0,
  "isPublished": true,
  "createdAt": "2025-01-XX...",
  "updatedAt": "2025-01-XX..."
}
```

### Test 2: JWT Authentication (Admin Panel)

The admin panel should still work with JWT authentication:

1. Login via admin panel: `admin@pstudios.com` / `admin123`
2. Create a blog post through the UI
3. Verify it appears in the blog feed

### Test 3: Invalid API Key

```bash
curl -X POST http://localhost:3001/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key" \
  -d '{
    "title": "Test",
    "subject": "Test",
    "body": "This should fail"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Invalid API key"
}
```

### Test 4: Missing Authentication

```bash
curl -X POST http://localhost:3001/api/admin/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "subject": "Test",
    "body": "This should fail"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Not authenticated"
}
```

### Test 5: Validation Errors

```bash
curl -X POST http://localhost:3001/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-for-testing" \
  -d '{
    "title": "Missing Fields Test"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: title, subject, body"
}
```

## Testing with Frontend

### 1. Start Frontend in Development Mode

```bash
cd pstudios-landingpage
npm run start:dev:backend
```

This starts the frontend pointing to `http://localhost:3001` (the dev mock server).

### 2. Verify Blog Posts Appear

1. Navigate to the home page
2. Check that blog posts created via API key appear in the feed
3. Verify posts created via admin panel also appear

## Testing Slug Generation

The dev environment automatically generates slugs from titles:

```bash
curl -X POST http://localhost:3001/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-for-testing" \
  -d '{
    "title": "My Test Post!",
    "subject": "Test",
    "body": "Testing slug generation",
    "isPublished": true
  }'
```

**Expected:** Slug should be `my-test-post` (lowercase, special characters removed, spaces replaced with hyphens).

## Testing Production Environment

Once dev testing is complete, test against the production backend:

### 1. Update Environment Variables

In production `.env`:
```env
DISCORD_BOT_API_KEY=your_secure_production_api_key_here
```

### 2. Test Production Endpoint

```bash
curl -X POST https://api.paradigmstudios.art/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secure_production_api_key_here" \
  -d '{
    "title": "Production Test",
    "subject": "Test",
    "body": "Testing production integration",
    "isPublished": true
  }'
```

## Discord Bot Configuration

Update your Discord bot `.env` file:

**For Development:**
```env
WEB_API_URL=http://localhost:3001/api/admin
WEB_API_KEY=dev-api-key-for-testing
```

**For Production:**
```env
WEB_API_URL=https://api.paradigmstudios.art/api/admin
WEB_API_KEY=your_secure_production_api_key_here
```

## Troubleshooting

### Issue: CORS Error
**Solution:** Verify `X-API-Key` is in `allowedHeaders` in CORS configuration (already done).

### Issue: 401 Unauthorized
**Solution:** 
- Check API key matches exactly (case-sensitive)
- Verify `DISCORD_BOT_API_KEY` is set in environment variables
- Check API key is in `X-API-Key` header or `Authorization: Bearer` header

### Issue: Blog Post Not Appearing
**Solution:**
- Verify `isPublished: true` in request
- Check frontend is fetching from correct API endpoint
- Verify blog post was created successfully (check response)

### Issue: Slug Conflicts
**Solution:** 
- Backend handles duplicate slugs by returning 400 error
- Discord bot should handle this gracefully
- Consider adding timestamp to slug if needed

## Next Steps

1. ✅ Test API key authentication in dev environment
2. ✅ Verify JWT authentication still works
3. ✅ Test with Discord bot in dev environment
4. ✅ Deploy to production
5. ✅ Test with Discord bot in production
6. ✅ Monitor logs for any issues

## Security Notes

- **Never commit API keys to version control**
- Use strong, random API keys in production (at least 32 characters)
- Rotate API keys periodically
- Monitor API usage for suspicious activity
- Consider rate limiting for API key endpoints (already implemented globally)

