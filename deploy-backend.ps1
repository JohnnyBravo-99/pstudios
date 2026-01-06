# SSH deployment script for backend
$vpsIP = "212.38.95.123"
$username = "jay_gatsby"
$keyPassword = "I'd6kc9P1mv1+C&EdE'4"

# Commands to run on VPS
$commands = @"
cd ~/mernvps
git pull origin main
cd backend
docker compose down
docker compose up -d --build
docker compose logs api --tail=50
"@

Write-Host "Connecting to VPS and deploying backend..."
Write-Host "You will be prompted for the SSH key password: $keyPassword"

# Try to connect and run commands
ssh -o StrictHostKeyChecking=no ${username}@${vpsIP} $commands

