#!/usr/bin/env sh
# Checks a running stack through its public address, the way a browser
# reaches it: the web app, the API at /api, the docs at /docs, and (with a
# login) an upload that has to come back through /files.
#
#   docker/smoke-test.sh [base-url]          # default http://localhost
#   SMOKE_EMAIL=dev@biosfera.local SMOKE_PASSWORD=biosfera123 docker/smoke-test.sh
#
# The login is the seeded development user (docker compose run --rm seed).
# Exits non-zero on the first failed check.
set -eu

BASE=${1:-http://localhost}
BASE=${BASE%/}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

pass() { echo "ok    $1"; }
fail() {
  echo "FAIL  $1" >&2
  exit 1
}

# status <url> [curl args...]: prints the HTTP status, 000 when unreachable.
status() {
  url=$1
  shift
  # curl itself writes 000 when nothing answers.
  curl -sS -o "$TMP/body" -w '%{http_code}' "$@" "$url" 2>/dev/null || true
}

expect() {
  name=$1 want=$2 url=$3
  shift 3
  got=$(status "$url" "$@")
  [ "$got" = "$want" ] || fail "$name: $url answered $got, expected $want"
  pass "$name"
}

expect "web home page" 200 "$BASE/"
# The page must not send browsers to an address baked in at build time.
if grep -q "localhost:5500" "$TMP/body"; then
  fail "web home page links to localhost:5500"
fi
expect "API through /api" 200 "$BASE/api/api-json"
grep -q '"openapi"' "$TMP/body" || fail "/api/api-json is not the OpenAPI document"
expect "docs through /docs" 200 "$BASE/docs/"
expect "unknown API route is the API's 404" 404 "$BASE/api/does-not-exist"

if [ -z "${SMOKE_EMAIL:-}" ]; then
  echo "skip  login and upload (set SMOKE_EMAIL and SMOKE_PASSWORD)"
  exit 0
fi

expect "login" 201 "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"$SMOKE_PASSWORD\"}"
TOKEN=$(sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p' "$TMP/body")
[ -n "$TOKEN" ] || fail "login returned no token"

expect "current user" 200 "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN"

# A 1x1 PNG.
printf '\211PNG\r\n\032\n\000\000\000\rIHDR\000\000\000\001\000\000\000\001\010\006\000\000\000\037\025\304\211\000\000\000\rIDATx\234c\370\377\377?\000\005\376\002\376\247\065\201\204\000\000\000\000IEND\256B`\202' >"$TMP/pixel.png"
expect "upload" 201 "$BASE/api/blobs/blob" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TMP/pixel.png;type=image/png"
URL=$(cat "$TMP/body")
echo "      stored at $URL"

# The returned address is built from PUBLIC_URL; read it back through this
# base so the check also works when PUBLIC_URL is not reachable from here.
PATH_PART=/${URL#*://*/}
expect "uploaded file readable at $PATH_PART" 200 "$BASE$PATH_PART"
cmp -s "$TMP/body" "$TMP/pixel.png" || fail "uploaded file came back different"
pass "uploaded file is identical"
# The web app reads files from /files/<directory>/<name>.
NAME=${URL##*/}
expect "uploaded file readable at /files/blob/$NAME" 200 "$BASE/files/blob/$NAME"
