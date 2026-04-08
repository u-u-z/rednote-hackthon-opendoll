#!/usr/bin/env bash
# ============================================================
# opendoll-backend — Remote container restart script
# Run this on the server after updating .env to restart the container
#
# Usage (on server):
#   /opt/opendoll-backend/restart.sh
#
# Automatically transferred to server by deploy.sh
# ============================================================

set -euo pipefail

# -------------------- Config --------------------
CONTAINER_NAME="opendoll-backend"
IMAGE_NAME="opendoll-backend"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${APP_DIR}/.env"

# -------------------- Colors --------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# -------------------- Preflight --------------------
echo -e "\n${GREEN}====== opendoll-backend restart ======${NC}\n"

info "App directory: ${APP_DIR}"

if [ ! -f "$ENV_FILE" ]; then
  error "${ENV_FILE} not found — create an env file first"
fi
ok ".env file exists: ${ENV_FILE}"

set -a
source "$ENV_FILE"
set +a

APP_PORT="${PORT:-3001}"
info "App port: ${APP_PORT}"

if ! docker image inspect "${IMAGE_NAME}:latest" &> /dev/null; then
  error "Image ${IMAGE_NAME}:latest not found — run deploy.sh first"
fi

IMAGE_ID=$(docker image inspect "${IMAGE_NAME}:latest" --format '{{.Id}}' | cut -c 8-19)
IMAGE_CREATED=$(docker image inspect "${IMAGE_NAME}:latest" --format '{{.Created}}' | cut -c 1-19)
info "Current image: ${IMAGE_NAME}:latest (${IMAGE_ID}, created ${IMAGE_CREATED})"

# -------------------- Stop old container --------------------
info "Stopping old container..."
if docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker stop "${CONTAINER_NAME}" 2>/dev/null || true
  docker rm "${CONTAINER_NAME}" 2>/dev/null || true
  ok "Old container stopped and removed"
else
  docker rm "${CONTAINER_NAME}" 2>/dev/null || true
  info "No running container to stop"
fi

# -------------------- Start new container --------------------
info "Starting new container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p ${APP_PORT}:${APP_PORT} \
  -v "${APP_DIR}/data:/app/data" \
  --env-file "${ENV_FILE}" \
  "${IMAGE_NAME}:latest"

ok "Container started"

# -------------------- Health check --------------------
info "Waiting for app to start (5s)..."
sleep 5

CONTAINER_STATUS=$(docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Status}}' 2>/dev/null || echo "")
if [ -n "$CONTAINER_STATUS" ]; then
  ok "Container running: $CONTAINER_STATUS"
else
  error "Container is not running! Check logs: docker logs ${CONTAINER_NAME}"
fi

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${APP_PORT}/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  ok "App responding (HTTP ${HTTP_CODE})"
else
  warn "App returned HTTP ${HTTP_CODE} — may still be starting up"
  info "View logs: docker logs -f ${CONTAINER_NAME}"
fi

# -------------------- Done --------------------
echo ""
echo -e "${GREEN}====== Restart complete ======${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f ${CONTAINER_NAME}"
echo "  Status:       docker ps | grep ${CONTAINER_NAME}"
echo "  Edit env:     vim ${ENV_FILE}"
echo "  Restart again: ${APP_DIR}/restart.sh"
