# Server Setup Instructions

## Current Issue
The server is trying to connect to MongoDB but it's not running locally.

## Solutions

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download for Windows
   - Install with default settings

2. **Start MongoDB Service:**
   ```bash
   # MongoDB should start automatically after installation
   # Check if it's running:
   net start MongoDB
   ```

3. **Start the API Server:**
   ```bash
   npm start
   ```

### Option 2: Use MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account:**
   - Go to: https://www.mongodb.com/atlas
   - Create a free account
   - Create a new cluster (free tier available)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Environment Variables:**
   ```bash
   # Edit .env file
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/pstudios?retryWrites=true&w=majority
   ```

4. **Start the API Server:**
   ```bash
   npm start
   ```

### Option 3: Use Docker (If Docker is Available)

1. **Install Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart your computer

2. **Start MongoDB with Docker:**
   ```bash
   cd ../backend
   docker compose up -d mongo
   ```

3. **Start the API Server:**
   ```bash
   cd ../server
   npm start
   ```

## After MongoDB is Running

1. **Seed Admin User:**
   ```bash
   npm run seed
   ```

2. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Login (after seeding)
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@pstudios.com","password":"admin123"}'
   ```

## Default Admin Credentials
- **Email:** admin@pstudios.com
- **Password:** admin123

**Important:** Change the password after first login!

## Troubleshooting

- **Port 3000 in use:** Change PORT in .env file
- **MongoDB connection issues:** Check if MongoDB is running
- **Permission errors:** Run terminal as administrator
- **Firewall issues:** Allow Node.js through Windows Firewall
