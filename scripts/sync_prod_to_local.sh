#!/bin/bash

# SYNC PROD -> LOCAL
# This script dumps the production database and imports it into the local database.

# 1. Verification
read -p "⚠️  This will OVERWRITE your LOCAL database with Production data. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 2. Backup Production First (Global Rule Compliance)
./scripts/backup_production.sh

# 3. Get latest backup file
LATEST_BACKUP=$(ls -t backups/prod_backup_*.sql | head -n 1)
echo "📂 Using latest backup: $LATEST_BACKUP"

# 4. Reset Local DB (Prisma)
echo "🧹 Clearing local database..."
npx prisma migrate reset --force --skip-seed

# 5. Import Data
# Assuming local connection string in .env OR standard localhost:5432
# We use psql to restore.
echo "📥 Importing data to local..."
# Need to parse user/pass from .env or assume defaults. 
# For this script we assume standard 'postgres' user locally or use DATABASE_URL if feasible.
# Simpler: just use psql with default creds if running locally.

# Extract DB name from .env or hardcode if known ('political_violence')
DB_NAME="political_violence"
psql -d $DB_NAME < $LATEST_BACKUP

echo "✅ Sync Complete: Production Data is now on Local."
