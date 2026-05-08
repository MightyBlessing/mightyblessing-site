#!/usr/bin/env bash

set -euo pipefail

KEY_PATH="${1:-${LIGHTSAIL_KEY_PATH:-}}"
HOST="${2:-${LIGHTSAIL_HOST:-15.165.62.46}}"
USER_NAME="${LIGHTSAIL_USER:-ubuntu}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/srv/mb-site}"
REMOTE_BRANCH="${REMOTE_BRANCH:-main}"
REMOTE_ECOSYSTEM_PATH="${REMOTE_ECOSYSTEM_PATH:-deploy/lightsail/pm2/mb-site.ecosystem.config.cjs}"

if [[ -z "${KEY_PATH}" ]]; then
  echo "Usage: $0 <pem-path> [host]" >&2
  echo "Example: $0 ~/.ssh/lightsail-mbweb.pem 15.165.62.46" >&2
  exit 1
fi

if [[ ! -f "${KEY_PATH}" ]]; then
  echo "PEM file not found: ${KEY_PATH}" >&2
  exit 1
fi

chmod 400 "${KEY_PATH}"

ssh \
  -o BatchMode=yes \
  -o StrictHostKeyChecking=accept-new \
  -i "${KEY_PATH}" \
  "${USER_NAME}@${HOST}" \
  "REMOTE_APP_DIR='${REMOTE_APP_DIR}' REMOTE_BRANCH='${REMOTE_BRANCH}' REMOTE_ECOSYSTEM_PATH='${REMOTE_ECOSYSTEM_PATH}' bash -s" <<'REMOTE'
set -euo pipefail

cd "${REMOTE_APP_DIR}"

if [[ ! -d .git ]]; then
  echo "Git repository not found in ${REMOTE_APP_DIR}" >&2
  exit 1
fi

git fetch origin
git checkout "${REMOTE_BRANCH}"
git pull --ff-only origin "${REMOTE_BRANCH}"

npm ci
npm run build
pm2 startOrReload "${REMOTE_ECOSYSTEM_PATH}" --update-env
pm2 save

pm2 ls
REMOTE
