#!/bin/sh
# One command: voice → speech check → events → picture → mix → master → subtitles → poster.
#   VOICE=voice_b (default): the client's Bunty recordings in voice_bunty/l1.mp3 … (prepped into voice_b/)
#   VOICE=voice           : fallback edge-tts hi-IN-MadhurNeural +5 % from lines.json "say" (online)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=$(basename "$HERE" | tr '-' '_')
E=${SASTE_ENGINE:-$HOME/.saste-skills/engine}
[ -f "$E/core/render/video.mjs" ] || { echo "engine missing: run the saste-reel skill's scripts/setup.sh"; exit 1; }
PY="$E/.venv/bin/python"; VOICE=${VOICE:-voice_b}
cd "$E"
if [ "$VOICE" = voice_b ]; then "$PY" -I saste/voice/prep_voice.py "$HERE/voice_bunty" "$HERE/voice_b"
else "$PY" core/tts/tts_edge.py "$HERE/lines.json" "$HERE/voice" --voice hi-IN-MadhurNeural --rate +5%; fi
"$PY" -I saste/voice/asr_hi.py "$HERE/lines.json" "$HERE/$VOICE"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
VOICE_DIR=$VOICE SASTE_ENGINE="$E" "$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 0
node -e "import('file://$HERE/timeline.js').then(m=>require('fs').writeFileSync('$HERE/captions.json', JSON.stringify(m.CAPS.map(c=>({t0:c.t0,t1:c.t1,text:c.text})),null,1)))"
"$PY" core/render/srt.py "$HERE/captions.json" "$HERE/subtitles_hi-latn.srt"
ffmpeg -y -loglevel error -ss "${POSTER_T:-6}" -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
echo "done → $HERE/$NAME.mp4"
