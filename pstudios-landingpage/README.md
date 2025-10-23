# Paradigm Studios - React Frontend

## 🎨 PROJECT OVERVIEW
A modern React application for Paradigm Studios featuring a portfolio showcase, admin panel, and content management system. Built with React Router, custom CSS, and integrated with a Node.js backend API.

## ✅ CURRENT FEATURES

### 🏠 Pages
- **Home**: Landing page with logo animation and welcome content
- **About**: Studio information with branding images and mission statement
- **Portfolio**: Interactive 3x3 grid of square project cards with image previews
- **Contact**: Professional contact information and messaging

### 🎛️ Admin Panel
- **Authentication**: Secure login system with JWT tokens
- **Portfolio Management**: Create, edit, delete portfolio items
- **Media Upload**: Drag & drop image uploads with preview
- **Media Management**: Delete uploaded images with confirmation
- **Type-Specific Fields**: Different forms for 3D assets vs branding projects
- **Standalone Access**: Dedicated admin panel accessible via separate URL
- **No Main Site Integration**: Login removed from main navigation for security

### 🎨 Design System
- **Square Portfolio Cards**: Perfect 1:1 aspect ratio with image backgrounds
- **Hover Effects**: Smooth transitions and overlay titles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Custom Fonts**: Beckan and Playfair Display
- **Color Scheme**: Professional blue (#006699) and orange (#ff9933)

## 🚀 QUICK START

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Or use the batch script from project root
start-dev.bat
```

### Access Points
- **Frontend**: http://localhost:3000
- **Admin Panel (Development)**: http://localhost:3000/cp-admin
- **Admin Panel (Production)**: https://cp.paradigmstudios.art
- **Portfolio**: http://localhost:3000/portfolio
- **About**: http://localhost:3000/about
- **Contact**: http://localhost:3000/contact

## 📁 PROJECT STRUCTURE

```
src/
├── pages/                    # Page components
│   ├── Home.js              # Landing page with logo animation
│   ├── About.js              # Studio information and branding
│   ├── Portfolio.js          # Interactive portfolio grid
│   └── Contact.js            # Contact information
├── components/               # Reusable components
│   ├── Header.js             # Navigation with active indicators
│   └── BackgroundVideo.js    # Reusable video background
├── admin/                    # Admin panel components
│   ├── Login.js              # Authentication form
│   ├── Dashboard.js          # Admin overview
│   └── portfolio/            # Portfolio management
│       ├── PortfolioList.js  # List all portfolio items
│       ├── PortfolioForm.js  # Create/edit portfolio items
│       └── MediaUploader.js    # File upload component
├── styles/                   # All CSS files (organized)
│   ├── variables.css         # CSS custom properties
│   ├── Page.css              # Page-specific styles
│   ├── Header.css            # Navigation styles
│   ├── BackgroundVideo.css   # Video background styles
│   └── Admin.css             # Admin panel styles
├── config/                   # Configuration
│   └── api.js                # API endpoint configuration
└── assets/                   # Static assets
    ├── fonts/                 # Custom fonts
    ├── branding-pages/        # Branding images
    └── logo-submark-marks-iconography/  # Logo assets
```

## 🎯 KEY FEATURES

### Portfolio Grid
- **Square Cards**: Perfect 1:1 aspect ratio maintained with `aspect-ratio: 1`
- **Image Previews**: First uploaded image displayed as card background
- **Hover Effects**: Project title appears on hover with smooth overlay
- **Modal Details**: Click cards to open detailed project information
- **Responsive**: 3 columns on desktop, 2 on tablet, 1 on mobile

### Admin Panel
- **Secure Authentication**: JWT-based login system
- **Portfolio CRUD**: Full create, read, update, delete operations
- **Media Management**: Upload and delete images with real-time updates
- **Type-Specific Forms**: Different fields for 3D assets vs branding
- **Real-time Updates**: Changes reflect immediately in the frontend

### File Organization
- **Centralized Styles**: All CSS files moved to `src/styles/` directory
- **Updated Imports**: All components reference the new CSS locations
- **Clean Structure**: Logical organization of components and assets

## 🛠️ AVAILABLE SCRIPTS

### Development
- `npm start` - Start development server with hot reload
- `npm run start:dev` - Start with development environment variables

### Production
- `npm run build` - Build for production (creates `build/` folder)
- `npm run eject` - Eject from Create React App (one-way operation)

## 🔧 CONFIGURATION

### API Configuration
The app uses `src/config/api.js` to manage API endpoints:
- **Development**: http://localhost:3001 (local backend)
- **Production**: https://api.paradigmstudios.art (VPS backend)

### Environment Variables
Create `.env.local` for custom configuration:
```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 🎨 DESIGN SYSTEM

### Colors
- **Primary Blue**: #006699
- **Primary Orange**: #ff9933
- **Graphite Dark**: #4a4a4a
- **Graphite Veil**: #676767
- **Graphite Light**: #8a8a8a

### Typography
- **Headings**: Beckan (font-weight: 100)
- **Body**: Playfair Display
- **Responsive**: Uses `clamp()` for fluid typography

### Animations
- **Fade Transitions**: 1.5s ease-in-out
- **Landing Animation**: 2.5s display, 1.5s fade-out
- **Hover Effects**: 0.3s ease transitions

## 🚀 DEPLOYMENT

### Production Build
```bash
npm run build
```

### GitHub Pages
The project is configured for GitHub Pages deployment with:
- Custom domain support (paradigmstudios.art)
- CNAME file for domain configuration
- Build optimization for production

### VPS Integration
The frontend integrates with a Node.js backend API for:
- Portfolio data management
- Media file uploads
- Admin authentication
- Content management

## 📞 SUPPORT

For development issues:
1. Check the browser console for errors
2. Verify the backend API is running
3. Check the `DEVELOPMENT_SETUP.md` guide
4. Review the admin panel functionality

## 🔄 RECENT UPDATES

### Latest Changes
- ✅ **Square Portfolio Cards**: Implemented perfect 1:1 aspect ratio
- ✅ **Image Previews**: First uploaded image shows in each card
- ✅ **File Organization**: Moved all CSS files to `src/styles/` directory
- ✅ **Admin Panel**: Full CRUD operations with media management
- ✅ **State Synchronization**: Real-time updates between frontend and backend
- ✅ **Responsive Design**: Optimized for all screen sizes

### Next Steps
- Mobile navigation improvements
- Enhanced portfolio filtering
- Contact form implementation
- Performance optimizations