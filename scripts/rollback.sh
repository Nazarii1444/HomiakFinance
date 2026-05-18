#!/usr/bin/env bash
# =============================================================================
# rollback.sh — Rollback to previous Blue-Green slot
#
# Usage:
#   ./scripts/rollback.sh [reason]
#
# Switches Nginx back to the previously active slot.
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLOT_FILE="${REPO_ROOT}/.active_slot"
REASON="${1:-manual rollback}"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ROLLBACK] $*"; }
error(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]    $*" >&2; }

# ── 1. Read current active slot ───────────────────────────────────────────────
if [[ ! -f "$SLOT_FILE" ]]; then
  error "No .active_slot file found. Cannot determine rollback target."
  exit 1
fi

CURRENT=$(cat "$SLOT_FILE")
if [[ "$CURRENT" == "blue" ]]; then
  PREV_SLOT="green"
  PREV_PORT="8002"
else
  PREV_SLOT="blue"
  PREV_PORT="8001"
fi

log "Reason: ${REASON}"
log "Rolling back: ${CURRENT} → ${PREV_SLOT}"

# ── 2. Check if previous slot is running ─────────────────────────────────────
PREV_HEALTH=$(curl -sf "http://localhost:${PREV_PORT}/health/" 2>/dev/null || true)
PREV_STATUS=$(echo "$PREV_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || true)

if [[ "$PREV_STATUS" != "ok" ]]; then
  log "Previous slot ${PREV_SLOT} is not running. Starting it ..."
  docker compose -f "${REPO_ROOT}/docker-compose.${PREV_SLOT}.yml" up -d

  # Wait for it to become healthy
  for i in $(seq 1 10); do
    sleep 5
    PREV_HEALTH=$(curl -sf "http://localhost:${PREV_PORT}/health/" 2>/dev/null || true)
    PREV_STATUS=$(echo "$PREV_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || true)
    if [[ "$PREV_STATUS" == "ok" ]]; then
      log "${PREV_SLOT} started and healthy ✓"
      break
    fi
  done

  if [[ "$PREV_STATUS" != "ok" ]]; then
    error "Cannot start ${PREV_SLOT} slot. Manual intervention required!"
    exit 1
  fi
fi

# ── 3. Switch Nginx back ──────────────────────────────────────────────────────
log "Switching Nginx back to ${PREV_SLOT} ..."
cp "${REPO_ROOT}/nginx/nginx.${PREV_SLOT}.conf" "${REPO_ROOT}/nginx/nginx.conf"

if docker ps --format '{{.Names}}' | grep -q "homiak-nginx"; then
  docker exec homiak-nginx nginx -s reload
  log "Nginx reloaded → now serving ${PREV_SLOT}"
else
  docker compose -f "${REPO_ROOT}/docker-compose.nginx.yml" up -d
  log "Nginx started → serving ${PREV_SLOT}"
fi

# ── 4. Update slot file ───────────────────────────────────────────────────────
echo "$PREV_SLOT" > "$SLOT_FILE"
log "Rollback complete ✓  Active slot: ${PREV_SLOT}"
log "Don't forget to stop the failed ${CURRENT} slot: docker compose -f docker-compose.${CURRENT}.yml down"

