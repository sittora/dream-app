#!/usr/bin/env sh
# Post a webhook (e.g., Slack) notification if security findings > 0.
set -eu
SUMMARY_JSON=$(sh scripts/security-summary.sh --json 2>/dev/null || echo '{}')
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; skipping notification." >&2
  exit 0
fi
GITLEAKS=$(echo "$SUMMARY_JSON" | jq -r '.gitleaksTotal // 0')
CODEQL_TOTAL=$(echo "$SUMMARY_JSON" | jq -r '.codeql.total // 0')
ERR=$(echo "$SUMMARY_JSON" | jq -r '.codeql.error // 0')
WARN=$(echo "$SUMMARY_JSON" | jq -r '.codeql.warning // 0')
NOTE=$(echo "$SUMMARY_JSON" | jq -r '.codeql.note // 0')
[ -z "${SECURITY_WEBHOOK:-}" ] && exit 0
if [ "$GITLEAKS" -eq 0 ] && [ "$CODEQL_TOTAL" -eq 0 ]; then
  exit 0
fi
RUN_URL=${GITHUB_RUN_URL:-""}
REPO=${GITHUB_REPOSITORY:-""}
BRANCH=${GITHUB_REF_NAME:-""}
MSG=$(printf 'Security findings detected in %s@%s\nRun: %s\nGitleaks: %s\nCodeQL: %s (error:%s, warn:%s, note:%s)' "$REPO" "$BRANCH" "$RUN_URL" "$GITLEAKS" "$CODEQL_TOTAL" "$ERR" "$WARN" "$NOTE")
payload=$(printf '{"text":"%s"}' "$(printf '%s' "$MSG" | sed 's/"/\\"/g')")
if command -v curl >/dev/null 2>&1; then
  curl -fsS -X POST -H 'Content-Type: application/json' -d "$payload" "$SECURITY_WEBHOOK" || echo "Webhook post failed" >&2
fi
exit 0
