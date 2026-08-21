#!/bin/bash

# Configuration
PROJECT_DIR="/Users/musfiqurtuhin/Documents/workspace/political_violence_tracker"
LOG_FILE="$PROJECT_DIR/crawler_cron.log"
SCHEDULE="55 23 * * *" # Every day at 11:55 PM

# Detect paths
NODE_PATH=$(which node)
NPM_PATH=$(which npm)
TSX_PATH="$PROJECT_DIR/node_modules/.bin/tsx"

echo "📍 Setting up crawler automation..."
echo "   Project: $PROJECT_DIR"
echo "   Node: $NODE_PATH"

# Create the cron command
# We use 'cd' to ensure we're in the right directory for .env loading
CRON_CMD="cd $PROJECT_DIR && $TSX_PATH scripts/crawler.ts >> $LOG_FILE 2>&1"

# Prepare crontab entry
NEW_CRON_JOB="$SCHEDULE $CRON_CMD"

# Backup existing crontab
crontab -l > mycron.bak 2>/dev/null

# Add new job (avoiding duplicates)
# We filter out any previous lines containing 'scripts/crawler.ts' to avoid double scheduling
grep -v "scripts/crawler.ts" mycron.bak > mycron.new 2>/dev/null || true
echo "$NEW_CRON_JOB" >> mycron.new

# Install new crontab
crontab mycron.new

# Cleanup
rm mycron.new

echo "✅ Success! Crawler scheduled to run every 6 hours."
echo "   Logs will be written to: $LOG_FILE"
echo "   To view jobs: crontab -l"
