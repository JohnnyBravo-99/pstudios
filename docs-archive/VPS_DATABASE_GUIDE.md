# VPS Database Connection Guide

Working with production data from your VPS.

---

## ⚠️ Important: SSH Tunnel Currently Not Available

Your VPS MongoDB is running in Docker **without exposing port 27017**. This means SSH tunneling won't work without modifying the VPS configuration.

**Current VPS Setup:**
- MongoDB is inside Docker container `mern_mongo`
- Only accessible within Docker network
- Not exposed to VPS localhost

**To enable SSH tunnel**, you would need to modify VPS `docker-compose.yml`:
```yaml
mongo:
  ports:
    - "27017:27017"  # Add this line
```

⚠️ **Not recommended** - Exposes database to internet (security risk)

---

## Option 2: Sync Data (Copy to Local) 📥

**Use when:** You want to test with production data safely

**Pros:**
- ✅ Safe - won't affect production
- ✅ No need to keep SSH tunnel open
- ✅ Work offline after sync
- ✅ Can modify data freely
- ✅ Syncs both database AND media files (images/uploads)

**Cons:**
- Data is a snapshot (not real-time)
- Need to re-sync to get latest data

### How to Use

**Step 1: Make sure local MongoDB is running**
```powershell
.\start-dev-local.ps1
```
Wait for MongoDB to start, then close the terminals (or keep them running).

**Step 2: Sync data from VPS**
```powershell
.\sync-vps-data.ps1
```
- Enter SSH password when prompted (you'll be asked 2-3 times)
- Wait for export/import to complete
- VPS database AND media files are now copied locally

**Step 3: Use normally**
Your local database now has production data. Use the regular local development:
```powershell
.\start-dev-local.ps1
```

**Refresh data anytime:**
Run `.\sync-vps-data.ps1` again to pull latest from VPS.

---

## Why Sync Data Instead of SSH Tunnel?

| Feature | SSH Tunnel | Sync Data ✅ |
|---------|-----------|-----------|
| **Works Now** | No (requires VPS changes) | Yes |
| **Security** | Risky (exposes DB) | Safe |
| **Affects Production** | Yes ⚠️ | No ✅ |
| **Offline Work** | No | Yes |
| **VPS Connection** | Always needed | Only during sync |
| **Best For** | - | Safe development |

---

## Quick Start (Recommended Workflow)

```powershell
# 1. Sync production data (do this once per day/week)
.\sync-vps-data.ps1

# 2. Develop with local copy
.\start-dev-local.ps1
```

---

## VPS Connection Details

- **IP:** 212.38.95.123
- **SSH User:** jay_gatsby
- **SSH Password:** `I'd6kc9P1mv1+C&EdE'4`
- **MongoDB Container:** mern_mongo
- **MongoDB User:** root
- **MongoDB Port:** 27017 (inside Docker, not exposed)
- **Database Name:** `merndb` (production) / `pstudios-dev` (local)

---

## Troubleshooting

### SSH Tunnel Won't Start
```powershell
# Test SSH connection first
ssh jay_gatsby@212.38.95.123
```

### Can't Connect to VPS MongoDB
```bash
# On VPS, check if MongoDB is running
docker ps | grep mongo
```

### Sync Script Fails
```powershell
# Ensure local MongoDB is running
docker ps | grep pstudios_mongo_dev

# Start if not running
docker start pstudios_mongo_dev
```

### Port 27018 Already in Use
```powershell
# Find what's using it
Get-NetTCPConnection -LocalPort 27018

# Kill the process
Stop-Process -Id <PID>
```

---

## Recommended Workflow

**For daily development:**
1. Run `.\sync-vps-data.ps1` once a day/week
2. Develop with `.\start-dev-local.ps1`
3. Test safely without affecting production

**For production testing:**
1. Use SSH tunnel method
2. Test read operations only
3. Be very careful with writes/deletes

---

**Last Updated:** 2025-12-29
