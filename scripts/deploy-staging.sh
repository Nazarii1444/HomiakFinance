#!/usr/bin/env bash
# =============================================================================
# deploy-staging.sh – Deploy to staging environment
#
# Usage:
#   APP_VERSION=sha-abc1234 ./scripts/deploy-staging.sh
#
# Environment variables:
#   APP_VERSION      – Docker image tag / version to deploy (default: staging)
#   HEALTH_RETRIES   – Number of health check retries (default: 10)
#   HEALTH_INTERVAL  – Seconds between retries (default: 6)
#   STAGING_PORT     – Staging port (default: 8080)
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_VERSION="${APP_VERSION:-staging}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_INTERVAL="${HEALTH_INTERVAL:-6}"
STAGING_PORT="${STAGING_PORT:-8080}"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [STAGING]  $*"; }
error(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]    $*" >&2; }

log "Starting staging deploy: version=${APP_VERSION}"

# ── 1. Inject secrets into .env.staging ──────────────────────────────────────
if [[ -n "${STAGING_SECRET_KEY:-}" ]]; then
  sed -i "s/^SECRET_KEY=.*/SECRET_KEY=${STAGING_SECRET_KEY}/" "${REPO_ROOT}/backend/.env.staging"
fi

# ── 2. Build image ────────────────────────────────────────────────────────────
log "Building image homiak-backend:${APP_VERSION} ..."
docker build \
  --target runtime \
  --tag "homiak-backend:${APP_VERSION}" \
  "${REPO_ROOT}/backend"

# ── 3. Stop old staging container ────────────────────────────────────────────
log "Stopping old staging containers ..."
APP_VERSION="${APP_VERSION}" \
  docker compose -f "${REPO_ROOT}/docker-compose.staging.yml" down || true

# ── 4. Start new staging ──────────────────────────────────────────────────────
log "Starting staging on port ${STAGING_PORT} ..."
APP_VERSION="${APP_VERSION}" \
  docker compose -f "${REPO_ROOT}/docker-compose.staging.yml" up -d

# ── 5. Health check ───────────────────────────────────────────────────────────
log "Waiting for staging to become healthy on port ${STAGING_PORT} ..."
HEALTHY=false
for i in $(seq 1 "$HEALTH_RETRIES"); do
  RESPONSE=$(curl -sf "http://localhost:${STAGING_PORT}/health/" 2>/dev/null || true)
  STATUS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || true)

  if [[ "$STATUS" == "ok" ]]; then
    log "Health check passed (attempt ${i}/${HEALTH_RETRIES})"
    HEALTHY=true
    break
  fi

  log "Attempt ${i}/${HEALTH_RETRIES}: status='${STATUS}' – retrying in ${HEALTH_INTERVAL}s ..."
  sleep "$HEALTH_INTERVAL"
done

if [[ "$HEALTHY" != "true" ]]; then
  error "Staging health check FAILED after ${HEALTH_RETRIES} attempts."
  docker compose -f "${REPO_ROOT}/docker-compose.staging.yml" logs --tail=50
  docker compose -f "${REPO_ROOT}/docker-compose.staging.yml" down
  exit 1
fi

log "Staging deploy complete ✓  Version: ${APP_VERSION}  URL: http://localhost:${STAGING_PORT}"

