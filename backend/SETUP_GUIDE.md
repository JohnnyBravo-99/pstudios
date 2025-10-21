# MERN VPS Setup Guide

## ✅ CURRENT STATUS (COMPLETED)
- ✅ UFW firewall installed
- ✅ 3.8GB RAM available
- ✅ 45GB disk space available
- ✅ Environment variables configured with secure passwords
- ✅ Docker Compose file ready
- ✅ Caddyfile template created
- ✅ Backup script prepared
- ✅ Complete setup script created
- ✅ Directory structure organized

## 🔄 REMAINING SYSTEM SETUP
- ❌ Docker not installed (will be installed by setup script)
- ❌ Caddy not installed (will be installed by setup script)
- ❌ Fail2ban not installed (will be installed by setup script)
- ❌ No swap file (will be created by setup script)

## 🚀 ONE-COMMAND SETUP (RECOMMENDED)

**Run this single command to set up everything:**
```bash
sudo bash /home/jay_gatsby/mernvps/scripts/complete_setup.sh
```

## Manual Step-by-Step Setup (Alternative)

### 1. System Updates & Firewall
```bash
sudo apt update && sudo apt upgrade -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker jay_gatsby
sudo apt install -y docker-compose-plugin
```

### 3. Install Caddy
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### 4. Install Fail2ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

### 5. Create Swap File
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 6. Configure Caddy
```bash
sudo cp /home/jay_gatsby/mernvps/configs/Caddyfile /etc/caddy/Caddyfile
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

### 7. Update Environment Variables
```bash
nano /home/jay_gatsby/mernvps/envs/api.env
# Change JWT_SECRET and MONGO_INITDB_ROOT_PASSWORD to secure values
```

### 8. Deploy Application
```bash
cd /home/jay_gatsby/mernvps
docker compose up -d
docker compose logs
```

### 9. Setup Automated Backups
```bash
chmod +x /home/jay_gatsby/mernvps/scripts/mongo_backup.sh
crontab -e
# Add: 15 2 * * * /home/jay_gatsby/mernvps/scripts/mongo_backup.sh >> /home/jay_gatsby/mernvps/scripts/backup.log 2>&1
```

## After Setup
1. Logout and login again to get Docker group permissions
2. Test the API: `curl http://localhost:3000/api/health`
3. Check Caddy logs: `sudo journalctl -u caddy -f`
4. Monitor Docker: `docker compose ps`
