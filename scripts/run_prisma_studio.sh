#!/bin/bash

# Prisma Studio Server - Database Admin Panel
# Runs on port 5555 and accessible via reverse proxy

PROJECT_DIR="/var/www/political_violence_tracker"

cd "$PROJECT_DIR" || exit 1

# Ensure fresh client
/usr/bin/npx prisma generate

# Run Prisma Studio on all interfaces (0.0.0.0)
/usr/bin/npx prisma studio --port 5555 --browser none --hostname 0.0.0.0
