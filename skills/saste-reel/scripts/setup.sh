#!/bin/sh
# saste-reel setup: installs the engine (render tools + brand kit + Python/Node deps) into $SASTE_HOME (default ~/.saste-skills).
# Safe to run every time: it re-syncs the engine from the skill and only reinstalls packages when their lists change.
# Prints SASTE_ENGINE=<path> on its last line.
set -e
SKILL_DIR=$(cd "$(dirname "$0")/.." && pwd)
SASTE_HOME=${SASTE_HOME:-$HOME/.saste-skills}
ENGINE="$SASTE_HOME/engine"
miss=""
command -v node >/dev/null 2>&1 || miss="$miss node(>=20)"
command -v npm >/dev/null 2>&1 || miss="$miss npm"
command -v ffmpeg >/dev/null 2>&1 || miss="$miss ffmpeg(>=7)"
command -v ffprobe >/dev/null 2>&1 || miss="$miss ffprobe"
PY=$(command -v python3.12 || command -v python3.11 || command -v python3 || true)
[ -n "$PY" ] || miss="$miss python3(>=3.10)"
if [ -n "$miss" ]; then echo "MISSING system tools:$miss — install them, then run setup again." >&2; exit 3; fi
nv=$(node -p 'process.versions.node.split(".")[0]'); [ "$nv" -ge 20 ] || { echo "node $nv found; need >= 20" >&2; exit 3; }

mkdir -p "$ENGINE"
# sync engine files (keep node_modules/.venv)
(cd "$SKILL_DIR/engine" && tar cf - --exclude=node_modules --exclude=.venv --exclude=__pycache__ .) | (cd "$ENGINE" && tar xf -)

# node deps + headless browser
sum() { cksum "$1" | cut -d' ' -f1; }
if [ ! -d "$ENGINE/node_modules/playwright-core" ] || [ "$(cat "$ENGINE/.npm.sum" 2>/dev/null)" != "$(sum "$ENGINE/package.json")" ]; then
  (cd "$ENGINE" && npm install --no-audit --no-fund --loglevel=error) && sum "$ENGINE/package.json" > "$ENGINE/.npm.sum"
fi
(cd "$ENGINE" && node node_modules/playwright-core/cli.js install chromium-headless-shell >/dev/null)

# python venv
if [ ! -x "$ENGINE/.venv/bin/python" ]; then "$PY" -m venv "$ENGINE/.venv"; fi
if [ "$(cat "$ENGINE/.pip.sum" 2>/dev/null)" != "$(sum "$ENGINE/requirements.txt")" ]; then
  "$ENGINE/.venv/bin/python" -m pip install -q --upgrade pip
  "$ENGINE/.venv/bin/python" -m pip install -q -r "$ENGINE/requirements.txt" && sum "$ENGINE/requirements.txt" > "$ENGINE/.pip.sum"
fi
echo "engine ready"
echo "SASTE_ENGINE=$ENGINE"
