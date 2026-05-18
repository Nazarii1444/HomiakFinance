#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Blue-Green deployment script for HomiakFinance backend
#
# Usage:
#   APP_VERSION=v1.2.3 ./scripts/deploy.sh
#
# Environment variables:
#   APP_VERSION   — Docker image tag / version to deploy (default: latest)
#   HEALTH_RETRIES — Number of health check retries (default: 10)
#   HEALTH_INTERVAL — Seconds between retries (default: 6)
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLOT_FILE="${REPO_ROOT}/.active_slot"
APP_VERSION="${APP_VERSION:-latest}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_INTERVAL="${HEALTH_INTERVAL:-6}"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEPLOY]  $*"; }
error(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]   $*" >&2; }

# ── 1. Determine current active slot ─────────────────────────────────────────
if [[ -f "$SLOT_FILE" ]]; then
  ACTIVE=$(cat "$SLOT_FILE")
else
  ACTIVE="blue"
  echo "blue" > "$SLOT_FILE"
fi

if [[ "$ACTIVE" == "blue" ]]; then
  NEW_SLOT="green"
  NEW_PORT="8002"
else
  NEW_SLOT="blue"
  NEW_PORT="8001"
fi

log "Active slot: ${ACTIVE}  →  deploying to: ${NEW_SLOT} (port ${NEW_PORT})"

# ── 2. Ensure shared Docker network exists ────────────────────────────────────
docker network inspect homiak-net &>/dev/null || \
  docker network create homiak-net
log "Docker network homiak-net ready"

# ── 3. Build new image ────────────────────────────────────────────────────────
log "Building image homiak-backend:${APP_VERSION} ..."
docker build \
  --target runtime \
  --tag "homiak-backend:${APP_VERSION}" \
  "${REPO_ROOT}/backend"

# ── 4. Start new (inactive) slot ─────────────────────────────────────────────
log "Starting ${NEW_SLOT} slot ..."
APP_VERSION="${APP_VERSION}" \
  docker compose \
    -f "${REPO_ROOT}/docker-compose.${NEW_SLOT}.yml" \
    up -d --build

# ── 5. Health-check new slot ──────────────────────────────────────────────────
log "Waiting for ${NEW_SLOT} to become healthy on port ${NEW_PORT} ..."
HEALTHY=false
for i in $(seq 1 "$HEALTH_RETRIES"); do
  RESPONSE=$(curl -sf "http://localhost:${NEW_PORT}/health/" 2>/dev/null || true)
  STATUS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || true)

  if [[ "$STATUS" == "ok" ]]; then
    log "Health check passed (attempt ${i}/${HEALTH_RETRIES})"
    HEALTHY=true
    break
  fi

  log "Attempt ${i}/${HEALTH_RETRIES}: status='${STATUS}' — retrying in ${HEALTH_INTERVAL}s ..."
  sleep "$HEALTH_INTERVAL"
done

if [[ "$HEALTHY" != "true" ]]; then
  error "Health check FAILED after ${HEALTH_RETRIES} attempts."
  error "Rolling back — keeping ${ACTIVE} slot active."
  docker compose -f "${REPO_ROOT}/docker-compose.${NEW_SLOT}.yml" down
  exit 1
fi

# ── 6. Switch Nginx to new slot ───────────────────────────────────────────────
log "Switching Nginx to ${NEW_SLOT} ..."
cp "${REPO_ROOT}/nginx/nginx.${NEW_SLOT}.conf" "${REPO_ROOT}/nginx/nginx.conf"

# Start nginx if not running, otherwise reload
if docker ps --format '{{.Names}}' | grep -q "homiak-nginx"; then
  docker exec homiak-nginx nginx -s reload
  log "Nginx reloaded → now serving ${NEW_SLOT}"
else
  APP_VERSION="${APP_VERSION}" \
    docker compose -f "${REPO_ROOT}/docker-compose.nginx.yml" up -d
  log "Nginx started → serving ${NEW_SLOT}"
fi

# ── 7. Verify traffic through Nginx (port 8000) ───────────────────────────────
sleep 3
NGINX_RESP=$(curl -sf "http://localhost:8000/health/" 2>/dev/null || true)
NGINX_STATUS=$(echo "$NGINX_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || true)
if [[ "$NGINX_STATUS" != "ok" ]]; then
  error "Traffic verification through Nginx FAILED. Initiating rollback ..."
  "${REPO_ROOT}/scripts/rollback.sh" "nginx-verify-failed"
  exit 1
fi
log "Traffic verified through Nginx ✓"

# ── 8. Stop old slot ──────────────────────────────────────────────────────────
log "Stopping old ${ACTIVE} slot ..."
docker compose -f "${REPO_ROOT}/docker-compose.${ACTIVE}.yml" down || true

# ── 9. Save new active slot ───────────────────────────────────────────────────
echo "$NEW_SLOT" > "$SLOT_FILE"
log "Deployment complete ✓  Active slot: ${NEW_SLOT}  Version: ${APP_VERSION}"

