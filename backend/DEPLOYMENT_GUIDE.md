# Paradigm Studios - Complete Deployment Guide

## Overview
This guide covers deploying the complete MERN stack application with the portfolio management system.

## Directory Structure
```
pstudios/
├── backend/                 # API server (Express + MongoDB)
│   ├── src/                # API source code
│   ├── configs/            # Caddy, CORS configs
│   ├── scripts/            # Setup and seed scripts
│   ├── envs/               # Environment variables
│   ├── docker-compose.yml  # Docker orchestration
│   └── Dockerfile          # API container
├── pstudios-landingpage/   # React frontend
│   ├── src/                # React components
│   │   ├── admin/          # Admin panel components
│   │   └── pages/          # Public pages
│   └── build/              # Production build
└── README.md
```

## VPS Deployment Steps

### 1. Server Setup
```bash
# Run the complete setup script
sudo bash /home/jay_gatsby/mernvps/scripts/complete_setup.sh
```

### 2. Update Domain Configuration
```bash
# Edit Caddyfile with your actual domain
sudo nano /etc/caddy/Caddyfile
```

Replace `api.example.com` with your actual API domain:
```caddyfile
api.yourdomain.com {
    # API endpoints
    handle /api/* {
        reverse_proxy localhost:3000
    }
    
    # Media files
    handle /media/* {
        reverse_proxy localhost:3000
    }
    
    # Health check
    handle /health {
        reverse_proxy localhost:3000
    }
    
    encode gzip zstd
    log {
      output file /var/log/caddy/api_access.log
      format single_field common_log
    }
}
```

### 3. Deploy Backend
```bash
cd /home/jay_gatsby/mernvps

# Copy the backend files to the VPS
# (Upload via git, scp, or file manager)

# Build and start the services
docker compose up -d --build

# Check status
docker compose ps
docker compose logs api
```

### 4. Seed Admin User
```bash
# Run the seed script to create admin user
docker compose exec api npm run seed
```

### 5. Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pstudios.com","password":"admin123"}'
```

### 6. Frontend Configuration
Update the frontend API configuration in `pstudios-landingpage/src/pages/Portfolio.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com'  // Your actual API domain
  : 'http://localhost:3000';
```

And in admin components:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com'  // Your actual API domain
  : 'http://localhost:3000';
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

## Admin Access

### Default Credentials
- **Email:** admin@pstudios.com
- **Password:** admin123

**Important:** Change the password after first login!

### Admin Routes (Frontend)
- `/login` - Admin login page
- `/admin` - Admin dashboard
- `/admin/portfolio` - Portfolio management
- `/admin/portfolio/new` - Create new project
- `/admin/portfolio/:id/edit` - Edit project

## File Structure

### Backend
- `src/index.js` - Main server file
- `src/models/` - MongoDB models (User, PortfolioItem)
- `src/routes/` - API route handlers
- `src/middleware/` - Authentication middleware
- `scripts/seed.js` - Admin user seeding script

### Frontend
- `src/pages/Portfolio.js` - Public portfolio page with API integration
- `src/admin/` - Admin panel components
  - `Login.js` - Authentication
  - `Dashboard.js` - Admin overview
  - `portfolio/` - Portfolio management components

## Environment Variables

### Backend (`envs/api.env`)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb://root:password@mongo:27017/merndb?authSource=admin
JWT_SECRET=your_jwt_secret_here
CLIENT_ORIGIN=https://johnnybravo-99.github.io
UPLOAD_DIR=./uploads
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password
MONGO_DATABASE=merndb
```

## Security Features

- **JWT Authentication** with HTTP-only cookies
- **Rate Limiting** on API endpoints
- **CORS Protection** configured for GitHub Pages
- **Input Validation** with Joi schemas
- **File Upload Security** with type validation
- **Role-based Access Control** (admin/editor roles)
- **Helmet.js** security headers

## Monitoring

### Check Service Status
```bash
# Docker containers
docker compose ps

# API logs
docker compose logs api -f

# Caddy logs
sudo journalctl -u caddy -f
```

### Health Monitoring
```bash
# API health check
curl https://api.yourdomain.com/api/health

# MongoDB status
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

## Troubleshooting

### Common Issues

1. **API Not Responding**
   ```bash
   docker compose logs api
   # Check for MongoDB connection issues
   ```

2. **CORS Errors**
   - Verify CLIENT_ORIGIN in envs/api.env
   - Check CORS configuration in src/index.js

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file type restrictions

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check cookie settings for HTTPS

### Log Locations
- API logs: `docker compose logs api`
- Caddy logs: `/var/log/caddy/api_access.log`
- System logs: `sudo journalctl -u caddy`

## Backup

### Database Backup
```bash
# Run the backup script
bash /home/jay_gatsby/mernvps/scripts/mongo_backup.sh
```

### File Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Updates

### Deploying Updates
```bash
# Pull latest changes
git pull origin backend-setup

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run migrations if needed
docker compose exec api npm run seed
```

## Support

For issues or questions:
1. Check logs: `docker compose logs api`
2. Verify environment variables
3. Test API endpoints individually
4. Check Caddy configuration and DNS

## Production Checklist

- [ ] Domain configured in Caddyfile
- [ ] DNS A record pointing to VPS IP
- [ ] SSL certificate working (automatic with Caddy)
- [ ] Admin password changed from default
- [ ] MongoDB backup script configured
- [ ] File uploads directory created and writable
- [ ] CORS origins configured correctly
- [ ] API health check responding
- [ ] Frontend API URL updated for production
