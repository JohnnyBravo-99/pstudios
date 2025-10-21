# Manual VPS Setup Commands

Run these commands on your VPS with sudo access:

## 1. Basic System Setup
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Firewall Configuration
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

## 3. Docker Installation
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker jay_gatsby
sudo apt install -y docker-compose-plugin
```

## 4. Caddy Installation
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/ubuntu $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

## 5. Security Setup
```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

## 6. Swap File Creation
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 7. Project Directory Setup
```bash
sudo mkdir -p /home/jay_gatsby/mernvps/{envs,scripts,logs/api}
sudo chown -R jay_gatsby:jay_gatsby /home/jay_gatsby/mernvps
```

After running these commands, logout and login again to get Docker group permissions.
