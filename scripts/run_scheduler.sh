#!/bin/bash

# Political Violence Tracker - Automated Crawler
# Runs daily to fetch latest incidents from news sources

# Define Project Path (SERVER PATH)
PROJECT_DIR="/var/www/political_violence_tracker"
LOG_FILE="$PROJECT_DIR/logs/scheduler.log"

# Fix PATH for cron by sourcing environment
# Try to load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Try to load generic profiles
if [ -f "$HOME/.profile" ]; then
    source "$HOME/.profile"
fi
if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
fi

# Fallback PATH addition for common locations
export PATH=$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ | head -n 1)/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH

# Verify node/npx availability
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx could not be found in PATH: $PATH" >> "$LOG_FILE"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/logs"

# Log Start
echo "----------------------------------------" >> "$LOG_FILE"
echo "🕒 Starting scheduled crawl at $(date)" >> "$LOG_FILE"
echo "🔧 Using Node: $(node -v) at $(which node)" >> "$LOG_FILE"

# Run the crawler using npx tsx
npx tsx scripts/crawler.ts >> "$LOG_FILE" 2>&1

# Capture Exit Code
EXIT_CODE=$?

# RETRY LOGIC (Self-Healing)
if [ $EXIT_CODE -ne 0 ]; then
    echo "⚠️ Crawl failed. Retrying in 5 minutes..." >> "$LOG_FILE"
    sleep 300
    /usr/bin/npx tsx scripts/crawler.ts >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Crawl completed successfully at $(date)" >> "$LOG_FILE"
    echo "📊 New data saved to database" >> "$LOG_FILE"

    # --- AUTO-START DEDUPLICATION ---
    echo "----------------------------------------" >> "$LOG_FILE"
    echo "🔄 Starting Post-Crawl De-duplication at $(date)" >> "$LOG_FILE"
    /usr/bin/npx tsx scripts/reprocess_deduplication.ts >> "$LOG_FILE" 2>&1
    DEDUP_EXIT=$?

    if [ $DEDUP_EXIT -eq 0 ]; then
        echo "✅ De-duplication completed successfully at $(date)" >> "$LOG_FILE"
    else
        echo "❌ De-duplication FAILED with exit code $DEDUP_EXIT at $(date)" >> "$LOG_FILE"
    fi
    # --------------------------------
else
    echo "❌ Crawl FAILED after retry with exit code $EXIT_CODE at $(date)" >> "$LOG_FILE"
fi
echo "----------------------------------------" >> "$LOG_FILE"

# Exit with the crawler's exit code
exit $EXIT_CODE
