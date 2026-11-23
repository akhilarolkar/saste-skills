#!/bin/sh
# Scaffold a new @saste.pixels reel project.
#   sh new_reel.sh <folder>          e.g.  sh new_reel.sh ./chai-economics
# Creates <folder>/ from the skill template (index.html, main.js, timeline.js, mix.py, lines.json, build.sh)
# plus empty voice_bunty/ for the client's Bunty recordings. Refuses to overwrite an existing folder.
set -e
SKILL_DIR=$(cd "$(dirname "$0")/.." && pwd)
[ -n "$1" ] || { echo "usage: sh new_reel.sh <folder>"; exit 2; }
DEST=$1
[ -e "$DEST" ] && { echo "$DEST already exists — pick another name"; exit 1; }
mkdir -p "$DEST/voice_bunty" "$DEST/out"
cp -R "$SKILL_DIR/template/." "$DEST/"
chmod +x "$DEST/build.sh"
echo "new reel → $(cd "$DEST" && pwd)"
