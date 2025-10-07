#!/usr/bin/env sh
# Fetch latest CodeQL SARIF artifacts for a branch (default: dev) using gh or REST fallback.
# Downloads any matching artifacts (codeql-sarif, codeql, codeql-results) into ./reports
# Extracts *.sarif files, summarizes totals, severities, and top rules.
# Always exits 0 (informational utility).

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

ARTIFACT_PATTERNS="codeql-sarif codeql codeql-results"

# Attempt download via gh
fetch_with_gh() {
  RUN_ID="$(gh run list --branch "$BRANCH" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"
  [ -n "$RUN_ID" ] || return 1
  for name in $ARTIFACT_PATTERNS; do
    gh run download "$RUN_ID" -n "$name" -D "$REPORT_DIR" 2>/dev/null || true
  done
  return 0
}

# Fallback REST API (requires env vars)
fetch_with_api() {
  : "${GITHUB_TOKEN:?Set GITHUB_TOKEN for REST fallback}" || return 1
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
          codeql-sarif|codeql|codeql-results)
            curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -L "$URL" -o "$REPORT_DIR/$NAME.zip" 2>/dev/null || true
            if [ -f "$REPORT_DIR/$NAME.zip" ]; then
              unzip -o -p "$REPORT_DIR/$NAME.zip" > /dev/null 2>&1 || true
              # Extract all SARIF files
              unzip -o "$REPORT_DIR/$NAME.zip" -d "$REPORT_DIR/$NAME" >/dev/null 2>&1 || true
              rm -f "$REPORT_DIR/$NAME.zip"
            fi
          ;;
        esac
      done
  return 0
}

if has_gh; then
  fetch_with_gh || fetch_with_api || true
else
  fetch_with_api || true
fi

# Collect SARIF files (may be inside nested dirs) and copy to normalized names
FOUND_SARIF=0
find "$REPORT_DIR" -maxdepth 3 -type f -name '*.sarif' 2>/dev/null | while read -r sf; do
  base="codeql-$(basename "$sf")"
  cp "$sf" "$REPORT_DIR/$base" 2>/dev/null || true
  FOUND_SARIF=1
done

# Shell subshell prevents updating FOUND_SARIF outside; re-evaluate
if ! ls "$REPORT_DIR"/codeql-*.sarif >/dev/null 2>&1; then
  echo "No SARIF files found (branch: $BRANCH)." >&2
  echo "Totals: 0"
  exit 0
fi

# Aggregate across all SARIF files
# Build a unified SARIF object by concatenating runs arrays
TMP_AGG="$REPORT_DIR/codeql-aggregate.sarif"
# Use jq reduce to merge runs
jq 'reduce inputs as $d ({runs: []}; .runs += ($d.runs // []))' "$REPORT_DIR"/codeql-*.sarif > "$TMP_AGG" 2>/dev/null || true

if [ ! -s "$TMP_AGG" ]; then
  echo "Failed to aggregate SARIF files." >&2
  exit 0
fi

# Compute statistics
jq 'def allResults: [ .runs[]? .results[]? ];
    (allResults) as $r |
    {
      total: ($r | length),
      bySeverity: ($r | group_by(.level) | map({level: .[0].level, count: length}) | sort_by(.level)),
      topRules: ($r | group_by(.ruleId) | map({rule: .[0].ruleId, count: length}) | sort_by(-.count) | .[:10])
    }' "$TMP_AGG" > "$REPORT_DIR/codeql-summary.json" || true

if [ -f "$REPORT_DIR/codeql-summary.json" ]; then
  echo "CodeQL Summary (branch: $BRANCH)"
  jq -r '. as $s | "Total alerts: "+($s.total|tostring) + "\nSeverity counts:"' "$REPORT_DIR/codeql-summary.json"
  jq -r '.bySeverity[]? | "  - " + .level + ": " + (.count|tostring)' "$REPORT_DIR/codeql-summary.json"
  echo "Top rules:"; jq -r '.topRules[]? | "  - " + .rule + ": " + (.count|tostring)' "$REPORT_DIR/codeql-summary.json"
  if [ "$(jq -r '.total' "$REPORT_DIR/codeql-summary.json")" -gt 0 ]; then
    echo "Note: Non-zero findings. Inspect individual SARIF files in $REPORT_DIR." >&2
  else
    echo "All clear (0 findings)."
  fi
else
  echo "No summary generated." >&2
fi

exit 0
