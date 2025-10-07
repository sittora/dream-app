#!/usr/bin/env sh
# Generate an HTML security report combining Gitleaks and CodeQL artifacts.
set -eu
REPORT_DIR="reports"
mkdir -p "$REPORT_DIR"
OUT="$REPORT_DIR/security.html"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq required to generate HTML report" >&2
  exit 0
fi

SUMMARY_JSON=$(sh scripts/security-summary.sh --json 2>/dev/null || echo '{}')
GITLEAKS_TOTAL=$(echo "$SUMMARY_JSON" | jq -r '.gitleaksTotal // 0')
CODEQL_TOTAL=$(echo "$SUMMARY_JSON" | jq -r '.codeql.total // 0')
C_ERR=$(echo "$SUMMARY_JSON" | jq -r '.codeql.error // 0')
C_WARN=$(echo "$SUMMARY_JSON" | jq -r '.codeql.warning // 0')
C_NOTE=$(echo "$SUMMARY_JSON" | jq -r '.codeql.note // 0')

# Build top tables
# Gitleaks top 10 rules across all gitleaks JSON files
GITLEAKS_TOP=$(jq -n '[]' )
for f in "$REPORT_DIR"/gitleaks-*.json; do
  [ -f "$f" ] || continue
  if jq -e 'type=="array"' "$f" >/dev/null 2>&1; then
    jq -r '.[] | @base64' "$f" | while read -r row; do
      echo "$row" | base64 -d
    done | jq -s '.' > "$f.tmp" || true
  else
    jq -r '.findings // [] | .[] | @base64' "$f" | while read -r row; do
      echo "$row" | base64 -d
    done | jq -s '.' > "$f.tmp" || true
  fi
  if [ -s "$f.tmp" ]; then
    # Merge existing aggregated array with new findings array
    OLD_TMP=$(mktemp 2>/dev/null || echo "/tmp/gitleaks_old_$$")
    echo "$GITLEAKS_TOP" > "$OLD_TMP"
    GITLEAKS_TOP=$(jq -s '.[0] + .[1]' "$OLD_TMP" "$f.tmp" 2>/dev/null || echo '[]')
    rm -f "$OLD_TMP" || true
  fi
  rm -f "$f.tmp" || true
done

GITLEAKS_RULE_TABLE=$(echo "$GITLEAKS_TOP" | jq -r 'group_by(.RuleID) | map({rule: .[0].RuleID, count: length}) | sort_by(-.count) | .[:10] | map("<tr><td>" + (.rule//"-") + "</td><td>" + (.count|tostring) + "</td></tr>") | join("\n")' 2>/dev/null || echo '')

# CodeQL aggregation
CODEQL_TOP=""
TMP_SARIF=$(mktemp 2>/dev/null || echo "/tmp/security_sarif_$$")
# Merge all runs
jq 'reduce inputs as $d ({runs: []}; .runs += ($d.runs // []))' $REPORT_DIR/codeql-*.sarif 2>/dev/null > "$TMP_SARIF" || true
if [ -s "$TMP_SARIF" ]; then
  CODEQL_RULE_TABLE=$(jq -r '[.runs[]? .results[]?] | group_by(.ruleId) | map({rule: .[0].ruleId, count: length}) | sort_by(-.count) | .[:10] | map("<tr><td>" + (.rule//"-") + "</td><td>" + (.count|tostring) + "</td></tr>") | join("\n")' "$TMP_SARIF" 2>/dev/null || echo '')
else
  CODEQL_RULE_TABLE=""
fi
rm -f "$TMP_SARIF" || true

cat > "$OUT" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Security Report</title>
<style>
 body { font-family: Arial, sans-serif; margin: 1.5rem; background: #f9fafb; color: #222; }
 h1 { margin-top: 0; }
 h2 { border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; }
 table { border-collapse: collapse; width: 50%; min-width: 320px; margin-bottom: 1.5rem; }
 th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
 th { background: #f0f0f0; }
 .counts { font-family: monospace; }
 .zero { color: #2d7a2d; }
 .warn { color: #b58900; }
 .err { color: #c0392b; }
 footer { margin-top: 2rem; font-size: 0.85rem; color: #555; }
</style>
</head>
<body>
<h1>Security Report</h1>
<section>
  <h2>Summary</h2>
  <p class="counts">Gitleaks: <strong class="${GITLEAKS_TOTAL:-0} zero">$GITLEAKS_TOTAL</strong><br />
  CodeQL: <strong class="counts">$CODEQL_TOTAL</strong> (error: <span class="err">$C_ERR</span>, warning: <span class="warn">$C_WARN</span>, note: $C_NOTE)</p>
</section>
<section>
  <h2>Gitleaks Top Rules</h2>
  <table>
    <thead><tr><th>RuleID</th><th>Count</th></tr></thead>
    <tbody>
      ${GITLEAKS_RULE_TABLE:-"<tr><td colspan=2>No data</td></tr>"}
    </tbody>
  </table>
</section>
<section>
  <h2>CodeQL Top Rules</h2>
  <table>
    <thead><tr><th>RuleID</th><th>Count</th></tr></thead>
    <tbody>
      ${CODEQL_RULE_TABLE:-"<tr><td colspan=2>No data</td></tr>"}
    </tbody>
  </table>
</section>
<footer>Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) UTC</footer>
</body>
</html>
HTML

echo "Wrote $OUT"
exit 0
