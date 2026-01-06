# Manual Deployment Guide - Paradigm Studios MERN Stack

This guide provides step-by-step instructions for manually deploying the Paradigm Studios application to a VPS without using automated scripts. Follow each section carefully.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Server Setup](#initial-server-setup)
3. [Install Required Software](#install-required-software)
4. [Configure Security](#configure-security)
5. [Prepare Application Files](#prepare-application-files)
6. [Configure Environment Variables](#configure-environment-variables)
7. [Set Up Reverse Proxy (Caddy)](#set-up-reverse-proxy-caddy)
8. [Deploy Backend Application](#deploy-backend-application)
9. [Deploy Frontend](#deploy-frontend)
10. [Configure DNS](#configure-dns)
11. [Verify Deployment](#verify-deployment)
12. [Set Up Backups](#set-up-backups)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements
- **VPS**: Ubuntu 20.04+ or Debian 11+ (recommended)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Static IP address
- **Access**: SSH access with sudo privileges

### Domain Requirements
- **Domain name**: Registered and pointing to your VPS IP
- **DNS access**: Ability to create A records
- **Subdomain**: `api.yourdomain.com` for the API (or use main domain)

### Local Machine Requirements
- Git installed
- SSH client
- Text editor (nano, vim, or VS Code with SSH extension)

---

## Initial Server Setup

### 1. Connect to Your VPS

```bash
ssh username@your-server-ip
# Example: ssh root@192.168.1.100
```

### 2. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Create Application User (if not using root)

```bash
# Create a new user (optional, for security)
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to the new user
su - deploy
```

### 4. Create Project Directory

```bash
# Create main project directory
mkdir -p ~/pstudios
cd ~/pstudios

# Create subdirectories
mkdir -p backend/uploads
mkdir -p backend/logs
```

---

## Install Required Software

### 1. Install Docker

```bash
# Remove old versions if any
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Logout and login again for group changes to take effect
# Or run: newgrp docker
```

### 2. Install Caddy (Reverse Proxy)

```bash
# Install prerequisites
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https

# Add Caddy GPG key
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg

# Add Caddy repository
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Install Caddy
sudo apt update
sudo apt install -y caddy

# Verify installation
caddy version
```

### 3. Install Fail2ban (Security)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

### 4. Create Swap File (if needed)

```bash
# Check current swap
free -h

# Create 2GB swap file (adjust size as needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

## Configure Security

### 1. Configure UFW Firewall

```bash
# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose
```

**⚠️ WARNING**: Make sure SSH is allowed before enabling UFW, or you may lock yourself out!

### 2. Secure SSH (Optional but Recommended)

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# - Change Port 22 to a non-standard port (e.g., Port 2222)
# - Set PermitRootLogin no
# - Set PasswordAuthentication no (use SSH keys only)

# Restart SSH service
sudo systemctl restart sshd
```

### 3. Configure Fail2ban

```bash
# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local

# Adjust settings:
# - bantime = 3600 (1 hour)
# - findtime = 600 (10 minutes)
# - maxretry = 5

# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Prepare Application Files

### 1. Upload Backend Files

You have several options:

#### Option A: Using Git (Recommended)

```bash
cd ~/pstudios
git clone https://github.com/yourusername/pstudios.git .
# Or clone just the backend:
git clone https://github.com/yourusername/pstudios.git temp
cp -r temp/backend/* ~/pstudios/backend/
rm -rf temp
```

#### Option B: Using SCP (from local machine)

```bash
# From your local machine
scp -r backend/ username@your-server-ip:~/pstudios/
```

#### Option C: Using rsync (from local machine)

```bash
# From your local machine
rsync -avz --exclude 'node_modules' backend/ username@your-server-ip:~/pstudios/backend/
```

### 2. Verify Backend Structure

```bash
cd ~/pstudios/backend
ls -la

# Should see:
# - src/
# - package.json
# - Dockerfile
# - docker-compose.yml
# - envs/ (or env.example)
```

### 3. Create Required Directories

```bash
cd ~/pstudios/backend

# Create directories for Docker volumes
mkdir -p uploads
mkdir -p logs/api
mkdir -p envs

# Set permissions
chmod 755 uploads
chmod 755 logs
```

---

## Configure Environment Variables

### 1. Create Environment File

```bash
cd ~/pstudios/backend
nano envs/api.env
```

### 2. Add Environment Variables

Copy and modify the following template:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=mongodb://root:YOUR_SECURE_PASSWORD@mongo:27017/merndb?authSource=admin
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=YOUR_SECURE_PASSWORD
MONGO_DATABASE=merndb

# JWT Secret (generate a secure random string)
JWT_SECRET=YOUR_VERY_SECURE_JWT_SECRET_MIN_32_CHARS

# CORS Configuration
CLIENT_ORIGIN=https://www.paradigmstudios.art,https://paradigmstudios.art

# File Upload Configuration
UPLOAD_DIR=./uploads
```

### 3. Generate Secure Secrets

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate MongoDB Password (32+ characters)
openssl rand -base64 32
```

**⚠️ IMPORTANT**: 
- Replace `YOUR_SECURE_PASSWORD` with a strong password
- Replace `YOUR_VERY_SECURE_JWT_SECRET_MIN_32_CHARS` with a secure random string
- Keep this file secure and never commit it to Git

### 4. Set File Permissions

```bash
chmod 600 envs/api.env
```

---

## Set Up Reverse Proxy (Caddy)

### 1. Create Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

### 2. Add Configuration

Replace `api.paradigmstudios.art` with your actual domain:

```caddyfile
api.paradigmstudios.art {
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
    
    # Default response
    handle {
        reverse_proxy localhost:3000
    }
    
    # Compression
    encode gzip zstd
    
    # Logging
    log {
        output file /var/log/caddy/api_access.log
        format single_field common_log
    }
}
```

### 3. Test Caddy Configuration

```bash
# Test configuration syntax
sudo caddy validate --config /etc/caddy/Caddyfile
```

### 4. Start and Enable Caddy

```bash
# Enable Caddy to start on boot
sudo systemctl enable caddy

# Start Caddy
sudo systemctl start caddy

# Check status
sudo systemctl status caddy

# View logs
sudo journalctl -u caddy -f
```

---

## Deploy Backend Application

### 1. Navigate to Backend Directory

```bash
cd ~/pstudios/backend
```

### 2. Review Docker Compose File

```bash
cat docker-compose.yml
```

Ensure it looks correct. Key points:
- API service uses `env_file: ./envs/api.env`
- MongoDB service has proper environment variables
- Volumes are correctly mapped

### 3. Build and Start Services

```bash
# Build and start in detached mode
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Verify Services Are Running

```bash
# Check all containers
docker compose ps

# Check API logs
docker compose logs api

# Check MongoDB logs
docker compose logs mongo

# Test API locally
curl http://localhost:3000/api/health
```

### 5. Seed Admin User (First Time Only)

```bash
# Run seed script
docker compose exec api npm run seed

# Or if seed script doesn't exist, create admin manually:
docker compose exec api node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const user = new User({
    email: 'admin@paradigmstudios.art',
    password: 'admin123', // CHANGE THIS!
    role: 'admin'
  });
  await user.save();
  console.log('Admin user created');
  process.exit(0);
});
"
```

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

---

## Deploy Frontend

### Option 1: GitHub Pages (Recommended)

The frontend is configured to deploy to GitHub Pages automatically or manually.

#### Manual GitHub Pages Deployment

```bash
# On your local machine
cd pstudios-landingpage

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

#### Verify Frontend Configuration

Ensure `pstudios-landingpage/src/config/api.js` points to your production API:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paradigmstudios.art'  // Your API domain
  : process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### Option 2: Deploy to VPS (Alternative)

If you want to serve the frontend from your VPS:

```bash
# On your local machine, build the frontend
cd pstudios-landingpage
npm install
npm run build

# Upload build directory to VPS
scp -r build/* username@your-server-ip:/var/www/html/

# On VPS, configure Caddy to serve static files
sudo nano /etc/caddy/Caddyfile
```

Add to Caddyfile:

```caddyfile
www.paradigmstudios.art {
    root * /var/www/html
    file_server
    try_files {path} /index.html
}
```

---

## Configure DNS

### 1. Create A Record

In your domain's DNS settings, create an A record:

- **Type**: A
- **Name**: `api` (or `@` for root domain)
- **Value**: Your VPS IP address
- **TTL**: 3600 (or default)

### 2. Verify DNS Propagation

```bash
# Check DNS resolution
nslookup api.paradigmstudios.art
dig api.paradigmstudios.art

# Test from your local machine
curl -I https://api.paradigmstudios.art/api/health
```

### 3. Wait for SSL Certificate

Caddy automatically obtains SSL certificates. Wait a few minutes, then check:

```bash
# Check Caddy logs for certificate
sudo journalctl -u caddy | grep "certificate"

# Test HTTPS
curl https://api.paradigmstudios.art/api/health
```

---

## Verify Deployment

### 1. Test API Endpoints

```bash
# Health check
curl https://api.paradigmstudios.art/api/health

# Test login (replace with your credentials)
curl -X POST https://api.paradigmstudios.art/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paradigmstudios.art","password":"yourpassword"}'
```

### 2. Test Frontend Connection

1. Open your frontend URL in a browser
2. Try logging into the admin panel
3. Verify API calls work (check browser console)

### 3. Check Logs

```bash
# API logs
docker compose logs api -f

# Caddy logs
sudo journalctl -u caddy -f

# System logs
sudo journalctl -xe
```

### 4. Monitor Resources

```bash
# Check Docker containers
docker compose ps

# Check system resources
htop
# or
free -h
df -h
```

---

## Set Up Backups

### 1. Create Backup Script

```bash
nano ~/pstudios/backend/scripts/mongo_backup.sh
```

Add the following:

```bash
#!/bin/bash

# MongoDB Backup Script
BACKUP_DIR="/home/$USER/pstudios/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mongo_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create MongoDB backup
docker compose exec -T mongo mongodump \
  --archive \
  --username=root \
  --password=$(grep MONGO_INITDB_ROOT_PASSWORD ~/pstudios/backend/envs/api.env | cut -d '=' -f2) \
  --authenticationDatabase=admin \
  --db=merndb | gzip > $BACKUP_FILE

# Backup uploads directory
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C ~/pstudios/backend uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 2. Make Script Executable

```bash
chmod +x ~/pstudios/backend/scripts/mongo_backup.sh
```

### 3. Test Backup Script

```bash
~/pstudios/backend/scripts/mongo_backup.sh
```

### 4. Set Up Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2:15 AM
15 2 * * * /home/$USER/pstudios/backend/scripts/mongo_backup.sh >> /home/$USER/pstudios/backend/logs/backup.log 2>&1
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Containers Won't Start

```bash
# Check logs
docker compose logs

# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000

# Restart Docker service
sudo systemctl restart docker
```

#### 2. MongoDB Connection Errors

```bash
# Check MongoDB container
docker compose logs mongo

# Verify environment variables
docker compose exec api env | grep DATABASE

# Test MongoDB connection
docker compose exec mongo mongosh -u root -p YOUR_PASSWORD --authenticationDatabase admin
```

#### 3. Caddy SSL Certificate Issues

```bash
# Check Caddy logs
sudo journalctl -u caddy -n 50

# Verify DNS is pointing correctly
nslookup api.paradigmstudios.art

# Reload Caddy configuration
sudo systemctl reload caddy
```

#### 4. API Not Responding

```bash
# Check if API container is running
docker compose ps

# Check API logs
docker compose logs api -f

# Test locally
curl http://localhost:3000/api/health

# Check firewall
sudo ufw status
```

#### 5. CORS Errors

Verify CORS configuration in `backend/src/index.js`:

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://www.paradigmstudios.art', 'https://paradigmstudios.art'],
  credentials: true
}));
```

#### 6. File Upload Issues

```bash
# Check uploads directory permissions
ls -la ~/pstudios/backend/uploads

# Fix permissions if needed
chmod 755 ~/pstudios/backend/uploads
chown -R $USER:$USER ~/pstudios/backend/uploads
```

#### 7. Out of Memory

```bash
# Check memory usage
free -h

# Increase swap if needed (see swap setup section)
# Or upgrade VPS resources
```

### Useful Commands

```bash
# Restart all services
docker compose restart

# Rebuild and restart
docker compose down
docker compose up -d --build

# View real-time logs
docker compose logs -f

# Execute command in container
docker compose exec api sh
docker compose exec mongo mongosh

# Check disk space
df -h

# Check system resources
htop
```

---

## Maintenance

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d

# Update application code
cd ~/pstudios/backend
git pull
docker compose up -d --build
```

### Monitoring

Set up monitoring for:
- API uptime (use UptimeRobot or similar)
- Disk space alerts
- Memory usage
- SSL certificate expiration (Caddy handles this automatically)

### Security Updates

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Review and update dependencies
cd ~/pstudios/backend
npm audit
npm audit fix
```

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] Default admin password has been changed
- [ ] SSL certificate is working (HTTPS)
- [ ] DNS is properly configured
- [ ] Firewall is configured and active
- [ ] Backups are set up and tested
- [ ] CORS is configured for your frontend domain
- [ ] File uploads directory has correct permissions
- [ ] API health check responds correctly
- [ ] Frontend can connect to API
- [ ] Admin panel login works
- [ ] MongoDB is not exposed externally
- [ ] Logs are being written correctly

---

## Support

If you encounter issues:

1. Check logs: `docker compose logs` and `sudo journalctl -u caddy`
2. Verify environment variables
3. Test each component individually
4. Check DNS and network connectivity
5. Review firewall rules

For additional help, refer to:
- `DEVELOPMENT_HISTORY.md` - Known issues and fixes
- `backend/DEPLOYMENT_GUIDE.md` - Additional deployment information
- `backend/SETUP_GUIDE.md` - Setup-specific guidance

---

**Last Updated**: 2025-01-13

