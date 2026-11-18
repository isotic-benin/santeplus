#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT/.mongo/server/bin/mongod"
DATA="$ROOT/.mongo/data"
LOG="$ROOT/.mongo/mongod.log"
PID="$ROOT/.mongo/mongod.pid"
PORT="${MONGODB_PORT:-27017}"

command="${1:-start}"

if [[ ! -x "$BIN" ]]; then
  echo "MongoDB local introuvable dans .mongo/server."
  echo "Utilise MongoDB Atlas ou installe MongoDB, puis mets MONGODB_URI dans .env.local."
  exit 1
fi

is_running() {
  [[ -f "$PID" ]] && kill -0 "$(cat "$PID")" 2>/dev/null
}

case "$command" in
  start)
    if is_running; then
      echo "MongoDB tourne déjà sur le port $PORT (pid $(cat "$PID"))."
      exit 0
    fi
    mkdir -p "$DATA"
    "$BIN" --dbpath "$DATA" --port "$PORT" --bind_ip 127.0.0.1 \
      --logpath "$LOG" --pidfilepath "$PID" --fork >/dev/null
    echo "MongoDB démarré sur mongodb://127.0.0.1:$PORT"
    ;;
  stop)
    if is_running; then
      "$BIN" --dbpath "$DATA" --shutdown >/dev/null 2>&1 || kill "$(cat "$PID")"
      rm -f "$PID"
      echo "MongoDB arrêté."
    else
      echo "MongoDB n'est pas en cours d'exécution."
    fi
    ;;
  status)
    if is_running; then
      echo "MongoDB tourne (pid $(cat "$PID")) sur le port $PORT."
    else
      echo "MongoDB est arrêté."
      exit 1
    fi
    ;;
  *)
    echo "Usage : bash scripts/db.sh {start|stop|status}"
    exit 1
    ;;
esac
