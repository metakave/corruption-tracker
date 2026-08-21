#!/bin/bash

# System Maintenance Script
# Cleans logs and temp files

PROJECT_DIR="/var/www/political_violence_tracker"
LOG_DIR="$PROJECT_DIR/logs"

echo "🧹 Starting System Maintenance $(date)"

# 1. Rotate Logs (Keep last 1000 lines, archive remainder)
# Access logs can grow huge, so we truncate them occasionally if they get too big
find "$LOG_DIR" -name "*.log" -size +50M -exec truncate -s 10M {} \;
echo "✅ Truncated oversized logs"

# 2. Clean Puppeteer/Chrome Temp Files
# Puppeteer sometimes leaves /tmp filled with chromium profiles
rm -rf /tmp/puppeteer_dev_profile*
rm -rf /tmp/.org.chromium.Chromium*
echo "✅ Cleaned Puppeteer temp files"

# 3. PM2 Log Rotate (trigger manually just in case)
pm2 flush
echo "✅ Flushed PM2 logs"

echo "✨ Maintenance complete"
