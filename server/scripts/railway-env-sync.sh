#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

: "${RAILWAY_TOKEN:?Set RAILWAY_TOKEN}"
: "${RAILWAY_PROJECT_ID:?Set RAILWAY_PROJECT_ID}"
: "${RAILWAY_SERVICE_ID:?Set RAILWAY_SERVICE_ID}"

RAILWAY="npx --yes @railway/cli@latest"

set_var() {
  local key="$1"
  local value="$2"
  $RAILWAY variable set "${key}=${value}" --service "$RAILWAY_SERVICE_ID" --skip-deploys --json >/dev/null
  echo "Set ${key}"
}

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  key="$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  value="$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ "$key" == "PORT" ]] && continue
  [[ "$key" == "CLIENT_URL" ]] && continue
  set_var "$key" "$value"
done < .env

set_var "ADMIN_INVITE_CODE" "eldercare-admin-dev"
set_var "CLIENT_URL" "${CLIENT_URL:-https://eldercare.pages.dev}"

echo "Redeploying service..."
$RAILWAY up --service "$RAILWAY_SERVICE_ID" --detach
