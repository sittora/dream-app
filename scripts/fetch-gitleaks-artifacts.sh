#!/usr/bin/env sh
# Fetch latest Gitleaks artifacts for a branch (default: dev) using gh or REST fallback.
# Read-only: downloads artifacts into ./reports and prints per-file + combined totals.
# Always exits 0.

set -eu
BRANCH="${1:-dev}"
REPORT_DIR="reports"
mkdir -p "$REPORT_DIR"

has_gh() { command -v gh >/dev/null 2>&1; }
has_jq() { command -v jq >/dev/null 2>&1; }

if ! has_jq; then
  echo "error: jq is required" >&2
  exit 0
fi

INFO() { printf '%s\n' "$*"; }

ARTIFACT_NAMES="gitleaks-ci-report gitleaks-diff-report gitleaks-history-report"

# Download using gh CLI
 download_with_gh() {
  RUN_ID="$(gh run list --branch "$BRANCH" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"
  [ -n "$RUN_ID" ] || return 1
  for n in $ARTIFACT_NAMES; do
    gh run download "$RUN_ID" -n "$n" -D "$REPORT_DIR" 2>/dev/null || true
  done
  return 0
}

# Download using REST API
 download_with_api() {
  : "${GITHUB_TOKEN:?Set GITHUB_TOKEN for REST API fallback}" || return 1
  : "${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY=owner/repo}" || return 1
  RUN_ID="$(curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/actions/runs?branch=$BRANCH&per_page=1" \
    | jq -r '.workflow_runs[0].id // empty')"
  [ -n "$RUN_ID" ] || return 1
  curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/actions/runs/$RUN_ID/artifacts?per_page=100" \
    | jq -r '.artifacts[] | [.name,.archive_download_url] | @tsv' 2>/dev/null \
    | while IFS="$(printf '\t')" read -r NAME URL; do
        case "$NAME" in
          gitleaks-ci-report|gitleaks-diff-report|gitleaks-history-report)
            curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -L "$URL" -o "$REPORT_DIR/$NAME.zip" 2>/dev/null || true
            if [ -f "$REPORT_DIR/$NAME.zip" ]; then
              unzip -p "$REPORT_DIR/$NAME.zip" > "$REPORT_DIR/$NAME.json" 2>/dev/null || true
              rm -f "$REPORT_DIR/$NAME.zip"
            fi
          ;;
        esac
      done
  return 0
}

if has_gh; then
  download_with_gh || download_with_api || true
else
  download_with_api || true
fi

COMBINED=0
FOUND=0
for n in $ARTIFACT_NAMES; do
  JSON="$REPORT_DIR/$n.json"
  [ -f "$JSON" ] || continue
  echo "--- $n.json"
  if jq -e 'type=="array"' "$JSON" >/dev/null 2>&1; then
    T="$(jq 'length' "$JSON")"
  else
    T="$(jq '.findings // [] | length' "$JSON")"
  fi
  echo "total: $T"
  COMBINED=$((COMBINED + T))
  [ "$T" -gt 0 ] && FOUND=1
 done

echo "Combined total: $COMBINED"
[ "$FOUND" -eq 1 ] && echo "Note: findings detected. Inspect JSON in $REPORT_DIR." || echo "No findings detected."

exit 0
