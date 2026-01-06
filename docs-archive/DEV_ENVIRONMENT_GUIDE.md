# Development Environment Guide

## Quick Start

### Backend

From the `backend/` directory:

```bash
# Development with nodemon (auto-restart)
npm run dev

# Local development (port 3001)
npm run dev:local

# Windows-specific local development
npm run dev:local:win

# Mock/development mode
npm run dev:mock

# Production mode
npm start
```

### Frontend

From the `pstudios-landingpage/` directory:

```bash
# Standard development server
npm start

# Development mode
npm run start:dev

# Local backend mode (connects to localhost:3001)
npm run start:dev:local

# Development with explicit backend URL
npm run start:dev:backend

# Development with production backend
npm run start:dev:production
```

## Typical Development Workflow

1. Start the backend:
   ```bash
   cd backend
   npm run dev:local
   ```

2. Start the frontend (in a separate terminal):
   ```bash
   cd pstudios-landingpage
   npm run start:dev:local
   ```

The backend runs on `http://localhost:3001` and the frontend on `http://localhost:3000`.





























