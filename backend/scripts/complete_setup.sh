#!/bin/bash

# Complete MERN VPS Setup Script
# Run with: sudo bash complete_setup.sh

set -e  # Exit on any error

echo "=== MERN VPS Complete Setup Starting ==="

# 1. System Updates
echo "Updating system packages..."
apt update && apt upgrade -y

# 2. Configure UFW Firewall
echo "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "UFW Status:"
ufw status verbose

# 3. Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker jay_gatsby
apt install -y docker-compose-plugin

# 4. Install Caddy
echo "Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 5. Install Fail2ban
echo "Installing fail2ban..."
apt install -y fail2ban
systemctl enable --now fail2ban

# 6. Create Swap File
echo "Creating swap file..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 7. Configure Caddy
echo "Configuring Caddy..."
cp /home/jay_gatsby/mernvps/configs/Caddyfile /etc/caddy/Caddyfile
systemctl enable caddy
systemctl start caddy

# 8. Set up project permissions
echo "Setting up project permissions..."
chown -R jay_gatsby:jay_gatsby /home/jay_gatsby/mernvps
chmod +x /home/jay_gatsby/mernvps/scripts/mongo_backup.sh

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Logout and login again to get Docker group permissions"
echo "2. Update the Caddyfile with your actual domain:"
echo "   sudo nano /etc/caddy/Caddyfile"
echo "3. Deploy your application:"
echo "   cd /home/jay_gatsby/mernvps"
echo "   docker compose up -d"
echo "4. Check status:"
echo "   docker compose ps"
echo "   sudo systemctl status caddy"
echo ""
echo "IMPORTANT: Update your domain in /etc/caddy/Caddyfile before deploying!"
