#!/usr/bin/env sh
# Backs up a running production stack: the bundled database (db profile) and
# the uploaded files (bundled S3 store, or the API's uploads volume). Run it
# from the repository root, by hand or from cron:
#
#   docker/backup.sh [destination]              # default ./backups
#   KEEP_DAYS=30 docker/backup.sh /srv/backups
#
# COMPOSE overrides how the stack is addressed. Backups older than KEEP_DAYS
# (default 14) are deleted from the destination. Copy the destination off the
# server too (rclone, restic, rsync): a backup on the same disk does not
# survive losing the server. Restoring is described in the hosting guide.
set -eu

DEST=${1:-backups}
KEEP_DAYS=${KEEP_DAYS:-14}
COMPOSE=${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.production}
STAMP=$(date +%Y-%m-%d_%H%M%S)

mkdir -p "$DEST"
running=$($COMPOSE ps --services --status running)
is_running() { echo "$running" | grep -qx "$1"; }

if is_running postgres; then
  $COMPOSE exec -T postgres pg_dump -U postgres -Fc biosfera >"$DEST/db-$STAMP.dump"
  echo "database  -> $DEST/db-$STAMP.dump"
else
  echo "database  skipped: the bundled postgres is not running (back up your own database where it lives)"
fi

if is_running s3; then
  $COMPOSE exec -T s3 tar czf - -C /data . >"$DEST/files-$STAMP.tar.gz"
  echo "files     -> $DEST/files-$STAMP.tar.gz (bundled S3 store)"
elif is_running api; then
  $COMPOSE exec -T api tar czf - -C /app/apps/api/uploads . >"$DEST/files-$STAMP.tar.gz"
  echo "files     -> $DEST/files-$STAMP.tar.gz (API uploads volume; empty when files live in an external bucket)"
fi

find "$DEST" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'files-*.tar.gz' \) \
  -mtime +"$KEEP_DAYS" -print -delete | sed 's/^/removed   /'
