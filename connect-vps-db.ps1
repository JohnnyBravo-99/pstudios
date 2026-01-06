# Connect to VPS MongoDB via SSH Tunnel
# This creates a secure tunnel: localhost:27018 -> VPS:27017

$vpsIP = "212.38.95.123"
$username = "jay_gatsby"
$localPort = 27018  # Use 27018 locally to avoid conflict with local MongoDB
$remotePort = 27017  # MongoDB port on VPS

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Creating SSH Tunnel to VPS MongoDB" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "VPS IP:        $vpsIP" -ForegroundColor White
Write-Host "Local Port:    $localPort" -ForegroundColor White
Write-Host "Remote Port:   $remotePort" -ForegroundColor White
Write-Host "`nConnection:    localhost:$localPort -> $vpsIP`:$remotePort`n" -ForegroundColor Yellow

Write-Host "Instructions:" -ForegroundColor White
Write-Host "  1. Enter your SSH password when prompted" -ForegroundColor Gray
Write-Host "  2. Keep this window OPEN while developing" -ForegroundColor Gray
Write-Host "  3. Update .env.development to use: mongodb://localhost:27018/pstudios" -ForegroundColor Gray
Write-Host "  4. Press Ctrl+C to close the tunnel when done`n" -ForegroundColor Gray

Write-Host "Starting SSH tunnel...`n" -ForegroundColor Yellow

# Create SSH tunnel
# -L = Local port forwarding
# -N = Don't execute remote command
# -v = Verbose (optional, remove if too noisy)
ssh -L ${localPort}:localhost:${remotePort} ${username}@${vpsIP} -N
