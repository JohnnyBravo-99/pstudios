# MERN VPS Deployment Checklist

## ✅ PRE-DEPLOYMENT SETUP (COMPLETED)
- [x] Environment variables configured with secure passwords
- [x] Docker Compose file ready
- [x] Caddyfile template created
- [x] Backup script prepared
- [x] Directory structure organized
- [x] Complete setup script created
- [x] Security configurations prepared
- [x] CORS configuration for GitHub Pages
- [x] GitHub Actions workflow ready

## 🚀 SYSTEM SETUP (NEXT STEPS)
- [ ] Run: `sudo bash /home/jay_gatsby/mernvps/scripts/complete_setup.sh`
- [ ] Verify UFW firewall is active
- [ ] Verify Docker is installed and user is in docker group
- [ ] Verify Caddy is installed and running
- [ ] Verify fail2ban is active
- [ ] Verify swap file is created

## Domain Configuration
- [ ] Update `/etc/caddy/Caddyfile` with your actual domain
- [ ] Ensure DNS A record points to this VPS IP
- [ ] Test domain resolution: `nslookup your-domain.com`

## Application Deployment
- [ ] Logout and login again (for Docker group permissions)
- [ ] Deploy: `cd /home/jay_gatsby/mernvps && docker compose up -d`
- [ ] Check logs: `docker compose logs`
- [ ] Test API: `curl http://localhost:3000/api/health`
- [ ] Test external: `curl https://your-domain.com/api/health`

## Security Verification
- [ ] SSH key authentication only (disable password auth)
- [ ] Firewall only allows SSH, HTTP, HTTPS
- [ ] MongoDB not exposed externally
- [ ] Environment variables are secure
- [ ] CORS configured for your frontend domain

## Monitoring Setup
- [ ] Set up automated backups: `crontab -e`
- [ ] Add: `15 2 * * * /home/jay_gatsby/mernvps/scripts/mongo_backup.sh`
- [ ] Test backup script manually
- [ ] Set up uptime monitoring (UptimeRobot)

## Post-Deployment Testing
- [ ] API responds to health check
- [ ] Database connection works
- [ ] CORS allows frontend requests
- [ ] TLS certificate is valid
- [ ] Backup script runs successfully
- [ ] Logs are being written properly

## Troubleshooting Commands
```bash
# Check services
sudo systemctl status caddy
docker compose ps
sudo ufw status

# Check logs
sudo journalctl -u caddy -f
docker compose logs api
docker compose logs mongo

# Test connectivity
curl http://localhost:3000/api/health
curl https://your-domain.com/api/health
```
