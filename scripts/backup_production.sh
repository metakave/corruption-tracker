#!/bin/bash

# Configuration
REMOTE_USER="root"
REMOTE_HOST="46.224.92.166"
REMOTE_APP_DIR="/var/www/political_violence_tracker"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "📦 Creating backup of Production Database..."

# 1. SSH and Dump (Postgres via pg_dump, assuming container or local)
# Since we use Prisma, strictly getting the SQL dump is best.
# Assuming standard Postgres service 'db' in docker or local.
# Let's try standard pg_dump if installed, or use docker exec if it's dockerized.
# Based on logs, it's "localhost:5432" so likely local postgres service.

ssh $REMOTE_USER@$REMOTE_HOST "pg_dump -U postgres -h localhost political_violence > /tmp/db_backup_$TIMESTAMP.sql"

# 2. Download
echo "⬇️ Downloading backup..."
scp $REMOTE_USER@$REMOTE_HOST:/tmp/db_backup_$TIMESTAMP.sql $BACKUP_DIR/prod_backup_$TIMESTAMP.sql

# 3. Cleanup Remote
ssh $REMOTE_USER@$REMOTE_HOST "rm /tmp/db_backup_$TIMESTAMP.sql"

echo "✅ Backup saved to: $BACKUP_DIR/prod_backup_$TIMESTAMP.sql"
