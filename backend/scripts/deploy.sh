#!/usr/bin/env bash
# ============================================================
# opendoll-backend — Local one-click deploy script
# Builds a Docker image locally and deploys to a remote server
#
# Usage:
#   ./scripts/deploy.sh              # Normal deploy
#   ./scripts/deploy.sh --dry-run    # Print commands without executing
#
# Environment variables (configured in .env):
#   DEPLOY_HOST  - Remote server address
#   DEPLOY_USER  - SSH username (default: root)
#   DEPLOY_DIR   - Remote deploy directory (default: /opt/opendoll-backend)
#   DEPLOY_PORT  - SSH port (default: 22)
# ============================================================

set -euo pipefail

# -------------------- Config --------------------
CONTAINER_NAME="opendoll-backend"
IMAGE_NAME="opendoll-backend"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCAL_ENV_FILE="${PROJECT_DIR}/.env"

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
step()  { echo -e "\n${GREEN}========== $* ==========${NC}\n"; }

# -------------------- Args --------------------
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) warn "Unknown argument: $arg" ;;
  esac
done

run() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $*"
  else
    eval "$@"
  fi
}

# -------------------- Preflight --------------------
step "Step 0/7: Preflight checks"

cd "$PROJECT_DIR"
info "Project directory: $PROJECT_DIR"

if [ ! -f "$LOCAL_ENV_FILE" ]; then
  error ".env file not found — create one first (see .env.example)"
fi
ok ".env file exists"

set -a
source "$LOCAL_ENV_FILE"
set +a

DEPLOY_HOST="${DEPLOY_HOST:?Missing DEPLOY_HOST in .env}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/opendoll-backend}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
SERVER="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH_OPTS="-o StrictHostKeyChecking=accept-new -p ${DEPLOY_PORT}"
SERVER_ENV_PATH="${DEPLOY_DIR}/.env"

info "Target server: ${SERVER}"
info "Deploy dir:    ${DEPLOY_DIR}"
info "SSH port:      ${DEPLOY_PORT}"

if ! command -v docker &> /dev/null; then
  error "Docker is not installed"
fi
ok "Docker installed"

info "Checking SSH connectivity to $SERVER ..."
if [ "$DRY_RUN" = false ]; then
  if ! ssh $SSH_OPTS -o ConnectTimeout=5 "$SERVER" "echo ok" &> /dev/null; then
    error "Cannot connect to $SERVER — check your SSH config"
  fi
  ok "SSH connection OK"
else
  echo -e "${YELLOW}[DRY-RUN]${NC} ssh $SSH_OPTS -o ConnectTimeout=5 $SERVER \"echo ok\""
fi

# -------------------- Version --------------------
step "Step 1/7: Resolve version"

VERSION=$(node -p "require('./package.json').version")
info "package.json version: $VERSION"

if docker image inspect "${IMAGE_NAME}:${VERSION}" &> /dev/null; then
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  TAG="${VERSION}-${TIMESTAMP}"
  warn "Image ${IMAGE_NAME}:${VERSION} already exists, using timestamped tag: $TAG"
else
  TAG="$VERSION"
fi

info "Final image tag: ${IMAGE_NAME}:${TAG}"
info "Also tagged as:  ${IMAGE_NAME}:latest"

# -------------------- Env vars --------------------
step "Step 2/7: Verify environment variables"

if [ -z "${GEMINI_API_KEY:-}" ]; then
  warn "GEMINI_API_KEY is not set"
else
  ok "GEMINI_API_KEY is set"
fi

APP_PORT="${PORT:-3001}"

info "PORT=${APP_PORT}"
info "GEMINI_IMAGE_MODEL=${GEMINI_IMAGE_MODEL:-(not set)}"
info "OPENAI_BASE_URL=${OPENAI_BASE_URL:-(not set)}"

# -------------------- Build --------------------
step "Step 3/7: Build Docker image (linux/amd64)"

info "Starting build — this may take a few minutes..."
BUILD_CMD="docker buildx build --platform linux/amd64 \
  --load \
  -t ${IMAGE_NAME}:latest \
  ."

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} docker buildx build --platform linux/amd64 --load -t ${IMAGE_NAME}:latest ."
else
  eval "$BUILD_CMD"
fi

run "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${TAG}"
ok "Image built: ${IMAGE_NAME}:${TAG} / ${IMAGE_NAME}:latest"

# -------------------- Transfer --------------------
step "Step 4/7: Export and transfer image to server"

TARBALL="/tmp/${IMAGE_NAME}.tar.gz"

info "Exporting image to $TARBALL ..."
run "docker save ${IMAGE_NAME}:latest | gzip > ${TARBALL}"

if [ "$DRY_RUN" = false ]; then
  TARBALL_SIZE=$(du -h "$TARBALL" | cut -f1)
  info "Image tarball size: $TARBALL_SIZE"
