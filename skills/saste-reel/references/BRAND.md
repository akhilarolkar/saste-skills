# Saste Pixels — brand bible

The look, sound and voice of **@saste.pixels** (Instagram Reels + YouTube Shorts). Every reel follows this. The reference
film is the skill's `examples/saste-pixels-intro/` (the channel intro the client approved).

## Contents
1. Identity & tone · 2. Canvas & safe zones · 3. Colour · 4. Type · 5. The mascot (logo) · 6. Motion · 7. Recurring moves ·
8. Sound · 9. Voice & script · 10. Don'ts

## 1. Identity & tone
- **Channel promise:** "Hollywood ka budget toh nahi tha" — zero-budget pixel animation that explains things properly.
  Three pillars: **full post-mortem** (deep-dive breakdowns), **dimaag hilane wala gyan** (mind-bending info),
  **full-on bakchodi** (comedy). Most reels mix all three: real information delivered with self-aware jokes.
- **The running joke is the budget.** ₹0 / ₹12 budgets, "₹0 VERSION", fake "HOLLYWOOD VFX" loaders that crash,
  things breaking into pixels. Cheapness is the brand, so lean into it, but the craft (timing, sync, clean type) is never cheap.
- **Tone:** witty, self-aware Indian storyteller, Hinglish. Punchy, never preachy. Slang is fine; profanity is censored on screen
  (`BAKC**DI`) and spoken cleanly by the voice.

## 2. Canvas & safe zones
- 1080×1920, 30 fps, H.264 + AAC, −14 LUFS. Length to fit the voice (reels so far 15–30 s; longer explainers up to ~60 s).
- Content centred on **x = 540** and shifted **40 px below centre** (`DY`): on a phone this reads as optically centred.
- Keep key text/elements out of the **bottom 20 %** (y > 1536) and the **right 15 %** (x > 918) where the IG UI sits;
  captions sit at y ≈ 1470. Top-left (60,170) belongs to the watermark.

## 3. Colour (exact values; brand.js `C`)
| Token | Hex | Use |
|---|---|---|
| bg | `#0F172A` Deep Midnight Slate | every background, with the drifting 40 px pixel grid + twinkling cells |
| bg2 | `#1E293B` | card fills |
| text | `#F8FAFC` Warm Off-White | primary text, outlines of doodles |
| yel | `#FACC15` Electric Pixel Yellow | primary accent: key caption words, stamps, buttons, progress |
| red | `#FB7185` Retro Coral Red | secondary accent: errors, comedy, stamp shadows, the logo's red lens |
| mute | `#94A3B8` | secondary text |
| navy | `#101826` | logo ink, panel fills, button text |
Flashes cap at ~60 % (a full-white frame reads as a glitch in the player). One coral flash per reel is plenty.

## 4. Type (fonts in `engine/saste/assets/fonts`, all OFL)
- **Plus Jakarta Sans ExtraBold** (`F.sans`): captions (58 px), big headline words.
- **Silkscreen Bold** (`F.pix`): pixel stamps and tags (SASTE PIXELS, card tags). **Only at multiples of 8 px** (152, 64, 48, 40, 32), otherwise
  the glyphs smear. Its "W" reads like a heart at button size → use Space Mono for words with W in small UI.
  Silkscreen has no ₹ glyph.
- **Space Mono Bold** (`F.mono`): handle, budget counters, ₹ amounts, badges, error text, button labels.
- Captions: Hinglish in Roman script, karaoke style (unspoken words dim, the current word lifts), key words in yellow.

## 5. The mascot (logo)
- `engine/saste/assets/logo.png` is the original; `logo_circle.png` is masked to the yellow circle (the original has a
  stray sparkle mark bottom-right: always use the circle version).
- He's a pixel guy with big hair and glasses: one **white** lens, one **coral** lens. The coral lens is his signature: it
  glitches when something goes wrong, and survives into the ₹0 stick-figure version.
- Moves he has: spring-drop with squash + pixel-pop resolve, beat bob, nervous shake, lens glitch, pixel dissolve into the
  wobbly MS-Paint doodle (`doodle()`), losing pixel blocks (`holes`). Keep him on screen in most reels, usually as a
  small bobbing mascot near the top (y ≈ 470, 250 px) while content plays below.

## 6. Motion
- Things **slam in** (scale 1.7 → 1 with overshoot in ~0.14 s), never fade in. Cards **whip** in from the right and out to the left.
- Pixel logic: mosaic resolves, cell dissolves, stepped jitter at frame rate, doodles boil at 8 fps; camera-like moves
  (push-ins, bobs) stay smooth.
- **Every visual hit lands on a spoken word** (from Whisper word timestamps) or a music beat (128 BPM = 0.469 s).
- Vary the pace: one breath/hold, one acceleration (the card montage gets faster), a real silence before the biggest hit.

## 7. Recurring moves (the signature)
- **Fake-out hook** (first 3 s): something "premium" (Hollywood loader, fancy title) crashes into `ERROR: ₹0 BUDGET FOUND`
  with a coral flash + glitch shake, then a **screen-tear** into the real content.
- **Stamp + badge:** pixel words stamp in on the beat; a tilted Space-Mono badge adds the joke (`BUDGET: ₹12`).
- **Card montage + recap row** for lists (3 items max per montage), each card with a 20×20 pixel icon.
- **CTA:** push in on the mascot, pixel cursor clicks the yellow `FOLLOW @saste.pixels` button (✓ badge, +1, burst).
- **Outro:** retro CRT **power-down** (frame → line → dot) with a blip and tape-stop. Every reel ends this way.
- Persistent **watermark** top-left, 70 %.

## 8. Sound (all synthesized: `engine/saste/chip.py`)
- 8-bit chiptune at **128 BPM**: 4-bit triangle bass bouncing octaves, 12.5 % pulse arpeggio, noise hats, kick/snare.
  Progressions: `party` (Am F C G, default), `sneaky` (Am Gm F E: mysteries/post-mortems), `hype` (C G Am F).
- Music bed **−20 dB under the voice** (+4 dB in gaps). It thins under the CTA, stops dead at the fake-out error (a real
  silence), and tape-stops into the power-down.
- SFX vocabulary: tick (loaders), buzz (error), glitch, whoosh (cuts, card whips), thump+pop (landing), stamp, ding, coin,
  haha (comedy), click (cursor), blip, dissolve, boing, powerdown. One sound per visual hit, placed from the same timeline.

## 9. Voice & script
- **Voice: "Bunty"** (Hindi, male, young, tone *Excited*, a "Reel Perfect Voice" on the client's voiceover service). The client
  generates the lines and drops them in `voice_bunty/` as `l1.mp3`, `l2.mp3`, … The fallback is Microsoft `hi-IN-MadhurNeural` at +5 % (edge-tts).
- Script: Hinglish, conversational, 3–5 lines; one line per beat/scene. Give the client each line in **Devanagari** (best
  pronunciation), e.g. "बकचोदी" for "bakchodi". End with a CTA that threatens a funny ₹0 consequence ("warna agla video sach
  mein zero budget mein banega!").
- Details and the exact hand-off message: `VOICE.md`.

## 10. Don'ts
- No stock footage, no AI video, no gradients that aren't dithered/pixel, no soft drop shadows (only hard pixel offsets).
- No fades to black mid-reel (the only black is the final power-down).
- Don't cover the bottom 20 % / right 15 % with anything that must be read.
- Don't use other channels' names, logos, characters or music.
