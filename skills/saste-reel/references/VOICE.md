# Voice: Bunty (default) and Madhur (fallback)

## The default: Bunty
"Bunty" is a Hindi male "Reel Perfect Voice" (young, social-media, tone **Excited**) on the client's own voiceover
service. Claude can't reach that service, so the client generates the audio. The hand-off:

1. Write the script as `lines.json` in the reel folder: one entry per line, `l1`, `l2`, … (3–5 lines, one per beat).
   - `text`: Roman Hinglish (used for captions and the .srt).
   - `say`: the same line in **Devanagari** (what Bunty should read). Devanagari pronounces far better than Roman.
     Spell slang phonetically ("बकचोदी"). Use "..." for comic pauses, commas for breaths.
   - `asr`: the Devanagari line without punctuation (what the speech check compares against).
2. Send the client a message like this (in their language), with each `say` line numbered:
   > Bunty (Excited) se yeh lines alag-alag generate karke `<reel>/voice_bunty/` mein `l1.mp3`, `l2.mp3`, … naam se save kar do:
   > l1: …
   > l2: …
   (A single take of the whole script also works: split it at the pauses with ffmpeg `silencedetect`.)
3. Wait for the files, then go on (prep → check → plan).

While you wait, don't build anything that depends on exact timing. You can draw icons and set pieces, and try the look with stills.

## Prep, check, plan (run from $SASTE_ENGINE)
```sh
P=$SASTE_ENGINE/.venv/bin/python
$P -I saste/voice/prep_voice.py <reel>/voice_bunty <reel>/voice_b      # → 24 kHz mono, trimmed, dur.json
$P -I saste/voice/asr_hi.py <reel>/lines.json <reel>/voice_b           # Whisper (hi) check + words.json; exit 0 = all OK
$P saste/voice/plan.py <reel> --voice voice_b [--gap 0.15] [--gaps l2=0.35]   # absolute word times → vo_plan.json
```
- `asr_hi.py` compares by character similarity (≥ 0.75). Whisper misspells Hinglish words ("होलीवोर" for हॉलीवुड): that's fine if
  the score passes. A DIFF means a missing or wrong phrase. Tell the client which line to regenerate.
- `plan.py` lays the lines end to end (0.15 s gaps; `--gaps` for a longer dramatic pause before a line) and prints every
  word's time. Build `VO`, `T` and `CAPS` in `timeline.js` from these numbers: hits land on the stressed word's onset.
- Bunty runs ~5 % faster than Madhur. Retime if the voice changes.

## Fallback: Madhur (edge-tts, online)
When the client wants a quick draft before recording, or Bunty is unavailable:
```sh
$P core/tts/tts_edge.py <reel>/lines.json <reel>/voice --voice hi-IN-MadhurNeural --rate +5%
$P -I saste/voice/asr_hi.py <reel>/lines.json <reel>/voice
$P saste/voice/plan.py <reel> --voice voice
```
Build with `VOICE=voice sh build.sh`. Other Indian male edge voices: `ur-IN-SalmanNeural` (reads Devanagari, Urdu accent),
`en-IN-PrabhatNeural` (Indian English; give it the Roman text). Microsoft's terms apply to commercial use.
