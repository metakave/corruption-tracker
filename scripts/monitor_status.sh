#!/bin/bash
echo "🌊 connecting to production server to monitor logs..."
echo "Press Ctrl+C to stop monitoring."
echo "---------------------------------------------------"
ssh -o StrictHostKeyChecking=no root@46.224.92.166 "tail -f /var/www/political_violence_tracker/manual_crawler_v3.log /root/.pm2/logs/ai-pipeline-out.log"
