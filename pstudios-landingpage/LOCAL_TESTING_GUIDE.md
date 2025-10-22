# Local Testing Guide - Frontend with VPS Backend

## Quick Setup for Testing Locally Against VPS API

### 1. Update API Configuration
Edit `src/config/api.js` and replace `your-vps-domain.com` with your actual VPS domain:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com'  // Replace with your actual API domain
  : 'https://your-actual-vps-domain.com';  // Your actual VPS domain
```

### 2. Start the React Development Server
```bash
cd pstudios-landingpage
npm start
```

The app will open at `http://localhost:3000`

### 3. Test the Public Portfolio Page
- Navigate to the Portfolio page
- The page should load portfolio items from your VPS API
- Click on portfolio cards to open the detailed modal

### 4. Test the Admin Panel
- Navigate to `/login` (e.g., `http://localhost:3000/login`)
- Login with the default credentials:
  - **Email:** admin@pstudios.com
  - **Password:** admin123
- Test the admin dashboard and portfolio management

### 5. API Endpoints You Can Test

#### Public Endpoints (no auth required)
```bash
# Health check
curl https://your-vps-domain.com/api/health

# Get portfolio items
curl https://your-vps-domain.com/api/portfolio

# Get single portfolio item (if you have items)
curl https://your-vps-domain.com/api/portfolio/project-1
```

#### Admin Endpoints (auth required)
```bash
# Login
curl -X POST https://your-vps-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pstudios.com","password":"admin123"}' \
  -c cookies.txt

# Get user info (use cookies from login)
curl https://your-vps-domain.com/api/auth/me \
  -b cookies.txt

# Get all portfolio items (admin view)
curl https://your-vps-domain.com/api/admin/portfolio \
  -b cookies.txt
```

### 6. Troubleshooting

#### CORS Issues
If you get CORS errors, make sure your VPS API has the correct CORS configuration in `backend/src/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://johnnybravo-99.github.io',  // GitHub Pages
    'https://your-vps-domain.com'  // Your VPS domain
  ],
  credentials: true
}));
```

#### API Not Responding
- Check if the VPS API is running: `curl https://your-vps-domain.com/api/health`
- Check VPS logs: `docker compose logs api`
- Verify domain DNS is pointing to your VPS IP

#### Authentication Issues
- Make sure you're using the correct admin credentials
- Check if the admin user was seeded: run `docker compose exec api npm run seed`
- Verify JWT secret is set in the VPS environment

### 7. Development Workflow

1. **Frontend Development**: Make changes locally, the React dev server will hot-reload
2. **API Testing**: All API calls go to your VPS, so you're testing the real backend
3. **Admin Panel**: Test admin functionality locally against the VPS database
4. **Media Uploads**: Test file uploads - they'll be stored on the VPS

### 8. Production Deployment

When ready to deploy:
1. Update `src/config/api.js` to use the production API domain
2. Build the frontend: `npm run build`
3. Deploy the build folder to GitHub Pages or your hosting provider

## Environment Variables

You can also use environment variables for API configuration:

Create `.env.local` in the frontend directory:
```env
REACT_APP_API_URL=https://your-vps-domain.com
```

Then update `src/config/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.example.com'
    : 'https://your-vps-domain.com');
```

This allows you to easily switch between different API endpoints for different environments.
