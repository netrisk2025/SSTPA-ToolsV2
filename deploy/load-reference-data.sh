#!/usr/bin/env bash
# SSTPA Reference Data load step (SRS §9.7): verify the artifact SHA-256,
# extract the Cypher load script, execute it against the deployment Neo4j via
# cypher-shell, and verify the post-load node count. Idempotent (MERGE).
#
# Usage: ./load-reference-data.sh <sstpa-ref-data-*.tar.gz> [compose-project-dir]
#
# 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
set -euo pipefail

ARTIFACT="${1:?usage: load-reference-data.sh <artifact.tar.gz> [deploy-dir]}"
DEPLOY_DIR="${2:-$(cd "$(dirname "$0")" && pwd)}"
PASSWORD="${SSTPA_NEO4J_PASSWORD:-sstpa-dev-password}"

echo "==> Verifying artifact checksum"
sha256sum -c "${ARTIFACT}.sha256"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
tar -xzf "$ARTIFACT" -C "$WORK"

SCRIPT=$(ls "$WORK"/sstpa-ref-load-*.cypher)
echo "==> Load script: $(basename "$SCRIPT")"

echo "==> Copying into neo4j container and executing (this takes a few minutes)"
cd "$DEPLOY_DIR"
NEO4J_CONTAINER=$(docker compose ps -q neo4j)
docker cp "$SCRIPT" "$NEO4J_CONTAINER:/tmp/ref-load.cypher"
docker compose exec -T neo4j cypher-shell -u neo4j -p "$PASSWORD" -f /tmp/ref-load.cypher > /dev/null

echo "==> Verifying post-load counts against the validation report"
EXPECTED=$(grep -o 'Expected reference node count[^0-9]*[0-9]*' "$SCRIPT" | grep -o '[0-9]*$')
ACTUAL=$(docker compose exec -T neo4j cypher-shell -u neo4j -p "$PASSWORD" --format plain \
  "MATCH (n:REF) WHERE coalesce(n.IsFrameworkRoot, false) = false RETURN count(n);" | tail -1)
echo "    expected=$EXPECTED actual=$ACTUAL"
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "FAIL: reference node count mismatch" >&2
  exit 1
fi
echo "==> Reference data loaded and verified."
