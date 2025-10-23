# Paradigm Studios API

Portfolio management backend for Paradigm Studios website.

## Features

- **Authentication**: JWT-based auth with HTTP-only cookies
- **Portfolio Management**: CRUD operations for portfolio items
- **Media Upload**: Support for images, videos, and 3D models
- **Admin Panel**: Secure admin interface for content management
- **CORS**: Configured for GitHub Pages frontend

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

1. Clone the repository and navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Seed the admin user:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Environment Variables

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/pstudios
JWT_SECRET=your_jwt_secret_here
CLIENT_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user info

### Public Portfolio
- `GET /api/portfolio` - Get all published portfolio items
- `GET /api/portfolio/:slug` - Get single portfolio item

### Admin Portfolio (requires authentication)
- `GET /api/admin/portfolio` - Get all portfolio items
- `POST /api/admin/portfolio` - Create new portfolio item
- `PATCH /api/admin/portfolio/:id` - Update portfolio item
- `DELETE /api/admin/portfolio/:id` - Delete portfolio item
- `POST /api/admin/portfolio/:id/media` - Upload media
- `DELETE /api/admin/portfolio/:id/media/:mediaId` - Delete media

### Health Check
- `GET /api/health` - Server health status

## Portfolio Item Schema

```javascript
{
  title: String,
  slug: String, // auto-generated from title
  type: "3d-asset" | "branding" | "ui-ux" | "cinematic" | "game" | "web",
  tags: [String],
  meta: {
    role: String,
    year: Number,
    engine: String,
    software: [String],
    // Type-specific fields...
  },
  media: {
    images: [{ src, alt, caption }],
    video: { src, poster },
    model3d: { src }
  },
  links: {
    live: String,
    download: String,
    repo: String
  },
  order: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Default Admin User

After running the seed script:
- **Email**: admin@pstudios.com
- **Password**: admin123

**Important**: Change the password after first login!

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Seed admin user
npm run seed

# Run tests
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up file upload directory
5. Use HTTPS in production

## File Uploads

Media files are stored in `./uploads/portfolio/{itemId}/` and served via `/media/portfolio/{itemId}/{filename}`

Supported file types:
- Images: JPEG, PNG, WebP
- Videos: MP4
- 3D Models: GLB, GLTF

File size limit: 50MB

## Security Features

- JWT authentication with HTTP-only cookies
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS protection
- File type validation
- Input validation with Joi
- Password hashing with bcrypt

## License

MIT
