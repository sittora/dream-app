#!/usr/bin/env bash
set -euo pipefail

# Prevent committing likely secrets. Meant to be run as a pre-commit hook.
# It scans staged files (git index) for filenames and content patterns that
# often indicate secret material and exits non-zero if any are found.

GIT_STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM || true)

if [ -z "$GIT_STAGED_FILES" ]; then
  # nothing staged -> nothing to check
  exit 0
fi

FAIL=0

echo "[prevent-secrets] scanning staged files..."

# Filename globs to block
blocked_names=(
  ".env"
  ".env.*"
  "*.pem"
  "*.key"
  "*.crt"
  "*.p12"
  "*.pfx"
  "*.sqlite"
  "*.db"
  "test-keys"
  "keys/"
  "auth-keys"
  "jwt-keys"
  "secrets"
)

for f in $GIT_STAGED_FILES; do
  for pattern in "${blocked_names[@]}"; do
    case "$f" in
      $pattern)
        echo "[prevent-secrets] blocked filename staged: $f" >&2
        FAIL=1
        ;;
      */$pattern)
        echo "[prevent-secrets] blocked filename staged: $f" >&2
        FAIL=1
        ;;
    esac
  done
done

if [ "$FAIL" -eq 1 ]; then
  echo "\n[prevent-secrets] Abort: remove or move sensitive files before committing." >&2
  exit 1
fi

# Content patterns to search for in staged files. Use git grep on staged content.
declare -a content_patterns=(
  "-----BEGIN RSA PRIVATE KEY-----"
  "-----BEGIN PRIVATE KEY-----"
  "OPENAI_API_KEY"
  "VITE_OPENAI_API_KEY"
  "NUMINOS_HOST_API_KEY"
  "JWT_SECRET"
  "SECRET_KEY"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_ACCESS_KEY_ID"
  "PRIVATE KEY"
  "BEGIN PRIVATE KEY"
  "PASSWORD="
  "password:"
  "api_key"
  "apiKey"
  "token:"
)

for pat in "${content_patterns[@]}"; do
  # Search in staged content using git grep against the index
  if git grep -I --cached -n -- "${pat}" >/dev/null 2>&1; then
    echo "[prevent-secrets] possible secret pattern found in staged files: ${pat}" >&2
    git grep -I --cached -n -- "${pat}" || true
    FAIL=1
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo "\n[prevent-secrets] Abort: please remove secrets from staged files, rotate keys if leaked, and add them to .gitignore." >&2
  exit 1
fi

echo "[prevent-secrets] no obvious secrets detected in staged changes."
exit 0
