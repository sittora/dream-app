#!/usr/bin/env sh
# Aggregate local security scan artifacts (Gitleaks + CodeQL) and print a concise summary.
# Read-only: expects artifacts in ./reports produced by other fetch scripts.
# Always exits 0.

set -eu
MODE="text"
if [ "${1:-}" = "--json" ]; then
  MODE="json"
fi
REPORT_DIR="reports"
[ -d "$REPORT_DIR" ] || mkdir -p "$REPORT_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found. Install jq to use security summary (brew install jq)." >&2
  exit 0
fi

GITLEAKS_TOTAL=0
# Sum counts from each gitleaks JSON file (array or object with findings)
for f in "$REPORT_DIR"/gitleaks-*.json; do
  [ -f "$f" ] || continue
  if jq -e 'type=="array"' "$f" >/dev/null 2>&1; then
    c=$(jq 'length' "$f") || c=0
  else
    c=$(jq '.findings // [] | length' "$f") || c=0
  fi
  GITLEAKS_TOTAL=$((GITLEAKS_TOTAL + c))
done

CODEQL_TOTAL=0
CODEQL_ERR=0
CODEQL_WARN=0
CODEQL_NOTE=0

# Process SARIF files
for s in "$REPORT_DIR"/codeql-*.sarif; do
  [ -f "$s" ] || continue
  # Total results per file
  t=$(jq '[.runs[]? | (.results // []) | length] | add // 0' "$s" 2>/dev/null || echo 0)
  CODEQL_TOTAL=$((CODEQL_TOTAL + t))
  # Severity counts per file
  err=$(jq '[.runs[]? | (.results // [])[]? | select(.level=="error")] | length' "$s" 2>/dev/null || echo 0)
  warn=$(jq '[.runs[]? | (.results // [])[]? | select(.level=="warning")] | length' "$s" 2>/dev/null || echo 0)
  note=$(jq '[.runs[]? | (.results // [])[]? | select(.level=="note")] | length' "$s" 2>/dev/null || echo 0)
  CODEQL_ERR=$((CODEQL_ERR + err))
  CODEQL_WARN=$((CODEQL_WARN + warn))
  CODEQL_NOTE=$((CODEQL_NOTE + note))
done

if [ "$MODE" = "json" ]; then
  jq -n --argjson g "$GITLEAKS_TOTAL" --argjson ct "$CODEQL_TOTAL" --argjson ce "$CODEQL_ERR" --argjson cw "$CODEQL_WARN" --argjson cn "$CODEQL_NOTE" '{gitleaksTotal:$g, codeql:{total:$ct, error:$ce, warning:$cw, note:$cn}}'
  exit 0
else
  cat <<EOF
Security Summary
- Gitleaks: ${GITLEAKS_TOTAL}
- CodeQL:  ${CODEQL_TOTAL} (error: ${CODEQL_ERR}, warning: ${CODEQL_WARN}, note: ${CODEQL_NOTE})
EOF
  if [ $((GITLEAKS_TOTAL + CODEQL_TOTAL)) -gt 0 ]; then
    echo "Hint: Run \`npm run artifacts:gitleaks\` and/or \`npm run codeql:artifacts\` to fetch latest and investigate." >&2
  fi
  exit 0
fi
