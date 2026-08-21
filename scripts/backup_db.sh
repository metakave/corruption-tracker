#!/bin/bash

# Database Backup Script
# Keeps last 7 days of backups

PROJECT_DIR="/var/www/political_violence_tracker"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="political_violence" # Based on prisma schema info
DB_USER="postgres" # Assuming default, strictly we should use .env but pg_dump works if peer trusted or .pgpass

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"

# 1. Create Backup
echo "🗄️  Starting backup for $DB_NAME at $TIMESTAMP..."
# Using docker exec if postgres depends on docker, but assuming native install based on previous interactions
# Let's try pg_dump directly first. If failed, we might need credentials.
# We will use the DATABASE_URL from .env to be safe
export $(grep -v '^#' $PROJECT_DIR/.env | xargs)

# Extract PG connection info if needed, or just let pg_dump use the URL
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"; then
    echo "✅ Backup created: db_backup_$TIMESTAMP.sql"
    
    # 2. Compress
    gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    echo "📦 Compressed to .sql.gz"

    # 3. Cleanup old backups (older than 7 days)
    find "$BACKUP_DIR" -type f -name "db_backup_*.sql.gz" -mtime +7 -exec rm {} \;
    echo "🧹 Removed backups older than 7 days"
else
    echo "❌ Backup FAILED!"
    exit 1
fi
