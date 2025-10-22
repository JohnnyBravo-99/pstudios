#!/bin/bash

# MERN VPS Setup Script
# Run with: sudo bash setup_vps.sh

set -e  # Exit on any error

echo "=== MERN VPS Setup Starting ==="

# 1. Update system packages
echo "Updating system packages..."
apt update && apt upgrade -y

# 2. Install UFW and configure firewall
echo "Installing and configuring UFW firewall..."
apt install -y ufw

# Configure UFW rules
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

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# 4. Install Caddy
echo "Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 5. Install fail2ban
echo "Installing fail2ban..."
apt install -y fail2ban
systemctl enable --now fail2ban

# 6. Create swap file (2GB for 4GB RAM system)
echo "Creating swap file..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 7. Create project directory structure
echo "Creating project directory structure..."
mkdir -p /home/jay_gatsby/mernvps/{envs,scripts,logs/api}
chown -R jay_gatsby:jay_gatsby /home/jay_gatsby/mernvps

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Logout and login again to get Docker group permissions"
echo "2. Configure your application files"
echo "3. Set up environment variables"
echo "4. Configure Caddy"
