#!/usr/bin/env bash

set -euo pipefail

KEY_PATH="${1:-${LIGHTSAIL_KEY_PATH:-}}"
HOST="${2:-${LIGHTSAIL_HOST:-15.165.62.46}}"
USER_NAME="${LIGHTSAIL_USER:-ubuntu}"

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
  "${USER_NAME}@${HOST}" <<'REMOTE'
set -euo pipefail

echo "== host =="
hostname
uname -a

echo
echo "== node/npm =="
command -v node >/dev/null 2>&1 && node -v || echo "node: not installed"
command -v npm >/dev/null 2>&1 && npm -v || echo "npm: not installed"

echo
echo "== pm2 ls =="
command -v pm2 >/dev/null 2>&1 && pm2 ls || echo "pm2: not installed"

echo
echo "== nginx -t =="
command -v nginx >/dev/null 2>&1 && sudo nginx -t || echo "nginx: not installed"

echo
echo "== listening ports =="
sudo ss -tulpn || true

echo
echo "== /etc/nginx/sites-enabled =="
ls -al /etc/nginx/sites-enabled || true

echo
echo "== certbot certificates =="
command -v certbot >/dev/null 2>&1 && sudo certbot certificates || echo "certbot: not installed"
REMOTE
