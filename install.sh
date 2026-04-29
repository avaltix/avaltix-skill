#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_PARENT="${HOME}/.claude/skills"
TARGET_DIR="${TARGET_PARENT}/avaltix"

mkdir -p "${TARGET_PARENT}"
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"

tar \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='node_modules' \
  --exclude='*.log' \
  -C "${SOURCE_DIR}" -cf - . | tar -C "${TARGET_DIR}" -xf -

if command -v npm >/dev/null 2>&1; then
  (cd "${TARGET_DIR}" && npm run self-test >/dev/null)
fi

echo "[avaltix] OK installed in ${TARGET_DIR}"