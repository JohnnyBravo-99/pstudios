# MERN Stack VPS Deployment Plan
## Production-Ready Backend with GitHub Pages Frontend Integration

### Overview
This plan outlines the complete deployment of a MERN stack backend on a VPS (Hostinger 4GB RAM) with automatic TLS, security hardening, and integration with a GitHub Pages hosted frontend.

---

## Phase 1: Server Security & Basic Setup

### 1.1 Firewall Configuration (UFW)
```bash
# Install and configure UFW
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

**Security Notes:**
- Only SSH (22), HTTP (80), and HTTPS (443) ports are exposed
- MongoDB port 27017 is NOT exposed externally (internal Docker network only)
- SSH should be configured with key-based authentication only

### 1.2 Docker & Docker Compose Installation
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker jack

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin
```

### 1.3 Caddy Reverse Proxy Setup
```bash
# Install Caddy for automatic TLS
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### 1.4 Security Hardening
```bash
# Install fail2ban for brute-force protection
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban

# Create swap file for 4GB RAM system
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Phase 2: Application Configuration

### 2.1 Project Structure
```
/home/jack/mernvps/
├── docker-compose.yml
├── envs/
│   └── api.env
├── scripts/
│   └── mongo_backup.sh
└── logs/
    └── api/
```

### 2.2 Docker Compose Configuration
**File: `/home/jack/mernvps/docker-compose.yml`**
```yaml
version: "3.8"

services:
  api:
    image: your-dockerhub-user/your-api:latest
    container_name: mern_api
    restart: unless-stopped
    env_file: ./envs/api.env
    ports:
      - "3000:3000"           # internal mapping; Caddy will proxy to port 3000
    depends_on:
      - mongo
    networks:
      - mern_net
    volumes:
      - ./logs/api:/usr/src/app/logs

  mongo:
    image: mongo:6.0
    container_name: mern_mongo
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_DATABASE}
    volumes:
      - mongo-data:/data/db
    networks:
      - mern_net

  mongo-express:       # optional admin UI, remove if you don't want it
    image: mongo-express
    container_name: mongo_express
    restart: unless-stopped
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - ME_CONFIG_MONGODB_ADMINPASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - ME_CONFIG_MONGODB_SERVER=mongo
    ports:
      - "8081:8081"
    networks:
      - mern_net

volumes:
  mongo-data:

networks:
  mern_net:
    driver: bridge
```

### 2.3 Environment Configuration
**File: `/home/jack/mernvps/envs/api.env`**
```ini
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb://root:${MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/${MONGO_DATABASE}?authSource=admin
JWT_SECRET=change_this_to_a_long_random_string
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=supersecurepassword
MONGO_DATABASE=merndb
```

**Security Requirements:**
- Generate a strong, random JWT_SECRET (32+ characters)
- Use a strong MongoDB root password (20+ characters)
- Keep this file secure and never commit to version control

### 2.4 Caddy Configuration
**File: `/etc/caddy/Caddyfile`**
```caddyfile
api.example.com {
    reverse_proxy localhost:3000
    encode gzip zstd
    log {
      output file /var/log/caddy/api_access.log
      format single_field common_log
    }
}

# Optional: MongoDB admin interface (secure this!)
# admin.example.com {
#   reverse_proxy localhost:8081
# }
```

**Reload Caddy:**
```bash
sudo systemctl reload caddy
```

---

## Phase 3: GitHub Pages Frontend Integration

### 3.1 CORS Configuration
Your Express.js backend must be configured to allow requests from your GitHub Pages domain:

```javascript
// In your Express app
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-username.github.io',
    'https://your-username.github.io/round2mern', // if using project pages
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

### 3.2 API Endpoint Structure
Ensure your API endpoints are structured for frontend consumption:

```javascript
// Example API structure
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/users', authenticateToken, (req, res) => {
  // Your user logic
});

app.post('/api/auth/login', async (req, res) => {
  // Login logic
});
```

### 3.3 Frontend API Configuration
In your React frontend, configure the API base URL:

```javascript
// config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com' 
  : 'http://localhost:3000';

export default API_BASE_URL;
```

---

## Phase 4: Backup & Monitoring

### 4.1 MongoDB Backup Script
**File: `/home/jack/mernvps/scripts/mongo_backup.sh`**
```bash
#!/bin/bash
BACKUP_DIR=/home/jack/backups
DATE=$(date +"%F_%H%M")
mkdir -p $BACKUP_DIR

# Create backup
docker exec mern_mongo bash -c "mongodump --archive=/tmp/backup-$DATE.gz --gzip --db=${MONGO_DATABASE} --username=${MONGO_INITDB_ROOT_USERNAME} --password=${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin"

