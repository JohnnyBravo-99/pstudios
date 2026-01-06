# Quick script to check VPS MongoDB status
$vpsIP = "212.38.95.123"
$username = "jay_gatsby"

Write-Host "`nChecking VPS MongoDB Status..." -ForegroundColor Cyan

# Check if MongoDB container is running
Write-Host "`n1. Checking if MongoDB container is running..." -ForegroundColor Yellow
$containerStatus = ssh ${username}@${vpsIP} "docker ps --filter name=mern_mongo --format '{{.Names}} - {{.Status}}'"
Write-Host "   $containerStatus" -ForegroundColor Green

# Check MongoDB version
Write-Host "`n2. Checking MongoDB version..." -ForegroundColor Yellow
$mongoVersion = ssh ${username}@${vpsIP} "docker exec mern_mongo mongod --version | head -n 1"
Write-Host "   $mongoVersion" -ForegroundColor Green

# List databases
Write-Host "`n3. Listing databases..." -ForegroundColor Yellow
$databases = ssh ${username}@${vpsIP} "docker exec mern_mongo mongosh --username root --password kReSn4e10b7q9vDvkLax2yQ8HELneOnB9OW1GMq7eUg= --authenticationDatabase admin --quiet --eval 'db.adminCommand({listDatabases:1})' 2>&1"
Write-Host "$databases" -ForegroundColor Gray

# Check merndb collections
Write-Host "`n4. Checking 'merndb' collections..." -ForegroundColor Yellow
$collections = ssh ${username}@${vpsIP} "docker exec mern_mongo mongosh merndb --username root --password kReSn4e10b7q9vDvkLax2yQ8HELneOnB9OW1GMq7eUg= --authenticationDatabase admin --quiet --eval 'db.getCollectionNames()' 2>&1"
Write-Host "$collections" -ForegroundColor Gray

# Count documents in each collection
Write-Host "`n5. Counting documents in collections..." -ForegroundColor Yellow
$counts = ssh ${username}@${vpsIP} "docker exec mern_mongo mongosh merndb --username root --password kReSn4e10b7q9vDvkLax2yQ8HELneOnB9OW1GMq7eUg= --authenticationDatabase admin --quiet --eval 'db.getCollectionNames().forEach(c => print(c + \`: \` + db.getCollection(c).countDocuments()))' 2>&1"
Write-Host "$counts" -ForegroundColor Gray

Write-Host "`nDone!`n" -ForegroundColor Cyan
