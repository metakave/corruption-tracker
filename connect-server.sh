#!/usr/bin/env bash
# ==============================================================================
# Tracker Live Server Connection Tool
# ==============================================================================
# Decoupled, robust, error-handled live connection script.
# Enforces safe SSH executions and rich visual CLI aesthetics.
# ==============================================================================

set -euo pipefail

# Configuration
SERVER_IP="89.167.59.65"
SERVER_USER="root"
SSH_KEY="$HOME/.ssh/id_ed25519_server_reset"
PROD_COMPOSE="/opt/tracker/docker/docker-compose.prod.yml"

# Colors for premium CLI aesthetics
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0;37m' # No Color

# Print header
echo -e "${BOLD}${CYAN}========================================================"
echo -e "   TRACKER LIVE SERVER INTERACTIVE GATEWAY"
echo -e "========================================================${NC}"
echo -e "Target:   ${BOLD}${GREEN}${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "Key Path: ${BOLD}${BLUE}${SSH_KEY}${NC}"
echo

# 1. Validation Checks
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}${BOLD}[ERROR] Private SSH key not found at:${NC} $SSH_KEY"
    echo -e "Please check if your SSH key exists or configure your .ssh directory."
    exit 1
fi

# Ensure appropriate permissions on local key
chmod 600 "$SSH_KEY"

# Base SSH Connection String
SSH_CMD="ssh -i \"$SSH_KEY\" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP}"

# Test Connection
echo -ne "${YELLOW}Verifying server handshake... ${NC}"
if ! eval "$SSH_CMD \"echo 'handshake_ok'\"" &> /dev/null; then
    echo -e "${RED}${BOLD}FAILED!${NC}"
    echo -e "Could not establish connection to ${SERVER_IP}. Please check internet connection or server state."
    exit 1
fi
echo -e "${GREEN}${BOLD}SUCCESSFUL!${NC}"
echo

# Menu system
show_menu() {
    echo -e "${BOLD}${MAGENTA}--- Select Server Operation ---${NC}"
    echo -e " [${CYAN}1${NC}] Start Interactive SSH Terminal"
    echo -e " [${CYAN}2${NC}] View Live Docker Container Logs (api + web)"
    echo -e " [${CYAN}3${NC}] Stream Server Resource Metrics (实时系统监控)"
    echo -e " [${CYAN}4${NC}] Inspect Nginx Status & Logs"
    echo -e " [${CYAN}5${NC}] Execute Safe Rolling App Container Restart"
    echo -e " [${CYAN}6${NC}] Exit Gateway"
    echo
    echo -ne "Enter choice [1-6]: "
}

while true; do
    show_menu
    read -r choice
    echo

    case "$choice" in
        1)
            echo -e "${GREEN}Spawning interactive session. Type 'exit' to return.${NC}"
            echo -e "--------------------------------------------------------"
            eval "$SSH_CMD"
            echo -e "--------------------------------------------------------"
            echo -e "${BLUE}Interactive session terminated.${NC}"
            echo
            ;;
        2)
            echo -e "${GREEN}Streaming live container logs (Ctrl+C to stop)...${NC}"
            echo -e "--------------------------------------------------------"
            eval "$SSH_CMD \"docker compose -f $PROD_COMPOSE logs -f --tail 100\"" || true
            echo -e "--------------------------------------------------------"
            echo
            ;;
        3)
            echo -e "${GREEN}Analyzing server resource footprints...${NC}"
            echo -e "--------------------------------------------------------"
            eval "$SSH_CMD \"
                echo -e '=== Uptime & Core Load ==='
                uptime
                echo ''
                echo -e '=== Memory Status ==='
                free -h
                echo ''
                echo -e '=== Disk Footprint ==='
                df -h /
                echo ''
                echo -e '=== Container Resource Consumption ==='
                docker stats --no-stream
            \""
            echo -e "--------------------------------------------------------"
            echo
            ;;
        4)
            echo -e "${GREEN}Checking Nginx Server blocks and status...${NC}"
            echo -e "--------------------------------------------------------"
            eval "$SSH_CMD \"
                echo -e '=== Nginx Service Status ==='
                systemctl status nginx --no-pager
                echo ''
                echo -e '=== Nginx Config Test ==='
                nginx -t
                echo ''
                echo -e '=== Recent Reverse Proxy Error Logs ==='
                tail -n 20 /var/log/nginx/error.log
            \""
            echo -e "--------------------------------------------------------"
            echo
            ;;
        5)
            echo -e "${YELLOW}${BOLD}[WARNING] You are about to initiate a rolling container restart.${NC}"
            echo -ne "Are you sure you want to proceed? (y/N): "
            read -r confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}Executing safe rolling restart...${NC}"
                eval "$SSH_CMD \"
                    cd /opt/tracker
                    echo 'Re-pulling docker containers if newer...'
                    docker compose -f $PROD_COMPOSE restart web api
                    echo 'Container restart sequence triggered successfully.'
                \""
                echo -e "${GREEN}Restart complete.${NC}"
            else
                echo -e "${BLUE}Restart cancelled.${NC}"
            fi
            echo
            ;;
        6)
            echo -e "${BOLD}${CYAN}Exiting Gateway. Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid selection. Please input a number from 1 to 6.${NC}"
            echo
            ;;
    esac
done
