#!/usr/bin/env bash
set -euo pipefail
# Wrapper to run gitleaks from local install, npx, Docker image, or global if available.
# Usage: scripts/run-gitleaks.sh <args passthrough>

echo "[run-gitleaks] Starting gitleaks wrapper..." >&2

# Prefer local binary if present
if command -v gitleaks >/dev/null 2>&1; then
  echo "[run-gitleaks] Using gitleaks from PATH" >&2
  exec gitleaks "$@"
fi

# Try docker image if docker available
if command -v docker >/dev/null 2>&1; then
  echo "[run-gitleaks] Using docker image ghcr.io/gitleaks/gitleaks:latest" >&2
  exec docker run --rm -v "$(pwd):/workspace" -w /workspace ghcr.io/gitleaks/gitleaks:latest "$@"
fi

# Attempt lightweight self-contained download (Darwin arm64 & amd64 only) if curl available
GITLEAKS_VERSION="8.18.4"
ARCH=$(uname -m)
OS=$(uname | tr '[:upper:]' '[:lower:]')
if command -v curl >/dev/null 2>&1; then
  case "$OS" in
    darwin)
      case "$ARCH" in
        arm64) PLATFORM="darwin_arm64" ;;
        x86_64) PLATFORM="darwin_x64" ;;
        *) PLATFORM="" ;;
      esac
      ;;
    linux)
      case "$ARCH" in
        arm64|aarch64) PLATFORM="linux_arm64" ;;
        x86_64) PLATFORM="linux_x64" ;;
        *) PLATFORM="" ;;
      esac
      ;;
    *) PLATFORM="" ;;
  esac

  if [ -n "${PLATFORM}" ]; then
    TMP_TAR="/tmp/gitleaks_${GITLEAKS_VERSION}_${PLATFORM}.tar.gz"
    URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${PLATFORM}.tar.gz"
    echo "[run-gitleaks] Downloading gitleaks ${GITLEAKS_VERSION} for ${PLATFORM}..." >&2
    if curl -fsSL -o "$TMP_TAR" "$URL"; then
      mkdir -p .bin
      tar -xzf "$TMP_TAR" -C .bin gitleaks || true
      if [ -x .bin/gitleaks ]; then
        echo "[run-gitleaks] Download complete. Using local .bin/gitleaks" >&2
        exec ./.bin/gitleaks "$@"
      fi
    else
      echo "[run-gitleaks] Download failed from $URL" >&2
    fi
  fi
fi

echo "gitleaks binary not found (no local, npx, or docker). Install with: brew install gitleaks" >&2
exit 127