fi

info "Transferring image to $SERVER:/tmp/ ..."
run "scp -P ${DEPLOY_PORT} ${TARBALL} ${SERVER}:/tmp/"

info "Loading image on server..."
run "ssh ${SSH_OPTS} ${SERVER} \"docker load < /tmp/${IMAGE_NAME}.tar.gz\""

run "ssh ${SSH_OPTS} ${SERVER} \"docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${TAG}\""
ok "Server image loaded"

# -------------------- Config files --------------------
step "Step 5/7: Transfer config files to server"

run "ssh ${SSH_OPTS} ${SERVER} \"mkdir -p ${DEPLOY_DIR}/data/images && chown -R 1001:1001 ${DEPLOY_DIR}/data\""

info "Uploading .env to ${SERVER}:${SERVER_ENV_PATH} (DEPLOY_* vars filtered out)..."
FILTERED_ENV="/tmp/.env.opendoll-deploy"
grep -v '^DEPLOY_' "$LOCAL_ENV_FILE" | grep -v '^#.*Deploy' | sed '/^$/N;/^\n$/d' > "$FILTERED_ENV"
run "scp -P ${DEPLOY_PORT} ${FILTERED_ENV} ${SERVER}:${SERVER_ENV_PATH}"
rm -f "$FILTERED_ENV"
ok ".env uploaded"

RESTART_SCRIPT="${SCRIPT_DIR}/server-restart.sh"
if [ -f "$RESTART_SCRIPT" ]; then
  info "Uploading restart script to ${SERVER}:${DEPLOY_DIR}/restart.sh ..."
  run "scp -P ${DEPLOY_PORT} ${RESTART_SCRIPT} ${SERVER}:${DEPLOY_DIR}/restart.sh"
  run "ssh ${SSH_OPTS} ${SERVER} \"chmod +x ${DEPLOY_DIR}/restart.sh\""
  ok "Restart script uploaded"
else
  warn "Restart script not found at ${RESTART_SCRIPT}, skipping"
fi

# -------------------- Deploy --------------------
step "Step 6/7: Deploy container"

info "Stopping and removing old container (if any)..."
run "ssh ${SSH_OPTS} ${SERVER} \"docker stop ${CONTAINER_NAME} 2>/dev/null || true\""
run "ssh ${SSH_OPTS} ${SERVER} \"docker rm ${CONTAINER_NAME} 2>/dev/null || true\""

info "Starting new container..."
run "ssh ${SSH_OPTS} ${SERVER} \"docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${APP_PORT}:${APP_PORT} \
  -v ${DEPLOY_DIR}/data:/app/data \
  --env-file ${SERVER_ENV_PATH} \
  ${IMAGE_NAME}:latest\""

ok "Container started"

# -------------------- Verify --------------------
step "Step 7/7: Verify deployment"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} Skipping verification"
else
  info "Waiting for container to start (5s)..."
  sleep 5

  info "Checking container status..."
  CONTAINER_STATUS=$(ssh $SSH_OPTS "$SERVER" "docker ps --filter name=${CONTAINER_NAME} --format '{{.Status}}'" 2>/dev/null || echo "")
  if [ -n "$CONTAINER_STATUS" ]; then
    ok "Container running: $CONTAINER_STATUS"
  else
    error "Container is not running — check logs: ssh ${SSH_OPTS} ${SERVER} \"docker logs ${CONTAINER_NAME}\""
  fi

  info "Checking health endpoint..."
  HTTP_CHECK=$(ssh $SSH_OPTS "$SERVER" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${APP_PORT}/api/health" 2>/dev/null || echo "000")
  if [ "$HTTP_CHECK" = "200" ]; then
    ok "App responding (HTTP $HTTP_CHECK)"
  else
    warn "App returned HTTP $HTTP_CHECK — may still be starting up"
  fi
fi

# -------------------- Cleanup --------------------
if [ "$DRY_RUN" = false ] && [ -f "$TARBALL" ]; then
  rm -f "$TARBALL"
  info "Cleaned up local tarball: $TARBALL"
fi

# -------------------- Done --------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Deploy complete!${NC}"
echo -e "${GREEN} Image:  ${IMAGE_NAME}:${TAG}${NC}"
echo -e "${GREEN} Server: ${SERVER}${NC}"
echo -e "${GREEN} Dir:    ${DEPLOY_DIR}${NC}"
echo -e "${GREEN} Port:   ${APP_PORT}${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Hints:"
echo "  View logs:      ssh ${SSH_OPTS} ${SERVER} \"docker logs -f ${CONTAINER_NAME}\""
echo "  Restart:        ssh ${SSH_OPTS} ${SERVER} \"${DEPLOY_DIR}/restart.sh\""
echo "  Stop container: ssh ${SSH_OPTS} ${SERVER} \"docker stop ${CONTAINER_NAME}\""
