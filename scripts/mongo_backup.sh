#!/bin/bash

# MongoDB Backup Script
# This script creates a backup of the MongoDB database and optionally uploads it to remote storage

BACKUP_DIR=/home/jay_gatsby/backups
DATE=$(date +"%F_%H%M")
mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup at $(date)"

# Create backup
docker exec mern_mongo bash -c "mongodump --archive=/tmp/backup-$DATE.gz --gzip --db=${MONGO_DATABASE} --username=${MONGO_INITDB_ROOT_USERNAME} --password=${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin"

# Copy backup from container
docker cp mern_mongo:/tmp/backup-$DATE.gz $BACKUP_DIR/

# Clean up container
docker exec mern_mongo rm /tmp/backup-$DATE.gz

echo "Backup created: $BACKUP_DIR/backup-$DATE.gz"

# Upload to remote storage (uncomment and configure rclone first)
# rclone copy $BACKUP_DIR/backup-$DATE.gz cloud:merndb-backups --log-file=/home/jay_gatsby/backups/rclone-$DATE.log

# Clean up old local backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed at $(date)"
