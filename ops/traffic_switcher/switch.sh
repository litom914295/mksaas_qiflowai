#!/usr/bin/env bash
set -euo pipefail

NS="${NAMESPACE:-qiflowai}"
ING="${INGRESS_CANARY:-qiflowai-ingress-canary}"
WEIGHT="${WEIGHT:-25}"
URL="${TRAFFIC_SWITCHER_URL:-}"
DRY="${DRY_RUN:-false}"

if [[ -n "$URL" ]]; then
  echo "Switch via API $URL -> weight=$WEIGHT dry_run=$DRY"
  curl -fsS -H 'Content-Type: application/json' \
    -d "{\"canary_weight\":$WEIGHT,\"dry_run\":$DRY}" \
    -X POST "$URL/switch"
else
  if [[ "$DRY" == "true" ]]; then
    echo "DRY_RUN=true; would kubectl -n $NS patch ingress $ING weight=$WEIGHT"
  else
    echo "kubectl patch ingress $ING -> weight=$WEIGHT"
    kubectl -n "$NS" patch ingress "$ING" --type merge -p "{\"metadata\":{\"annotations\":{\"nginx.ingress.kubernetes.io/canary-weight\":\"$WEIGHT\"}}}"
  fi
fi

echo "Done."
