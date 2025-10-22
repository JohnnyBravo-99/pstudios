# 🚀 Paradigm Studios Development Environment Setup

This guide will help you set up and run the development environment for the Paradigm Studios website.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git

## 🛠️ Quick Start

### Option 1: Using the Batch Script (Recommended for Windows)

Simply double-click `start-dev.bat` or run it from the command line:

```bash
start-dev.bat
```

This will automatically:
- Kill any existing processes on ports 3000 and 3001
- Install dependencies for both frontend and backend
- Start both servers with proper configuration

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../pstudios-landingpage
npm install
```

#### 2. Start Backend Server

```bash
cd backend
$env:PORT="3001"; node src/index.dev.js
```

#### 3. Start Frontend Server (in a new terminal)

```bash
cd pstudios-landingpage
npm start
```

## 🌐 Server Information

Once both servers are running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Admin Login**: admin@pstudios.com / admin123

## 🔗 Quick Links

- **Portfolio Page**: http://localhost:3000/portfolio
- **Admin Panel**: http://localhost:3000/login
- **About Page**: http://localhost:3000/about
- **Contact Page**: http://localhost:3000/contact

## 📁 Project Structure

```
pstudios/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── index.dev.js    # Development server with mock data
│   │   ├── routes/         # API routes
│   │   └── models/         # Database models
│   └── package.json
├── pstudios-landingpage/    # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── admin/          # Admin panel components
│   │   └── config/         # Configuration files
│   └── package.json
└── start-dev.bat           # Windows batch script
```

## 🎯 Development Features

### Backend (Mock Development Server)
- **Port**: 3001
- **Mock Data**: No database required
- **Authentication**: Mock JWT tokens
- **File Upload**: Base64 encoding for media
- **Endpoints**:
  - `GET /api/portfolio` - Get all portfolio items
  - `POST /api/auth/login` - Admin login
  - `GET /api/admin/portfolio` - Admin portfolio management
  - `POST /api/admin/portfolio/:id/media` - Upload media
  - `DELETE /api/admin/portfolio/:id/media/:mediaId` - Delete media

### Frontend (React Development Server)
- **Port**: 3000
- **Hot Reload**: Automatic refresh on file changes
- **Admin Panel**: Full CRUD operations for portfolio items
- **Media Management**: Upload and delete images
- **Responsive Design**: Works on desktop and mobile

## 🔧 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Kill all Node.js processes
taskkill /F /IM node.exe

# Or kill specific ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
# Then use the PID to kill: taskkill /F /PID <PID>
```

### Dependencies Issues
If you encounter dependency issues:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Cross-Platform Issues
If cross-env doesn't work, use the simple scripts:

```bash
# Backend
cd backend
$env:PORT="3001"; node src/index.dev.js

# Frontend
cd pstudios-landingpage
npm start
```

## 📝 Development Scripts

### Backend Scripts
- `npm run dev:mock` - Start development server with full environment variables
- `npm run dev:mock:simple` - Start development server (manual PORT setup required)
- `npm run start` - Start production server

### Frontend Scripts
- `npm run start:dev` - Start development server with environment variables
- `npm start` - Start development server (default)
- `npm run build` - Build for production

## 🎨 Admin Panel Features

The admin panel includes:
- **Portfolio Management**: Create, edit, delete portfolio items
- **Media Upload**: Drag & drop image uploads
- **Media Management**: Delete uploaded images
- **Type-Specific Fields**: Different fields for 3D assets vs branding
- **Authentication**: Secure login system

## 🚀 Production Deployment

For production deployment, see the `DEPLOYMENT_GUIDE.md` in the backend directory.

## 📞 Support

If you encounter any issues, check the console logs for error messages and refer to this guide.
