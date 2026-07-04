#!/usr/bin/env bash
# SSTPA Example Data load step (SRS §3.6): verify the artifact SHA-256,
# extract the Cypher load script, guard against HID collisions with
# existing user-owned Core System Data, execute against the deployment
# Neo4j via cypher-shell, and verify the post-load node count.
# Idempotent (MERGE on HID). Mirrors deploy/load-reference-data.sh.
#
# Usage: ./load-example-data.sh <sstpa-example-*.tar.gz> [compose-project-dir]

set -euo pipefail

ARTIFACT="${1:?usage: load-example-data.sh <artifact.tar.gz> [deploy-dir]}"
DEPLOY_DIR="${2:-$(cd "$(dirname "$0")/../../deploy" && pwd)}"

# Neo4j password: from environment, else from the deploy .env file.
PASSWORD="${SSTPA_NEO4J_PASSWORD:-}"
if [ -z "${PASSWORD}" ] && [ -f "${DEPLOY_DIR}/.env" ]; then
  PASSWORD="$(sed -n 's/^SSTPA_NEO4J_PASSWORD=//p' "${DEPLOY_DIR}/.env" | tail -1)"
fi
if [ -z "${PASSWORD}" ]; then
  echo "FAIL: SSTPA_NEO4J_PASSWORD is not set and ${DEPLOY_DIR}/.env does not define it." >&2
  exit 1
fi

# Portable SHA-256 verification (Linux: sha256sum, macOS: shasum -a 256).
if command -v sha256sum >/dev/null 2>&1; then
  CHECKSUM_CMD=(sha256sum)
elif command -v shasum >/dev/null 2>&1; then
  CHECKSUM_CMD=(shasum -a 256)
else
  echo "FAIL: need sha256sum or shasum on PATH" >&2
  exit 1
fi

echo "==> Verifying artifact checksum"
(cd "$(dirname "${ARTIFACT}")" && "${CHECKSUM_CMD[@]}" -c "$(basename "${ARTIFACT}").sha256")

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
tar -xzf "$ARTIFACT" -C "$WORK"

SCRIPT=$(ls "$WORK"/sstpa-example-*-load-*.cypher)
echo "==> Load script: $(basename "$SCRIPT")"

cd "$DEPLOY_DIR"
NEO4J_CONTAINER=$(docker compose ps -q neo4j)
if [ -z "${NEO4J_CONTAINER}" ]; then
  echo "FAIL: the neo4j service is not running. Start the Backend first: (cd ${DEPLOY_DIR} && docker compose up -d)" >&2
  exit 1
fi

CYPHER() { docker compose exec -T neo4j cypher-shell -u neo4j -p "$PASSWORD" --format plain "$1"; }

# Collision guard: the artifact claims a fixed set of Tier-1 SoI indexes
# (script header). Abort if any node in those sub-graphs, or the example
# Project root, exists with a different Creator — that is user Core data
# this load would MERGE into.
INDEXES=$(grep -o '^// Tier-1 SoI indexes: .*' "$SCRIPT" | sed 's|^// Tier-1 SoI indexes: ||')
ROOT_HID=$(grep -o '^// Project root HID: .*' "$SCRIPT" | sed 's|^// Project root HID: ||')
IDX_LIST=$(printf "'%s', " ${INDEXES}); IDX_LIST=${IDX_LIST%, }
echo "==> Collision guard (Tier-1 indexes: ${INDEXES}; root: ${ROOT_HID})"
FOREIGN=$(CYPHER "MATCH (n:SSTPA) WHERE coalesce(n.Creator,'') <> 'SSTPA Tools'
  AND ((n.SoIIndex IS NOT NULL AND split(n.SoIIndex,'.')[0] IN [${IDX_LIST}])
       OR n.HID = '${ROOT_HID}')
  RETURN count(n);" | tail -1 | tr -d '[:space:]"')
if [ "${FOREIGN}" != "0" ]; then
  echo "FAIL: ${FOREIGN} user-owned node(s) already occupy the example HID space (Tier-1 indexes ${INDEXES})." >&2
  echo "      Rebuild the artifact with different indexes: build_firesat.py --tier1-base <N>" >&2
  exit 1
fi

echo "==> Copying into neo4j container and executing"
docker cp "$SCRIPT" "$NEO4J_CONTAINER:/tmp/example-load.cypher"
docker compose exec -T neo4j cypher-shell -u neo4j -p "$PASSWORD" -f /tmp/example-load.cypher > /dev/null
docker compose exec -T neo4j rm -f /tmp/example-load.cypher

echo "==> Verifying post-load counts against the load script header"
EXPECTED=$(grep -o 'Expected example node count[^0-9]*[0-9]*' "$SCRIPT" | grep -o '[0-9]*$' | head -1)
ACTUAL=$(CYPHER "MATCH (n:SSTPA {Creator: 'SSTPA Tools'})
  WHERE n.SoIIndex = '' OR split(n.SoIIndex,'.')[0] IN [${IDX_LIST}]
  RETURN count(n);" | tail -1 | tr -d '[:space:]"')
if [ "${ACTUAL}" != "${EXPECTED}" ]; then
  echo "FAIL: expected ${EXPECTED} example nodes, found ${ACTUAL}" >&2
  exit 1
fi
echo "OK: ${ACTUAL} example nodes loaded (idempotent; safe to re-run)"