# Copy backup from container
docker cp mern_mongo:/tmp/backup-$DATE.gz $BACKUP_DIR/

# Clean up container
docker exec mern_mongo rm /tmp/backup-$DATE.gz

# Upload to remote storage (configure rclone first)
rclone copy $BACKUP_DIR/backup-$DATE.gz cloud:merndb-backups --log-file=/home/jack/backups/rclone-$DATE.log

# Clean up old local backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Setup cron job:**
```bash
chmod +x /home/jack/mernvps/scripts/mongo_backup.sh
crontab -e
# Add: 15 2 * * * /home/jack/mernvps/scripts/mongo_backup.sh >> /home/jack/mernvps/scripts/backup.log 2>&1
```

### 4.2 Monitoring Setup
- **Uptime Monitoring:** Use UptimeRobot (free) to ping your API endpoint
- **Log Monitoring:** Set up log rotation for Caddy and application logs
- **Resource Monitoring:** Monitor RAM usage (4GB limit on Hostinger)

---

## Phase 5: Deployment Workflow

### 5.1 Development to Production Pipeline
1. **Local Development:** Develop and test locally
2. **Docker Build:** Build and tag your API image
3. **Push to Registry:** Push to Docker Hub or GitHub Container Registry
4. **VPS Deployment:** Pull and deploy on VPS

### 5.2 GitHub Actions Workflow
**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: |
          docker build -t your-dockerhub-user/your-api:${{ github.sha }} .
          docker build -t your-dockerhub-user/your-api:latest .
      
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push your-dockerhub-user/your-api:${{ github.sha }}
          docker push your-dockerhub-user/your-api:latest
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/jack/mernvps
            docker compose pull
            docker compose up -d
```

---

## Phase 6: Security Checklist

### 6.1 SSH Security
- [ ] Use SSH key authentication only
- [ ] Disable password authentication
- [ ] Change default SSH port (optional)
- [ ] Configure fail2ban for SSH protection

### 6.2 Application Security
- [ ] Implement rate limiting on API endpoints
- [ ] Validate and sanitize all user input
- [ ] Use parameterized queries for MongoDB
- [ ] Implement proper CORS configuration
- [ ] Use HTTPS only in production
- [ ] Implement request logging and monitoring

### 6.3 Database Security
- [ ] MongoDB runs with authentication enabled
- [ ] Database not exposed to external network
- [ ] Regular security updates for MongoDB
- [ ] Encrypted backups

---

## Phase 7: Cost Optimization

### 7.1 Hostinger 4GB Plan Optimization
- **Memory Management:** Monitor RAM usage, consider moving to managed MongoDB if needed
- **Bandwidth:** Serve static assets from GitHub Pages or CDN
- **Storage:** Use external storage for backups (Backblaze B2, AWS S3)

### 7.2 Scaling Considerations
- **Traffic Growth:** Monitor performance, upgrade VPS if needed
- **Database:** Consider MongoDB Atlas for high-traffic scenarios
- **CDN:** Implement CloudFlare for static asset delivery

---

## Troubleshooting Guide

### Common Issues & Solutions

1. **API Unreachable**
   ```bash
   sudo journalctl -u caddy -f
   docker compose logs api
   ```

2. **MongoDB Connection Issues**
   ```bash
   docker compose logs mongo
   # Check DATABASE_URL and environment variables
   ```

3. **TLS/SSL Problems**
   ```bash
   # Ensure DNS A record points to VPS IP
   sudo systemctl restart caddy
   tail -f /var/log/caddy/*
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   docker stats
   ```

---

## Next Steps

1. **Immediate Actions:**
   - Set up the VPS with security configurations
   - Configure Docker and Caddy
   - Set up the application environment

2. **Development Integration:**
   - Configure CORS for GitHub Pages frontend
   - Set up API endpoints for frontend consumption
   - Implement authentication flow

3. **Production Readiness:**
   - Set up monitoring and alerting
   - Configure automated backups
   - Implement CI/CD pipeline

4. **Long-term Considerations:**
   - Plan for scaling as traffic grows
   - Consider managed database services
   - Implement comprehensive logging and monitoring

---

## Security Notes

- **Never commit `.env` files to version control**
- **Use strong, unique passwords and secrets**
- **Regularly update all dependencies and system packages**
- **Monitor logs for suspicious activity**
- **Implement proper input validation and sanitization**
- **Use HTTPS everywhere in production**

This plan provides a production-ready foundation for your MERN stack backend with proper security, monitoring, and integration with your GitHub Pages frontend.
