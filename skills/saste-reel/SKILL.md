---
name: saste-reel
description: Make an @saste.pixels Instagram Reel / YouTube Short (1080×1920, Hindi/Hinglish comedy voiceover, retro 8-bit pixel animation made in code) in the channel's fixed brand theme: Midnight Slate + Pixel Yellow + Coral, the pixel-guy logo mascot, chiptune score, "₹0 budget" jokes, follow-button CTA and CRT power-down outro. Use this skill whenever the user gives an idea, topic, script or news item for a reel, short, intro, explainer or video for Saste Pixels / saste.pixels / "my channel", asks to "make a reel/short/video about …", or wants to change, re-voice or re-render an existing saste reel, even if they don't name the skill.
---

# Saste Pixels reel

You direct and produce a short vertical film for the **@saste.pixels** channel, entirely in code: a canvas page renders each
frame, headless Chrome captures it, numpy synthesizes the chiptune and SFX, the client's **Bunty** voice carries the script,
and ffmpeg masters it. The look, sound and voice are fixed by the brand; the idea, script, jokes, set pieces and pixel art
are yours to create for each topic.

Files in this skill (paths relative to the skill's base directory):
- `references/BRAND.md` — the brand bible (colours, type, safe zones, mascot, signature moves, sound, tone). **Read it first, every time.**
- `references/COMPONENTS.md` — the brand.js / chip.py API.
- `references/VOICE.md` — Bunty hand-off, speech check, timing plan, Madhur fallback.
- `template/` — a new reel's starting files (via `scripts/new_reel.sh`).
- `engine/` — render tools + brand kit (installed to `~/.saste-skills/engine` by `scripts/setup.sh`).
- `examples/saste-pixels-intro/` — the approved channel intro, built on the kit (source, Bunty voice files, final mp4).
  Read its `main.js` and `timeline.js` before writing a new reel: it shows every component in use.

## 0. Setup (each session, takes seconds once installed)
```sh
sh "<skill dir>/scripts/setup.sh"        # last line: SASTE_ENGINE=<path>
```
It needs Node ≥ 20, ffmpeg ≥ 7 and Python ≥ 3.10 on the machine. If it reports missing tools, tell the user what to install
(don't install system software yourself). First run downloads a headless Chrome and the Python packages (~400 MB); the
first speech check downloads the Whisper "small" model (~480 MB).
Run every engine command from `$SASTE_ENGINE` with the reel's absolute path.

## 1. Brief → script (the one stop for the user)
From the user's idea, decide the angle yourself and write the script:
- 3–6 lines, Hinglish, ~15–35 s spoken: **hook** (first 3 s, a fake-out or a surprising claim) → **title/mascot** → **content**
  (the actual info: facts, steps, a breakdown, 3 points max per montage) → **CTA punchline** with a ₹0-budget threat.
- Witty, self-aware, information first; facts must be right. For post-mortems and gyan, check facts (web search when
  available) and keep `FACTS.md` (claim → source).
- Each line has Roman `text` (captions), Devanagari `say` (for Bunty), and `asr` (Devanagari, no punctuation).

Show the user the script (Roman + Devanagari, numbered) and the plan in a few lines, and ask them to generate the Bunty
lines (`references/VOICE.md` has the hand-off message). This is the only place you stop and wait. Ask any real
question (facts you can't verify, a name or logo to include) in the same message. If they want a quick draft first, use the
Madhur fallback and carry on.

## 2. Scaffold and pre-produce (while the voice is being made)
```sh
sh "<skill dir>/scripts/new_reel.sh" "<cwd>/<reel-slug>"      # lowercase-hyphen slug of the topic
```
Write `lines.json`, and a short `TREATMENT.md`: logline, beat list (which line → which visual), the topic's set pieces,
the 2–4 new pixel icons it needs, and the score choice (`party` / `sneaky` / `hype`). Draw the new icons and set pieces
now (in `main.js` or `icons.js`, see COMPONENTS.md "Writing new pixel art") and check them with stills (below), using rough
times. The topic must look like *this* topic: new art every reel, and the brand moves around it.

## 3. Voice in → timing plan
When `voice_bunty/l1.mp3 …` exist (VOICE.md):
```sh
cd "$SASTE_ENGINE"; P=.venv/bin/python
$P -I saste/voice/prep_voice.py <reel>/voice_bunty <reel>/voice_b
$P -I saste/voice/asr_hi.py <reel>/lines.json <reel>/voice_b      # must end "mismatches: 0"
$P saste/voice/plan.py <reel> --voice voice_b                      # word times → vo_plan.json
```
A DIFF line means a wrong or missing phrase: ask the client to regenerate that line (or, if it sounds right, put the heard text in `asr`).

## 4. Build the film
1. **timeline.js** — `VO` from `vo_plan.json` starts; every `T` hit on the onset of the word it illustrates; `CAPS` in 3–6 word
   chunks with word onsets `w` and key words `k`; `events()` gets one SFX per visual hit. `DUR` = power-down end + ~0.35 s.
2. **main.js** — scenes from brand components + the topic art. Keep the brand skeleton (hook → tear → mascot/title →
   content → CTA → power-down) unless the idea needs another order; keep content inside the safe zones.
3. **mix.py** — pick the progression, riser/silence/groove/tape-stop around the cues.
4. Review stills before the full render:
   ```sh
   node core/render/still.mjs <reel> 1 3 5 8 … --size 1080x1920
   .venv/bin/python core/render/sheet.py <reel>/stills/sheet.jpg <reel>/stills/t_*.jpg --cols 6 --w 300
   ```
   Look at the sheet: centring (content on x = 540), nothing in the bottom 20 % / right 15 % except captions, caption never
   overlapping content, Silkscreen only at multiples of 8 px, icons readable at phone size.
5. Full build: `sh <reel>/build.sh` (Bunty) or `VOICE=voice sh <reel>/build.sh` (Madhur draft). It renders at 30 fps, mixes, masters
   to −14 LUFS and writes `<slug>.mp4`, `poster.jpg`, `subtitles_hi-latn.srt`.

## 5. Check, then deliver
- `ffprobe`: h264 + aac, 1080×1920, 30 fps, the expected duration.
- Sync: transcribe the final mp4 with faster-whisper (language "hi", word timestamps) and compare key words to their `T` hits
  (aim ≤ 50 ms). Fix any hit that's off by more than ~0.1 s.
- Contact sheet of the final file every ~1 s; one more look at the punchline and the last second.
- Fix what you find in one round, re-check, then deliver: the mp4 path, its length, what each beat does, and anything you
  changed from the brief. `CREDITS` in the reel folder: Bunty voice (client), fonts (OFL), synthesized music/SFX, any
  third-party material and its licence.

## Changing the brand itself
If the user changes the theme (a colour, the handle, the voice, a signature move), change it in `engine/saste/brand.js` /
`chip.py` / `references/BRAND.md` in **the repo they push** (ask where it is if it isn't the skill folder you're running
from), then re-run `setup.sh`. Don't patch `~/.saste-skills/engine` directly: setup overwrites it.
