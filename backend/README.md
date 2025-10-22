# Paradigm Studios Backend API

A robust Node.js/Express backend API designed to work seamlessly with a React frontend deployed on GitHub Pages. This backend provides portfolio management, authentication, and admin functionality for the Paradigm Studios website.

## 🚀 Features

- **Portfolio Management**: CRUD operations for portfolio items
- **Authentication**: JWT-based authentication system
- **Admin Panel**: Secure admin interface for content management
- **Media Upload**: File upload support for images and assets
- **CORS Configuration**: Optimized for GitHub Pages deployment
- **Rate Limiting**: Built-in API protection
- **MongoDB Integration**: Scalable database with Mongoose ODM

## 🏗️ Architecture

### MERN Stack Integration
- **Backend**: Node.js/Express API (this repository)
- **Frontend**: React app deployed on GitHub Pages
- **Database**: MongoDB with Docker
- **Deployment**: VPS hosting with Docker containers

### GitHub Pages Compatibility
The backend is specifically configured to work with React frontends deployed on GitHub Pages:
- CORS configured for `https://johnnybravo-99.github.io` and `https://johnnybravo-99.github.io/pstudios`
- Secure cookie handling for cross-origin requests
- Optimized headers for GitHub Pages integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MongoDB (via Docker)

## 🛠️ Installation & Setup

### 1. Clone and Setup
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the environment template and configure:
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Docker Setup (Production)
```bash
docker-compose up -d
```

### 4. Development Setup
For development with mock data (no database required):
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb://mongo:27017/pstudios
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=https://johnnybravo-99.github.io
GITHUB_PAGES_URL=https://johnnybravo-99.github.io/pstudios
UPLOAD_DIR=./uploads
```

### CORS Configuration
The backend is pre-configured for:
- Local development (`http://localhost:3000`)
- GitHub Pages deployment (`https://johnnybravo-99.github.io`)
- GitHub Pages with repository path (`https://johnnybravo-99.github.io/pstudios`)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Portfolio (Public)
- `GET /api/portfolio` - Get published portfolio items
- `GET /api/portfolio/:id` - Get specific portfolio item

### Admin (Protected)
- `GET /api/admin/portfolio` - Get all portfolio items (admin)
- `POST /api/admin/portfolio` - Create new portfolio item
- `PATCH /api/admin/portfolio/:id` - Update portfolio item
- `DELETE /api/admin/portfolio/:id` - Delete portfolio item
- `POST /api/admin/portfolio/:id/media` - Upload media
- `DELETE /api/admin/portfolio/:id/media/:mediaId` - Delete media

### Utility
- `GET /api/health` - Health check
- `GET /api/github-pages-info` - GitHub Pages integration info

## 🐳 Docker Deployment

### Production Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development with Docker
```bash
# Start development database only
docker-compose -f docker-compose.dev.yml up -d

# Run development server
npm run dev
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers configuration
- **CORS**: Configured for specific origins
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request validation with Joi
- **File Upload Limits**: 10MB file size limit

## 📱 Frontend Integration

### React Frontend Configuration
Your React frontend should be configured to use these endpoints:

```javascript
// API Configuration for React app
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vps-domain.com/api' 
  : 'http://localhost:3000/api';

// Example API calls
const fetchPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`);
  return response.json();
};
```

### GitHub Pages Deployment
1. Build your React app with the correct API endpoint
2. Deploy to GitHub Pages
3. The backend will automatically handle CORS for your deployed frontend

## 🔍 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with mock data
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Mock Data Mode
The development server (`npm run dev`) includes mock data for:
- Portfolio items with sample media
- Admin authentication (admin@pstudios.com / admin123)
- Full CRUD operations without database

## 📊 Monitoring

### Health Checks
- `GET /api/health` - Basic health status
- `GET /api/github-pages-info` - Integration status

### Logging
- Request logging with Morgan
- Error logging with detailed stack traces
- File-based logging in `./logs/` directory

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Docker containers running
- [ ] Database connection established
- [ ] CORS origins updated for your domain
- [ ] SSL certificates configured (if needed)
- [ ] Frontend deployed to GitHub Pages
- [ ] API endpoints tested with frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Check the health endpoint: `/api/health`
- Review logs in `./logs/` directory
- Verify environment configuration
- Test CORS configuration with your frontend domain

---

**Ready for GitHub Pages Integration** 🎉

This backend is specifically optimized to work with React frontends deployed on GitHub Pages, providing a seamless MERN stack experience.