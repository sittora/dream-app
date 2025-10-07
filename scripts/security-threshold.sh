#!/usr/bin/env sh
# Fail (exit 1) if any security findings present.
set -eu
JSON=$(sh scripts/security-summary.sh --json 2>/dev/null || echo '{}')
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found, cannot enforce threshold; allowing pass." >&2
  exit 0
fi
GITLEAKS=$(echo "$JSON" | jq -r '.gitleaksTotal // 0')
CODEQL=$(echo "$JSON" | jq -r '.codeql.total // 0')
if [ "$GITLEAKS" -gt 0 ] || [ "$CODEQL" -gt 0 ]; then
  echo "Security threshold failed: gitleaks=$GITLEAKS codeql=$CODEQL (expected 0)" >&2
  exit 1
fi
echo "Security threshold passed (no findings)."
exit 0
