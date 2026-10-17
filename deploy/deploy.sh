#!/usr/bin/env bash
# Manual deployment (no CI/CD), same technique as the shomaaa/cosmetics projects:
# build image locally, stream it into k3s' containerd over SSH, apply the manifests, wait for the rollout.
# Prerequisites: Docker, WireGuard access to 10.20.0.1, DNS A record crypto.shomaaa.ir -> 193.151.152.230 (DNS-only).
set -euo pipefail
cd "$(dirname "$0")/.."
SSH_TARGET="${SSH_TARGET:-opsadmin@10.20.0.1}"
K="sudo k3s kubectl -n crypto"
SHA=$(git rev-parse --short HEAD 2>/dev/null || echo manual)
DIRTY=$(git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null || echo "-dirty")
TAG="${SHA}${DIRTY}"
echo "==> building web image crypto-local/web:${TAG}"
docker build -q -t "crypto-local/web:${TAG}" --build-arg NEXT_PUBLIC_SITE_URL=https://crypto.shomaaa.ir .
echo "==> importing image into k3s containerd"
docker save "crypto-local/web:${TAG}" | ssh "$SSH_TARGET" "sudo k3s ctr -n k8s.io images import -" >/dev/null
echo "==> applying manifests"
for f in deploy/k8s/*.yaml; do sed -e "s#__WEB_TAG__#${TAG}#g" "$f" | ssh "$SSH_TARGET" "sudo k3s kubectl apply -f -"; done
ssh "$SSH_TARGET" "$K rollout status deploy/web --timeout=180s"
echo "==> done: web=${TAG}"
