#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
PORT="${PORT:-8000}"
echo "CROWN OF FOOTBALL is available at http://127.0.0.1:${PORT}/PLAY_NOW.html"
exec python3 -m http.server "$PORT"
