#!/usr/bin/env sh
# Append a JSONL snapshot of current security summary to reports/security-trend.jsonl
# Keeps only last 50 entries. Always exits 0.

set -eu
REPORT_DIR="reports"
SUMMARY_SCRIPT="scripts/security-summary.sh"
TREND_FILE="$REPORT_DIR/security-trend.jsonl"
mkdir -p "$REPORT_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; skipping trend generation." >&2
  exit 0
fi

if [ ! -x "$SUMMARY_SCRIPT" ]; then
  echo "security-summary script not executable" >&2
  exit 0
fi

RAW=$($SUMMARY_SCRIPT --json 2>/dev/null || echo '{}')
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Compose record
REC=$(echo "$RAW" | jq --arg ts "$TS" --arg br "$BRANCH" '.timestamp=$ts | .branch=$br')

# Append
echo "$REC" >> "$TREND_FILE"

# Trim to last 50 lines
TMP="$TREND_FILE.tmp"
tail -n 50 "$TREND_FILE" > "$TMP" 2>/dev/null || true
mv "$TMP" "$TREND_FILE" 2>/dev/null || true

# Echo last record for convenience
echo "$REC"

exit 0
